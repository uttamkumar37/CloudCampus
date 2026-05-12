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

# Expose default Spring Boot port
EXPOSE 8080

# Health-check via Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "org.springframework.boot.loader.launch.JarLauncher"]
