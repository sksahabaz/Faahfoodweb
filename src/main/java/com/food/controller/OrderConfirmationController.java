package com.food.controller;

import java.io.IOException;

import com.food.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Order confirmation.
 *
 *   /order-confirmation        -> /order-confirmation/{last order id} (the order just placed
 *                                 in this session), or the homepage if there is none
 *   /order-confirmation/{id}   -> the React confirmation page. It loads the order from
 *                                 GET /api/orders/{id}, which only returns the logged-in
 *                                 user's own orders, so a refresh shows the same order.
 *
 * Guests are sent to /login and brought back afterwards.
 */
@WebServlet(urlPatterns = { "/order-confirmation", "/order-confirmation/*" })
public class OrderConfirmationController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");
        String pathId = orderIdFromPath(request);

        if (user == null) {
            session.setAttribute(LoginController.REDIRECT_AFTER_LOGIN,
                    pathId == null ? "/order-confirmation" : "/order-confirmation/" + pathId);
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        if (pathId == null) {
            Object lastOrderId = session.getAttribute("lastOrderId");
            response.sendRedirect(request.getContextPath()
                    + (lastOrderId == null ? "/" : "/order-confirmation/" + lastOrderId));
            return;
        }

        ReactPages.serve(getServletContext(), request, response);
    }

    /** The numeric id in /order-confirmation/{id}, or null. */
    private String orderIdFromPath(HttpServletRequest request) {
        String path = request.getPathInfo();
        if (path == null) {
            return null;
        }
        String id = path.replaceAll("^/+|/+$", "");
        return id.matches("\\d{1,9}") ? id : null;
    }
}
