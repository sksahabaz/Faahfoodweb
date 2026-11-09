package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * GET /login  the React login page. It signs in with POST /api/auth/login (AuthApi →
 *             AuthService: the account is looked up by email and the password is checked
 *             against its BCrypt hash; on success the session gets a new id and the user).
 *
 * Where to go after logging in: pages that need a login (checkout, order confirmation,
 * My Orders, profile) store their URL in the session under REDIRECT_AFTER_LOGIN before
 * sending a guest here; the login API hands it back (takeRedirectTarget), else "/".
 *
 * POST /login was the form handler of the old login.jsp (removed; kept in the legacy
 * backup). Login now only goes through the JSON API, which cannot be called from another
 * site's form; a form POST here just shows the login page.
 */
@WebServlet("/login")
public class LoginController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /** Session key: where to go after a successful login (e.g. "/checkout"). */
    public static final String REDIRECT_AFTER_LOGIN = "redirectAfterLogin";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.serve(getServletContext(), request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.redirect(request, response, "/login");
    }

    /** The remembered destination without clearing it (null if none or not a safe path). */
    public static String peekRedirectTarget(HttpSession session) {
        Object target = session == null ? null : session.getAttribute(REDIRECT_AFTER_LOGIN);
        return target instanceof String path && isInternalPath(path) ? path : null;
    }

    /** Reads and clears the remembered destination. Only paths inside this application are accepted. */
    public static String takeRedirectTarget(HttpSession session) {
        String target = peekRedirectTarget(session);
        session.removeAttribute(REDIRECT_AFTER_LOGIN);
        return target == null ? "/" : target;
    }

    private static boolean isInternalPath(String path) {
        return path.startsWith("/") && !path.startsWith("//") && !path.contains("\\");
    }
}
