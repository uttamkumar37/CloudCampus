package com.cloudcampus.storage;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Thin wrapper around the MinIO client for object storage operations (CC-0505).
 * All objects are stored in the single bucket defined by app.minio.bucket.
 * Keys are caller-supplied — typically: {tenantId}/{schoolId}/{studentId}/{filename}.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);
    private static final long MAX_UPLOAD_BYTES = 10L * 1024L * 1024L;
    private static final Map<String, Set<String>> ALLOWED_TYPES = Map.of(
            "pdf", Set.of("application/pdf"),
            "png", Set.of("image/png"),
            "jpg", Set.of("image/jpeg"),
            "jpeg", Set.of("image/jpeg"),
            "webp", Set.of("image/webp"),
            "doc", Set.of("application/msword"),
            "docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    );

    private final MinioClient     minio;
    private final MinioProperties props;

    public StorageService(MinioClient minio, MinioProperties props) {
        this.minio = minio;
        this.props = props;
        ensureBucketExists();
    }

    /** Upload a multipart file and return the object key stored. */
    public void upload(String objectKey, MultipartFile file) {
        if (objectKey == null || objectKey.isBlank() || objectKey.startsWith("/") || objectKey.contains("..")) {
            throw new BadRequestException("Invalid storage object key");
        }
        if (file == null) {
            throw new BadRequestException("Uploaded file is required");
        }

        try (BufferedInputStream in = new BufferedInputStream(file.getInputStream())) {
            ValidatedUpload upload = validate(file, in);
            minio.putObject(PutObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .stream(in, file.getSize(), -1)
                    .contentType(upload.contentType())
                    .build());
        } catch (Exception e) {
            if (e instanceof BadRequestException badRequest) {
                throw badRequest;
            }
            throw new StorageException("Failed to upload object: " + objectKey, e);
        }
    }

    /** Generate a time-limited presigned GET URL. */
    public String presignedGetUrl(String objectKey) {
        try {
            return minio.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .method(Method.GET)
                    .expiry(props.getPresignExpiryMinutes(), TimeUnit.MINUTES)
                    .build());
        } catch (Exception e) {
            throw new StorageException("Failed to generate presigned URL for: " + objectKey, e);
        }
    }

    /** Delete an object — silently succeeds if it doesn't exist. */
    public void delete(String objectKey) {
        try {
            minio.removeObject(RemoveObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            throw new StorageException("Failed to delete object: " + objectKey, e);
        }
    }

    private void ensureBucketExists() {
        try {
            boolean exists = minio.bucketExists(BucketExistsArgs.builder()
                    .bucket(props.getBucket()).build());
            if (!exists) {
                minio.makeBucket(MakeBucketArgs.builder().bucket(props.getBucket()).build());
                log.info("Created MinIO bucket: {}", props.getBucket());
            }
        } catch (Exception e) {
            log.warn("Could not verify/create MinIO bucket '{}': {}", props.getBucket(), e.getMessage());
        }
    }

    private ValidatedUpload validate(MultipartFile file, BufferedInputStream in) throws IOException {
        if (file == null || file.isEmpty() || file.getSize() <= 0) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new BadRequestException("Uploaded file exceeds the 10 MB limit");
        }

        String ext = extension(file.getOriginalFilename());
        Set<String> allowedContentTypes = ALLOWED_TYPES.get(ext);
        if (allowedContentTypes == null) {
            throw new BadRequestException("Unsupported file type");
        }

        String suppliedContentType = normalizeContentType(file.getContentType());
        if (suppliedContentType != null && !allowedContentTypes.contains(suppliedContentType)) {
            throw new BadRequestException("File extension and content type do not match");
        }

        in.mark(16);
        byte[] header = in.readNBytes(16);
        in.reset();
        if (!hasExpectedMagic(ext, header)) {
            throw new BadRequestException("Uploaded file content does not match its extension");
        }

        return new ValidatedUpload(allowedContentTypes.iterator().next());
    }

    private static String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            return "";
        }
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return null;
        }
        int semi = contentType.indexOf(';');
        String value = semi >= 0 ? contentType.substring(0, semi) : contentType;
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean hasExpectedMagic(String ext, byte[] h) {
        return switch (ext) {
            case "pdf" -> startsWith(h, "%PDF-".getBytes());
            case "png" -> h.length >= 8
                    && (h[0] & 0xff) == 0x89 && h[1] == 0x50 && h[2] == 0x4e && h[3] == 0x47
                    && h[4] == 0x0d && h[5] == 0x0a && h[6] == 0x1a && h[7] == 0x0a;
            case "jpg", "jpeg" -> h.length >= 3
                    && (h[0] & 0xff) == 0xff && (h[1] & 0xff) == 0xd8 && (h[2] & 0xff) == 0xff;
            case "webp" -> h.length >= 12
                    && h[0] == 0x52 && h[1] == 0x49 && h[2] == 0x46 && h[3] == 0x46
                    && h[8] == 0x57 && h[9] == 0x45 && h[10] == 0x42 && h[11] == 0x50;
            case "doc" -> h.length >= 8
                    && (h[0] & 0xff) == 0xd0 && (h[1] & 0xff) == 0xcf
                    && (h[2] & 0xff) == 0x11 && (h[3] & 0xff) == 0xe0
                    && (h[4] & 0xff) == 0xa1 && (h[5] & 0xff) == 0xb1
                    && (h[6] & 0xff) == 0x1a && (h[7] & 0xff) == 0xe1;
            case "docx" -> h.length >= 4 && h[0] == 0x50 && h[1] == 0x4b
                    && ((h[2] == 0x03 && h[3] == 0x04)
                    || (h[2] == 0x05 && h[3] == 0x06)
                    || (h[2] == 0x07 && h[3] == 0x08));
            default -> false;
        };
    }

    private static boolean startsWith(byte[] value, byte[] prefix) {
        if (value.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (value[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    private record ValidatedUpload(String contentType) {}
}
