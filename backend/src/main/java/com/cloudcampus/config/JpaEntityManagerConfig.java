package com.cloudcampus.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.cloudcampus",
        entityManagerFactoryRef = "sharedEntityManagerFactory"
)
public class JpaEntityManagerConfig {

    @Bean(name = "sharedEntityManagerFactory")
    @ConditionalOnMissingBean(name = "entityManagerFactory")
    public LocalContainerEntityManagerFactoryBean sharedEntityManagerFactory(
            DataSource dataSource,
            EntityManagerFactoryBuilder builder) {
        
        Map<String, Object> hibernateProperties = new HashMap<>();
        hibernateProperties.put("hibernate.multiTenancy", "SCHEMA");
        hibernateProperties.put("hibernate.format_sql", true);
        hibernateProperties.put("hibernate.jdbc.time_zone", "UTC");
        hibernateProperties.put("hibernate.default_schema", "public");

        return builder
                .dataSource(dataSource)
                .packages("com.cloudcampus")
                .persistenceUnit("cloudcampus-pu")
                .properties(hibernateProperties)
                .build();
    }
}
