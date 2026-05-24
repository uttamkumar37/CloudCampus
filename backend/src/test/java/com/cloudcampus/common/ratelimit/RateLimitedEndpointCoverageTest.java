package com.cloudcampus.common.ratelimit;

import com.cloudcampus.ai.copilot.SchoolAdminAiCopilotController;
import com.cloudcampus.ai.copilot.dto.CopilotQueryRequest;
import com.cloudcampus.attendance.controller.QrAttendanceController;
import com.cloudcampus.attendance.dto.QrMarkRequest;
import com.cloudcampus.exam.controller.ResultController;
import com.cloudcampus.notification.controller.NotificationController;
import com.cloudcampus.notification.dto.PushNotificationRequest;
import com.cloudcampus.notification.dto.SendEmailRequest;
import com.cloudcampus.payment.controller.PaymentController;
import com.cloudcampus.video.controller.VideoController;
import com.cloudcampus.video.dto.VideoUploadRequest;
import com.cloudcampus.whatsapp.controller.WhatsAppController;
import com.cloudcampus.whatsapp.dto.SendWhatsAppRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitedEndpointCoverageTest {

    @Test
    @DisplayName("P0-16 high-cost write/generate endpoints are annotated for API rate limiting")
    void highCostEndpointsAreRateLimited() throws NoSuchMethodException {
        assertRateLimited(SchoolAdminAiCopilotController.class, "query", CopilotQueryRequest.class);
        assertRateLimited(NotificationController.class, "sendEmail", UUID.class, SendEmailRequest.class);
        assertRateLimited(NotificationController.class, "sendPush", UUID.class, PushNotificationRequest.class);
        assertRateLimited(WhatsAppController.class, "send", UUID.class, SendWhatsAppRequest.class);
        assertRateLimited(PaymentController.class, "createOrderStudent", UUID.class);
        assertRateLimited(PaymentController.class, "createOrderAdmin", UUID.class);
        assertRateLimited(PaymentController.class, "createOrderParent", UUID.class, UUID.class);
        assertRateLimited(QrAttendanceController.class, "selfMark", QrMarkRequest.class);
        assertRateLimited(VideoController.class, "initiate", VideoUploadRequest.class);
        assertRateLimited(ResultController.class, "generate", UUID.class, UUID.class);
    }

    private void assertRateLimited(Class<?> controller, String methodName, Class<?>... parameterTypes)
            throws NoSuchMethodException {
        Method method = controller.getDeclaredMethod(methodName, parameterTypes);
        assertThat(method.isAnnotationPresent(RateLimit.class))
                .as("%s#%s must keep @RateLimit", controller.getSimpleName(), methodName)
                .isTrue();
    }
}
