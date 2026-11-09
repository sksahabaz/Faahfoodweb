package com.food.api;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import com.food.controller.LoginController;
import com.food.model.User;
import com.food.service.AuthService;
import com.food.util.JsonUtil;
import com.google.gson.JsonObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * GET  /api/auth/me           -> { authenticated, user, next }
 * POST /api/auth/check-email  { email }                                -> { exists }
 * POST /api/auth/login        { email, password }                      -> { user, redirectTo }
 * POST /api/auth/signup       { name, email, password, phone, address } -> { created, email }
 * POST /api/auth/logout                                                -> { ok }
 *
 * The login and signup pages (React) use these. Login checks the password with AuthService
 * (BCrypt) and starts the session with a new id; redirectTo is where the user was going
 * (LoginController.REDIRECT_AFTER_LOGIN, e.g. "/checkout") or "/". "next" in /me is that same
 * destination, unchanged, so the login page can say "Log in to continue to checkout".
 * Signup creates the account and does not log in (the user logs in next), so a remembered
 * destination survives signup → login. As with every /api write, only JSON is accepted,
 * which another site's form cannot send.
 */
@WebServlet("/api/auth/*")
public class AuthApi extends ApiServlet {

    private static final long serialVersionUID = 1L;

    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        if (!"me".equals(action(request))) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
            return;
        }

        User user = currentUser(request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("authenticated", user != null);
        body.put("user", user == null ? null : ApiViews.user(user));
        body.put("next", LoginController.peekRedirectTarget(request.getSession(false)));
        ok(response, body);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        switch (action(request)) {
            case "check-email" -> checkEmail(request, response);
            case "login" -> login(request, response);
            case "signup" -> signup(request, response);
            case "logout" -> logout(request, response);
            default -> error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
        }
    }

    private void checkEmail(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String email = JsonUtil.getString(JsonUtil.readObject(request), "email");
        if (isBlank(email)) {
            throw new IllegalArgumentException("Please enter your email address.");
        }

        boolean exists = authService.emailExists(email);
        if (exists) {
            // Same as AccountCheckController: remember the email for the login step.
            request.getSession().setAttribute("accountEmail", email);
        }
        ok(response, Map.of("exists", exists));
    }

    private void login(HttpServletRequest request, HttpServletResponse response) throws IOException {

        JsonObject body = JsonUtil.readObject(request);
        String email = JsonUtil.getString(body, "email");
        String password = JsonUtil.getString(body, "password");

        if (isBlank(email) || isBlank(password)) {
            throw new IllegalArgumentException("Please enter your email and password.");
        }

        User user = authService.login(email, password);
        if (user == null) {
            error(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid email or password.");
            return;
        }

        startSession(request, user);
        String redirectTo = LoginController.takeRedirectTarget(request.getSession());
        ok(response, Map.of("user", ApiViews.user(user), "redirectTo", redirectTo));
    }

    private void signup(HttpServletRequest request, HttpServletResponse response) throws IOException {

        JsonObject body = JsonUtil.readObject(request);
        String name = JsonUtil.getString(body, "name");
        String email = JsonUtil.getString(body, "email");
        String password = JsonUtil.getString(body, "password");
        String phone = JsonUtil.getString(body, "phone");
        String address = JsonUtil.getString(body, "address");

        if (isBlank(name)) throw new IllegalArgumentException("Please enter your full name.");
        if (isBlank(email)) throw new IllegalArgumentException("Please enter your email.");
        if (isBlank(password)) throw new IllegalArgumentException("Please enter a password.");
        if (isBlank(phone)) throw new IllegalArgumentException("Please enter your phone number.");
        if (isBlank(address)) throw new IllegalArgumentException("Please enter your address.");

        // The same checks the signup page makes in the browser: values the database columns
        // (users: name/email 100, phone 15, address 255) or BCrypt (72 bytes) would reject.
        phone = phone.replaceAll("[\\s\\-().]", "");
        if (name.length() > 100) throw new IllegalArgumentException("Your name can be at most 100 characters.");
        if (email.length() > 100 || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) {
            throw new IllegalArgumentException("Please enter a valid email address, like name@example.com.");
        }
        if (!phone.matches("\\+?\\d{10,14}")) throw new IllegalArgumentException("Please enter a valid phone number (10 to 14 digits).");
        if (address.length() > 255) throw new IllegalArgumentException("Your address can be at most 255 characters.");
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("Please use a password of at most 72 characters.");
        }

        try {
            authService.signup(name, email, password, phone, address);
        } catch (IllegalStateException e) {
            error(response, HttpServletResponse.SC_CONFLICT, e.getMessage());
            return;
        }

        ok(response, Map.of("created", true, "email", email));
    }

    private void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        ok(response, Map.of("ok", true));
    }

    /** Logs the user in. A new session id is issued so an old one can't be reused. */
    private void startSession(HttpServletRequest request, User user) {
        request.getSession();
        request.changeSessionId();
        request.getSession().setAttribute("user", user);
    }

    private String action(HttpServletRequest request) {
        String[] parts = pathParts(request);
        return parts.length == 1 ? parts[0] : "";
    }

    private boolean isBlank(String value) {
        return value == null || value.isEmpty();
    }
}
