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
 * GET /checkout  the React checkout page (cart, delivery details, payment method; it saves
 *                the details with POST /api/checkout and places the order with POST
 *                /api/orders). Guests go to /login first; the session remembers checkout,
 *                so LoginController brings them back here.
 *
 * POST /checkout was the form handler of the old checkout.jsp (removed; kept in the legacy
 * backup). It now only goes back to the checkout page and saves nothing.
 */
@WebServlet("/checkout")
public class CheckoutController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");

        if (user == null) {
            session.setAttribute(LoginController.REDIRECT_AFTER_LOGIN, "/checkout");
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        // The page itself handles an empty cart.
        ReactPages.serve(getServletContext(), request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.redirect(request, response, "/checkout");
    }
}
