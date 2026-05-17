# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — builder
#   Extracts the Spring Boot layered JAR into its four cache-friendly layers so
#   Docker only re-copies changed layers on each build.
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS builder

WORKDIR /builder

# Copy only the fat-jar produced by `mvn package -DskipTests`
COPY target/cloudcampus-backend-*.jar app.jar

# Extract layers:  dependencies | spring-boot-loader | snapshot-dependencies | application
RUN java -Djarmode=layertools -jar app.jar extract --destination extracted


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — runtime
#   Minimal JRE image, non-root user, four ordered COPY layers so the heavy
#   dependency layer is cached across most rebuilds.
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

# curl needed for HEALTHCHECK; clean apt cache in same layer to keep image small
RUN apt-get update && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# Non-root user/group
RUN groupadd --system --gid 1001 appgroup \
 && useradd  --system --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Layer order matters: least-frequently-changed first ─ maximum layer re-use
COPY --from=builder /builder/extracted/dependencies/          ./
COPY --from=builder /builder/extracted/spring-boot-loader/    ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/           ./

# Drop to non-root
USER appuser

# 8080 — application; 8081 — actuator (prod/staging management.server.port)
EXPOSE 8080 8081

# Health-check via Spring Boot Actuator.
# MANAGEMENT_PORT defaults to 8080 (dev/local). Set to 8081 in prod/staging to
# match management.server.port in application-prod.yml / application-staging.yml.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f "http://localhost:${MANAGEMENT_PORT:-8080}/actuator/health" || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:InitialRAMPercentage=50.0", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseZGC", \
  "-XX:+ZGenerational", \
  "-XX:+HeapDumpOnOutOfMemoryError", \
  "-XX:HeapDumpPath=/tmp/heapdump.hprof", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "org.springframework.boot.loader.launch.JarLauncher"]
