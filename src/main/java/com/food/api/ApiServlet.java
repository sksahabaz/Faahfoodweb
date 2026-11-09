package com.food.api;

import java.io.IOException;
import java.util.Map;

import com.food.model.Cart;
import com.food.model.User;
import com.food.util.JsonUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Base class for every /api servlet.
 *
 * - Every response is JSON, including errors.
 * - Write requests (POST/PUT/DELETE) must send Content-Type: application/json
 *   (see acceptsBody: the profile picture upload sends the image itself).
 *   Browsers cannot send that header cross-site without a CORS preflight,
 *   and we never allow CORS, so this protects the session cookie from CSRF.
 * - Login and cart live in the Tomcat session ("user", "cart", "checkout*"), also read
 *   by the page controllers (e.g. CheckoutController sends guests to /login).
 */
public abstract class ApiServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String method = request.getMethod();
        boolean isWrite = !"GET".equals(method) && !"HEAD".equals(method) && !"OPTIONS".equals(method);

        if (isWrite && !acceptsBody(request)) {
            error(response, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE,
                    "Requests must use Content-Type: application/json.");
            return;
        }

        try {
            super.service(request, response);
        } catch (IllegalArgumentException e) {
            error(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (RuntimeException e) {
            e.printStackTrace();
            error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Something went wrong. Please try again.");
        }
    }

    /**
     * Which write requests this servlet accepts: JSON only, unless a servlet widens it (the
     * profile picture upload also takes image/jpeg, image/png and image/webp, which likewise
     * cannot be sent cross-site without a CORS preflight).
     */
    protected boolean acceptsBody(HttpServletRequest request) {
        return isJsonRequest(request);
    }

    protected boolean isJsonRequest(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().startsWith("application/json");
    }

    /* ---------- responses ---------- */

    protected void ok(HttpServletResponse response, Object body) throws IOException {
        JsonUtil.write(response, HttpServletResponse.SC_OK, body);
    }

    protected void error(HttpServletResponse response, int status, String message) throws IOException {
        if (!response.isCommitted()) {
            JsonUtil.write(response, status, Map.of("error", message));
        }
    }

    /* ---------- session helpers ---------- */

    protected User currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session == null ? null : (User) session.getAttribute("user");
    }

    /** Returns the logged-in user, or writes a 401 and returns null. */
    protected User requireUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User user = currentUser(request);
        if (user == null) {
            error(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in to continue.");
        }
        return user;
    }

    protected Cart currentCart(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session == null ? null : (Cart) session.getAttribute("cart");
    }

    /** Returns the session cart, creating it if needed. */
    protected Cart cartForUpdate(HttpServletRequest request) {
        HttpSession session = request.getSession();
        Cart cart = (Cart) session.getAttribute("cart");
        if (cart == null) {
            cart = new Cart();
            session.setAttribute("cart", cart);
        }
        return cart;
    }

    /** Parses the first segment after the servlet path, e.g. /api/orders/12 -> 12. */
    protected Integer pathId(HttpServletRequest request) {
        String[] parts = pathParts(request);
        if (parts.length == 0) {
            return null;
        }
        try {
            return Integer.parseInt(parts[0]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid id in URL.");
        }
    }

    protected String[] pathParts(HttpServletRequest request) {
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            return new String[0];
        }
        return pathInfo.substring(1).split("/");
    }
}
