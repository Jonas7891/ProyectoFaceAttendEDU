FROM eclipse-temurin:21-jre-alpine
COPY target/scheduling-service-*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java","-jar","/app.jar"]
