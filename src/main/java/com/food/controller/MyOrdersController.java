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
 * GET /my-orders  the React My Orders page (history from GET /api/orders, details from
 *                 GET /api/orders/{id}; both only return the session user's orders).
 *                 Guests go to /login first and come back here (with ?order=N kept).
 */
@WebServlet("/my-orders")
public class MyOrdersController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");

        if (user == null) {
            String order = request.getParameter("order");
            session.setAttribute(LoginController.REDIRECT_AFTER_LOGIN,
                    order != null && order.matches("\\d{1,9}") ? "/my-orders?order=" + order : "/my-orders");
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        ReactPages.serve(getServletContext(), request, response);
    }
}
