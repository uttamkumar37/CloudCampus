FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn -B -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system cloudcampus && adduser --system --ingroup cloudcampus cloudcampus
COPY --from=build /workspace/backend/target/cloudcampus-backend-*.jar /app/cloudcampus-backend.jar
USER cloudcampus
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=5 CMD curl -fsS http://localhost:8080/actuator/health/readiness || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/cloudcampus-backend.jar"]
