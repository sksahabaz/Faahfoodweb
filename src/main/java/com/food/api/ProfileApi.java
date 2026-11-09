package com.food.api;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Set;

import com.food.dao.UserDAO;
import com.food.daoimpl.UserDAOImpl;
import com.food.model.User;
import com.food.util.AvatarStore;
import com.food.util.JsonUtil;
import com.google.gson.JsonObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * The logged-in user's own profile (always the session user: no user id is taken from the
 * request, so nobody can read or change another account).
 *
 * PUT    /api/profile  { name?, phone?, address? }  -> { user }   (email and password are
 *                                                                  not editable here)
 * GET    /api/profile/avatar                        -> the picture (404 if none)
 * PUT    /api/profile/avatar   body: the image (Content-Type image/jpeg|png|webp, max 5 MB)
 *                                                   -> { user }
 * DELETE /api/profile/avatar                        -> { user }
 *
 * { user } is the same shape as GET /api/auth/me returns, so the app can replace its shared
 * copy of the user (navbar avatar and name included) straight from the answer.
 */
@WebServlet("/api/profile/*")
public class ProfileApi extends ApiServlet {

    private static final long serialVersionUID = 1L;

    /** Bodies up to this size are read and discarded when too big, to answer 413 cleanly. */
    private static final long DRAIN_LIMIT = 16L * 1024 * 1024;

    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final UserDAO userDAO = new UserDAOImpl();

    @Override
    protected boolean acceptsBody(HttpServletRequest request) {
        if ("PUT".equals(request.getMethod()) && isAvatar(request)) {
            return IMAGE_TYPES.contains(baseType(request.getContentType()));
        }
        return isJsonRequest(request);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        User user = requireUser(request, response);
        if (user == null) {
            return;
        }
        if (!isAvatar(request)) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
            return;
        }

        byte[] image = AvatarStore.read(user.getUserId());
        String type = AvatarStore.detectType(image);
        if (type == null) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "No profile picture.");
            return;
        }
        response.setContentType(type);
        response.setContentLength(image.length);
        // the URL carries a version, so the browser may keep it; private: never in shared caches
        response.setHeader("Cache-Control", "private, max-age=31536000, immutable");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Content-Disposition", "inline");
        response.getOutputStream().write(image);
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {

        User user = requireUser(request, response);
        if (user == null) {
            return;
        }

        if (isAvatar(request)) {
            uploadAvatar(user, request, response);
        } else if (pathParts(request).length == 0) {
            updateDetails(user, request, response);
        } else {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {

        User user = requireUser(request, response);
        if (user == null) {
            return;
        }
        if (!isAvatar(request)) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
            return;
        }
        AvatarStore.delete(user.getUserId());
        ok(response, Map.of("user", ApiViews.user(user)));
    }

    /* ---------- picture ---------- */

    private void uploadAvatar(User user, HttpServletRequest request, HttpServletResponse response) throws IOException {

        // Far too big: refuse without reading (the connection is closed on the client).
        if (request.getContentLengthLong() > DRAIN_LIMIT) {
            error(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "Please choose a picture smaller than 5 MB.");
            return;
        }
        byte[] image = readLimited(request.getInputStream(), AvatarStore.MAX_BYTES);
        if (image == null) {
            error(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "Please choose a picture smaller than 5 MB.");
            return;
        }

        // the bytes must really be the image type that was declared
        String type = AvatarStore.detectType(image);
        if (type == null || !type.equals(baseType(request.getContentType()))) {
            error(response, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, "Please choose a JPG, PNG or WebP image.");
            return;
        }

        AvatarStore.save(user.getUserId(), image);
        ok(response, Map.of("user", ApiViews.user(user)));
    }

    /**
     * Reads the body; null if it is longer than max. A slightly-too-big body is read to the end
     * (up to DRAIN_LIMIT) and thrown away, so the client gets the 413 message rather than a
     * reset connection.
     */
    private byte[] readLimited(InputStream in, int max) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        long total = 0;
        int read;
        while ((read = in.read(buffer)) != -1) {
            total += read;
            if (total > DRAIN_LIMIT) {
                return null;
            }
            if (total <= max) {
                out.write(buffer, 0, read);
            }
        }
        return total > max ? null : out.toByteArray();
    }

    /* ---------- details ---------- */

    private void updateDetails(User sessionUser, HttpServletRequest request, HttpServletResponse response) throws IOException {

        JsonObject body = JsonUtil.readObject(request);
        String name = JsonUtil.getString(body, "name");
        String phone = JsonUtil.getString(body, "phone");
        String address = JsonUtil.getString(body, "address");

        if (name != null) {
            name = name.trim().replaceAll("\\s+", " ");
            if (name.length() < 2) throw new IllegalArgumentException("Please enter your full name.");
            if (name.length() > 100) throw new IllegalArgumentException("Your name can be at most 100 characters.");
        }
        if (phone != null) {
            phone = phone.replaceAll("[\\s\\-().]", "");
            if (!phone.matches("\\+?\\d{10,14}")) throw new IllegalArgumentException("Please enter a valid phone number (10 to 14 digits).");
        }
        if (address != null) {
            address = address.trim();
            if (address.length() < 5) throw new IllegalArgumentException("Please enter your full address.");
            if (address.length() > 255) throw new IllegalArgumentException("Your address can be at most 255 characters.");
        }

        // Work on a fresh copy from the database (keeps the password hash, email and role as stored).
        User stored = userDAO.getUserById(sessionUser.getUserId());
        if (stored == null) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Account not found.");
            return;
        }
        if (name != null) stored.setName(name);
        if (phone != null) stored.setPhone(phone);
        if (address != null) stored.setAddress(address);

        if (!userDAO.updateUser(stored)) {
            error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "We couldn't save your changes. Please try again.");
            return;
        }

        // Same session object /api/auth/me and every other API reads.
        sessionUser.setName(stored.getName());
        sessionUser.setPhone(stored.getPhone());
        sessionUser.setAddress(stored.getAddress());
        ok(response, Map.of("user", ApiViews.user(sessionUser)));
    }

    /* ---------- helpers ---------- */

    private boolean isAvatar(HttpServletRequest request) {
        String[] parts = pathParts(request);
        return parts.length == 1 && "avatar".equals(parts[0]);
    }

    private static String baseType(String contentType) {
        return contentType == null ? "" : contentType.split(";")[0].trim().toLowerCase();
    }
}
