FROM eclipse-temurin:23-jdk
WORKDIR /app

COPY target/POS-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

# Use PORT environment variable if set (for Railway), otherwise default to 8080
ENV PORT=8080
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
LABEL authors="kariu"

