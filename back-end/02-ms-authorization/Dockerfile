FROM eclipse-temurin:21-jre-alpine
COPY target/authorization-service-*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app.jar"]
