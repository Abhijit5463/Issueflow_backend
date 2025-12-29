# ---------- BUILD STAGE ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd

# Download dependencies
RUN ./mvnw.cmd dependency:go-offline

# Copy source code
COPY src src

# Build the application
RUN ./mvnw.cmd clean package -DskipTests

# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/issueflow-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
