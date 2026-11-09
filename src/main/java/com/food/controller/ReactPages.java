package com.food.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Serves the React app's index.html for the page URLs the React router owns
 * (HomeController: "/" and /restaurants/{id}; CartController: /cart; CheckoutController:
 * /checkout; OrderConfirmationController: /order-confirmation/{id}; MyOrdersController:
 * /my-orders; ProfileController: /profile; LoginController: /login; SignupController:
 * /signup; NotFoundController: unknown URLs). Opening or refreshing any of those URLs
 * therefore loads the app, which then reads its data from /api. There are no JSP pages.
 *
 * The page comes from the frontend build (frontend/dist, copied into the webapp by the
 * Dockerfile, or by `npm run build:webapp` for a local Tomcat). If it is missing the server
 * answers 503 with an explanation instead of an empty page.
 */
final class ReactPages {

    static final String PAGE = "/index.html";

    private ReactPages() {
    }

    /**
     * Sends index.html with a <base href> at the context root, so its relative asset
     * URLs work on nested paths such as /restaurants/6 and under any context path.
     */
    static void serve(ServletContext context, HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        InputStream page = context.getResourceAsStream(PAGE);
        if (page == null) {
            context.log("React build missing: " + PAGE + " not found in the webapp.");
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "The FAah!! FOOD web app has not been built into this deployment (index.html is missing).");
            return;
        }
        String html;
        try (InputStream in = page) {
            html = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
        String base = "<base href=\"" + request.getContextPath().replace("\"", "%22") + "/\">";
        int head = html.toLowerCase().indexOf("<head>");
        if (head >= 0) {
            html = html.substring(0, head + 6) + "\n    " + base + html.substring(head + 6);
        }

        // Always revalidate the page itself; its scripts and styles have hashed names.
        response.setHeader("Cache-Control", "no-cache");
        response.setContentType("text/html");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(html);
    }

    /**
     * Sends the browser to another page of the app with a GET (303 See Other), used by the
     * legacy URLs whose JSP pages were removed (old links and bookmarks keep working).
     */
    static void redirect(HttpServletRequest request, HttpServletResponse response, String path) {
        response.setStatus(HttpServletResponse.SC_SEE_OTHER);
        response.setHeader("Location", request.getContextPath() + path);
    }
}
