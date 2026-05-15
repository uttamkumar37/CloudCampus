package com.cloudcampus.attendance.service;

import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.attendance.repository.AttendanceSessionRepository;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * QR-based attendance flow (CC-0802).
 *
 * Teacher flow:
 *   1. POST /v1/teacher/attendance/sessions/{sessionId}/qr
 *      → generates a UUID token, stores cc:qr:{token} = sessionId in Redis (5 min TTL)
 *      → returns { token, qrBase64, expiresAt }
 *
 * Student flow:
 *   2. POST /v1/student/attendance/qr-mark  body: { token }
 *      → validates token against Redis, marks student PRESENT in the session
 */
@Service
public class QrAttendanceService {

    private static final String REDIS_PREFIX    = "cc:qr:";
    private static final int    QR_SIZE         = 280;
    private static final long   TTL_MINUTES     = 5;

    private final AttendanceSessionRepository sessionRepo;
    private final AttendanceRecordRepository  recordRepo;
    private final RedisTemplate<String, String> redis;

    public QrAttendanceService(AttendanceSessionRepository sessionRepo,
                                AttendanceRecordRepository recordRepo,
                                @Qualifier("redisTemplate") RedisTemplate<String, String> redis) {
        this.sessionRepo = sessionRepo;
        this.recordRepo  = recordRepo;
        this.redis       = redis;
    }

    // ── Teacher: generate QR ──────────────────────────────────────────────────

    public record QrResponse(String token, String qrBase64, Instant expiresAt) {}

    public QrResponse generate(UUID sessionId) {
        sessionRepo.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Attendance session not found"));

        String token     = UUID.randomUUID().toString();
        String redisKey  = REDIS_PREFIX + token;
        Instant expiresAt = Instant.now().plusSeconds(TTL_MINUTES * 60);

        redis.opsForValue().set(redisKey, sessionId.toString(), TTL_MINUTES, TimeUnit.MINUTES);

        String qrBase64 = generateQrPngBase64(token);
        return new QrResponse(token, qrBase64, expiresAt);
    }

    // ── Student: self-mark via token ──────────────────────────────────────────

    @Transactional
    public void selfMark(String token, UUID studentId) {
        String redisKey   = REDIS_PREFIX + token;
        String sessionIdStr = redis.opsForValue().get(redisKey);

        if (sessionIdStr == null) {
            throw new BadRequestException("QR token is invalid or has expired");
        }

        UUID sessionId = UUID.fromString(sessionIdStr);
        var session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Attendance session not found"));

        if (session.isFinalized()) {
            throw new BadRequestException("This attendance session is already closed");
        }

        var existing = recordRepo.findBySessionIdAndStudentId(sessionId, studentId);
        if (existing.isPresent()) {
            // Already marked — silently accept (idempotent)
            return;
        }

        AttendanceRecord record = AttendanceRecord.create(
                session.getTenantId(), sessionId, studentId, AttendanceStatus.PRESENT);
        record.setRemarks("Self-marked via QR");
        recordRepo.save(record);
    }

    // ── QR image generation ───────────────────────────────────────────────────

    private static String generateQrPngBase64(String content) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix matrix = new QRCodeWriter()
                    .encode(content, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (WriterException | java.io.IOException e) {
            throw new RuntimeException("QR code generation failed", e);
        }
    }
}
