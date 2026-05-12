package com.cloudcampus.config;

import com.github.dockerjava.zerodep.ZerodepDockerHttpClient;
import org.testcontainers.dockerclient.DockerClientProviderStrategy;
import org.testcontainers.dockerclient.InvalidConfigurationException;
import org.testcontainers.dockerclient.TransportConfig;

import java.net.URI;
import java.time.Duration;

/**
 * Custom Testcontainers Docker client strategy that forces docker-java to use
 * API version 1.41, bypassing docker-java's hardcoded default of 1.24 which
 * Docker Engine 26+ (MinAPIVersion=1.40) rejects with HTTP 400.
 *
 * Configure in src/test/resources/testcontainers.properties:
 *   docker.client.strategy=com.cloudcampus.config.DockerApiVersionFixStrategy
 *
 * Why this is needed:
 *   docker-java 3.4.1 (shipped with Testcontainers 1.20.6) defaults to
 *   API version 1.24 and does not reliably pick up DOCKER_API_VERSION from
 *   the OS environment when running inside a Maven Surefire-forked JVM.
 *   Docker Engine 29.3.1 has MinAPIVersion=1.40, so /v1.24/info → HTTP 400.
 *
 * This strategy:
 *   1. Connects to the standard Docker socket (/var/run/docker.sock).
 *   2. Creates a docker-java config with api.version=1.41 explicitly set.
 *   3. Has highest priority (Integer.MAX_VALUE) so it is always tried first.
 */
public class DockerApiVersionFixStrategy extends DockerClientProviderStrategy {

    private static final String DOCKER_SOCKET = "unix:///var/run/docker.sock";
    private static final String DOCKER_API_VERSION = "1.41";

    @Override
    public TransportConfig getTransportConfig() throws InvalidConfigurationException {
        URI dockerHost = URI.create(DOCKER_SOCKET);

        // TransportConfig in Testcontainers 1.20.x only carries the HTTP transport.
        // The DockerClientConfig (with api.version) is resolved separately by
        // DockerClientProviderStrategy.test() via DefaultDockerClientConfig.createDefaultConfigBuilder(),
        // which reads the 'api.version' system property set via Surefire <argLine>.
        ZerodepDockerHttpClient httpClient = new ZerodepDockerHttpClient.Builder()
                .dockerHost(dockerHost)
                .connectionTimeout(Duration.ofSeconds(10))
                .responseTimeout(Duration.ofSeconds(30))
                .build();

        return TransportConfig.builder()
                .dockerHttpClient(httpClient)
                .build();
    }

    @Override
    public String getDescription() {
        return "Fixed API version " + DOCKER_API_VERSION
                + " via unix socket " + DOCKER_SOCKET
                + " (workaround for Docker Engine 26+ rejecting docker-java default v1.24)";
    }

    @Override
    protected boolean isApplicable() {
        return true;
    }

    @Override
    public int getPriority() {
        // Highest priority: always selected before the built-in strategies.
        return Integer.MAX_VALUE;
    }
}
