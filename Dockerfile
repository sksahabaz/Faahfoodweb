FROM tomcat:10.1-jdk21-temurin

RUN rm -rf /usr/local/tomcat/webapps/ROOT

COPY src/main/webapp/ /usr/local/tomcat/webapps/ROOT/
COPY src/main/java/ /tmp/java-src/

RUN mkdir -p /usr/local/tomcat/webapps/ROOT/WEB-INF/classes && \
    javac -cp "/usr/local/tomcat/lib/servlet-api.jar:/usr/local/tomcat/webapps/ROOT/WEB-INF/lib/*" \
    -d /usr/local/tomcat/webapps/ROOT/WEB-INF/classes \
    $(find /tmp/java-src -name "*.java")

EXPOSE 8080

CMD ["catalina.sh", "run"]