package com.food.util;

import java.io.BufferedReader;
import java.io.IOException;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Small helper for reading and writing JSON in the /api servlets.
 */
public final class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .serializeNulls()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            .create();

    private JsonUtil() {
    }

    public static void write(HttpServletResponse response, int status, Object body)
            throws IOException {

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store");
        response.getWriter().write(GSON.toJson(body));
    }

    /**
     * Reads the request body as a JSON object.
     * Returns an empty object when the body is empty.
     */
    public static JsonObject readObject(HttpServletRequest request) throws IOException {

        StringBuilder body = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
        }

        if (body.toString().isBlank()) {
            return new JsonObject();
        }

        try {
            return JsonParser.parseString(body.toString()).getAsJsonObject();
        } catch (JsonParseException | IllegalStateException e) {
            throw new IllegalArgumentException("Request body must be a JSON object.");
        }
    }

    /** Returns a trimmed string field, or null when missing. */
    public static String getString(JsonObject json, String key) {

        if (!json.has(key) || json.get(key).isJsonNull()) {
            return null;
        }
        return json.get(key).getAsString().trim();
    }

    /** Returns an int field, or throws IllegalArgumentException when missing or invalid. */
    public static int getInt(JsonObject json, String key) {

        try {
            return json.get(key).getAsInt();
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("'" + key + "' must be a number.");
        }
    }
}
