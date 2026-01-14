# Stage 1: Build the Monolith (Frontend + Backend)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy everything for the build
COPY . .

# Fix permissions for the Maven wrapper
RUN chmod +x mvnw

# Build the application (the pom.xml now handles npm install and building the React app)
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=build /app/target/issueflow-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
