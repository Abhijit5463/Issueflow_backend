# Use official Java 17 image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy Maven build output
COPY target/issueflow-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
