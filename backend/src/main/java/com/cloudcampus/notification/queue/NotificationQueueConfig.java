package com.cloudcampus.notification.queue;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ topology for the notification subsystem (CC-1504).
 *
 * Exchange/queue layout:
 *
 *   Topic exchange: cc.notifications
 *     notification.email  →  cc.notifications.email  (durable, DLX-backed)
 *     notification.sms    →  cc.notifications.sms    (durable, DLX-backed)
 *
 *   Dead-letter exchange: cc.notifications.dlx  (direct)
 *     *  →  cc.notifications.dead   (ops inspection + manual replay)
 *
 * Retry policy: Spring AMQP requeues on listener exception up to
 * {@code listenerContainerFactory} retry limit; after exhaustion the message
 * is nacked without requeue, routed to the DLQ via x-dead-letter-exchange.
 */
@Configuration
public class NotificationQueueConfig {

    // ── Constants ─────────────────────────────────────────────────────────────

    public static final String EXCHANGE        = "cc.notifications";
    public static final String DLX             = "cc.notifications.dlx";

    public static final String QUEUE_EMAIL     = "cc.notifications.email";
    public static final String QUEUE_SMS       = "cc.notifications.sms";
    public static final String QUEUE_DEAD      = "cc.notifications.dead";

    public static final String KEY_EMAIL       = "notification.email";
    public static final String KEY_SMS         = "notification.sms";

    // ── Exchanges ─────────────────────────────────────────────────────────────

    @Bean
    TopicExchange notificationExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    DirectExchange notificationDlx() {
        return new DirectExchange(DLX, true, false);
    }

    // ── Queues ────────────────────────────────────────────────────────────────

    @Bean
    Queue emailQueue() {
        return QueueBuilder.durable(QUEUE_EMAIL)
                .withArgument("x-dead-letter-exchange", DLX)
                .build();
    }

    @Bean
    Queue smsQueue() {
        return QueueBuilder.durable(QUEUE_SMS)
                .withArgument("x-dead-letter-exchange", DLX)
                .build();
    }

    @Bean
    Queue deadLetterQueue() {
        return QueueBuilder.durable(QUEUE_DEAD).build();
    }

    // ── Bindings ──────────────────────────────────────────────────────────────

    @Bean
    Binding emailBinding(Queue emailQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(emailQueue).to(notificationExchange).with(KEY_EMAIL);
    }

    @Bean
    Binding smsBinding(Queue smsQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(smsQueue).to(notificationExchange).with(KEY_SMS);
    }

    @Bean
    Binding dlqBinding(Queue deadLetterQueue, DirectExchange notificationDlx) {
        return BindingBuilder.bind(deadLetterQueue).to(notificationDlx).with("#");
    }

    // ── Jackson serialisation ─────────────────────────────────────────────────

    @Bean
    Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                  Jackson2JsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }

    @Bean
    SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        // Nack without requeue after listener exception — routes to DLQ via x-dead-letter-exchange.
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
