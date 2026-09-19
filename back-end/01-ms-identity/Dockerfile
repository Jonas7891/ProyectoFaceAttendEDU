FROM eclipse-temurin:21-jre-alpine
COPY target/identity-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app.jar"]
