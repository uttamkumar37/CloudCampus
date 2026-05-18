package com.cloudcampus.storage;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.config.MinioProperties;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StorageServiceTest {

    @Mock MinioClient minio;

    private StorageService service;

    @BeforeEach
    void setUp() throws Exception {
        MinioProperties props = new MinioProperties();
        props.setBucket("cloudcampus-test");
        when(minio.bucketExists(any())).thenReturn(true);
        service = new StorageService(minio, props);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("validFiles")
    @DisplayName("[mime] Valid supported files are uploaded")
    void upload_whenSupportedFileAndMagicBytesMatch_putsObject(String name, String contentType, byte[] content)
            throws Exception {
        service.upload("documents/tenant/school/student/" + name, file(name, contentType, content));

        verify(minio).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("[mime] Spoofed extension with wrong magic bytes is rejected")
    void upload_whenExtensionSpoofed_rejectsBeforePutObject() throws Exception {
        MockMultipartFile file = file("transcript.pdf", "application/pdf", bytes("not a pdf"));

        assertThatThrownBy(() -> service.upload("documents/transcript.pdf", file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("content does not match");

        verify(minio, never()).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("[mime] Wrong supplied content type is rejected")
    void upload_whenContentTypeDoesNotMatchExtension_rejectsBeforePutObject() throws Exception {
        MockMultipartFile file = file("photo.png", "application/pdf", png());

        assertThatThrownBy(() -> service.upload("documents/photo.png", file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("content type");

        verify(minio, never()).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("[mime] Content type parameters are normalized")
    void upload_whenContentTypeHasParameters_allowsValidFile() throws Exception {
        service.upload("documents/transcript.pdf",
                file("transcript.pdf", "application/pdf; charset=binary", pdf()));

        verify(minio).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("[mime] Unsupported file type is rejected")
    void upload_whenUnsupportedExtension_rejectsBeforePutObject() throws Exception {
        MockMultipartFile file = file("script.exe", "application/octet-stream", bytes("MZ"));

        assertThatThrownBy(() -> service.upload("documents/script.exe", file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Unsupported file type");

        verify(minio, never()).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("[mime] Oversized upload is rejected")
    void upload_whenFileExceedsLimit_rejectsBeforePutObject() throws Exception {
        byte[] oversized = new byte[(10 * 1024 * 1024) + 1];
        System.arraycopy(pdf(), 0, oversized, 0, pdf().length);
        MockMultipartFile file = file("large.pdf", "application/pdf", oversized);

        assertThatThrownBy(() -> service.upload("documents/large.pdf", file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("10 MB");

        verify(minio, never()).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("[mime] Empty upload is rejected")
    void upload_whenFileEmpty_rejectsBeforePutObject() throws Exception {
        MockMultipartFile file = file("empty.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> service.upload("documents/empty.pdf", file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("empty");

        verify(minio, never()).putObject(any(PutObjectArgs.class));
    }

    private static Stream<Object[]> validFiles() {
        return Stream.of(
                new Object[] { "transcript.pdf", "application/pdf", pdf() },
                new Object[] { "photo.png", "image/png", png() },
                new Object[] { "portrait.jpg", "image/jpeg", jpg() },
                new Object[] { "portrait.jpeg", "image/jpeg", jpg() },
                new Object[] { "banner.webp", "image/webp", webp() },
                new Object[] { "legacy.doc", "application/msword", doc() },
                new Object[] { "letter.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docx() }
        );
    }

    private static MockMultipartFile file(String filename, String contentType, byte[] content) {
        return new MockMultipartFile("file", filename, contentType, content);
    }

    private static byte[] pdf() {
        return bytes("%PDF-1.4 test content");
    }

    private static byte[] png() {
        return new byte[] {
                (byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
                0x00, 0x00, 0x00, 0x0d
        };
    }

    private static byte[] jpg() {
        return new byte[] { (byte) 0xff, (byte) 0xd8, (byte) 0xff, 0x00 };
    }

    private static byte[] webp() {
        return new byte[] {
                0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
                0x57, 0x45, 0x42, 0x50
        };
    }

    private static byte[] doc() {
        return new byte[] {
                (byte) 0xd0, (byte) 0xcf, 0x11, (byte) 0xe0,
                (byte) 0xa1, (byte) 0xb1, 0x1a, (byte) 0xe1
        };
    }

    private static byte[] docx() {
        return new byte[] { 0x50, 0x4b, 0x03, 0x04, 0x14, 0x00 };
    }

    private static byte[] bytes(String value) {
        return value.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
