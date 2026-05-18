package com.cloudcampus.experience.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ topology for the DSEP analytics pipeline.
 *
 * Topic exchange: cc.experience.events
 *   experience.event → cc.experience.analytics  (durable, DLX-backed)
 *
 * Dead-letter exchange: cc.experience.dlx (direct)
 *   * → cc.experience.dead
 */
@Configuration
public class ExperienceQueueConfig {

    public static final String EXCHANGE      = "cc.experience.events";
    public static final String DLX           = "cc.experience.dlx";
    public static final String QUEUE_EVENTS  = "cc.experience.analytics";
    public static final String QUEUE_DEAD    = "cc.experience.dead";
    public static final String KEY_EVENT     = "experience.event";

    @Bean
    TopicExchange experienceExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    DirectExchange experienceDlx() {
        return new DirectExchange(DLX, true, false);
    }

    @Bean
    Queue experienceAnalyticsQueue() {
        return QueueBuilder.durable(QUEUE_EVENTS)
                .withArgument("x-dead-letter-exchange", DLX)
                .build();
    }

    @Bean
    Queue experienceDeadQueue() {
        return QueueBuilder.durable(QUEUE_DEAD).build();
    }

    @Bean
    Binding experienceAnalyticsBinding(Queue experienceAnalyticsQueue,
                                        TopicExchange experienceExchange) {
        return BindingBuilder.bind(experienceAnalyticsQueue)
                .to(experienceExchange).with(KEY_EVENT);
    }

    @Bean
    Binding experienceDeadBinding(Queue experienceDeadQueue,
                                   DirectExchange experienceDlx) {
        return BindingBuilder.bind(experienceDeadQueue).to(experienceDlx).with("#");
    }
}
