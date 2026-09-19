FROM eclipse-temurin:21-jre-alpine
COPY target/attendance-service-*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app.jar"]
