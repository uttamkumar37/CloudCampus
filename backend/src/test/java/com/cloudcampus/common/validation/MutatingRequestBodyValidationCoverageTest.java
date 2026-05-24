package com.cloudcampus.common.validation;

import jakarta.validation.Valid;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MutatingRequestBodyValidationCoverageTest {

    @Test
    void allJsonRequestBodiesExceptRawWebhooksAreValidated() throws Exception {
        List<String> missing = new ArrayList<>();

        ClassPathScanningCandidateComponentProvider scanner =
                new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(RestController.class));

        for (var candidate : scanner.findCandidateComponents("com.cloudcampus")) {
            Class<?> controller = Class.forName(candidate.getBeanClassName());
            for (Method method : controller.getDeclaredMethods()) {
                Parameter[] parameters = method.getParameters();
                for (int i = 0; i < parameters.length; i++) {
                    Parameter parameter = parameters[i];
                    if (!parameter.isAnnotationPresent(RequestBody.class) || isRawWebhookBody(controller, method, parameter)) {
                        continue;
                    }
                    if (!parameter.isAnnotationPresent(Valid.class)) {
                        missing.add(controller.getSimpleName() + "." + method.getName()
                                + " parameter " + (i + 1) + " (" + parameter.getType().getSimpleName() + ")");
                    }
                }
            }
        }

        assertThat(missing)
                .as("Every structured @RequestBody in controllers should be protected by @Valid")
                .isEmpty();
    }

    private static boolean isRawWebhookBody(Class<?> controller, Method method, Parameter parameter) {
        return controller.getName().equals("com.cloudcampus.payment.controller.PaymentController")
                && method.getName().equals("razorpayWebhook")
                && parameter.getType().equals(String.class);
    }
}
