# ---- 1. Build the React frontend (frontend/) ----
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# prebuild copies the Draco decoder from three.js into public/draco
RUN npm run build

# ---- 2. Tomcat with the Java application ----
FROM tomcat:10.1-jdk21-temurin

RUN rm -rf /usr/local/tomcat/webapps/ROOT

# The webapp: WEB-INF (web.xml, libraries) and META-INF/context.xml (HTTPS behind Render's
# proxy, SameSite cookie). There are no JSP pages: every page is the React app.
COPY src/main/webapp/ /usr/local/tomcat/webapps/ROOT/
# The React app: index.html, assets/, models/ (GLB), draco/, decor/, brand/, cuisines/,
# confirmation/. Every page URL is served this index.html by a servlet (ReactPages).
COPY --from=frontend /frontend/dist/ /usr/local/tomcat/webapps/ROOT/
COPY src/main/java/ /tmp/java-src/

RUN mkdir -p /usr/local/tomcat/webapps/ROOT/WEB-INF/classes && \
    javac -encoding UTF-8 \
      -cp "/usr/local/tomcat/lib/servlet-api.jar:/usr/local/tomcat/webapps/ROOT/WEB-INF/lib/*" \
      -d /usr/local/tomcat/webapps/ROOT/WEB-INF/classes \
      $(find /tmp/java-src -name "*.java") && \
    rm -rf /tmp/java-src

# Environment (Render dashboard → Environment):
#   DB_URL, DB_USER, DB_PASSWORD  MySQL connection (required)
#   FAAH_UPLOAD_DIR               folder for profile pictures (optional; default
#                                 /usr/local/tomcat/faah-data). Point it at a persistent disk,
#                                 or uploaded pictures are lost on every deploy.
EXPOSE 8080

CMD ["catalina.sh", "run"]
