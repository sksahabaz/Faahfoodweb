package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * GET /cart  the React cart page; it reads and changes the session cart through /api/cart.
 *
 * POST /cart was the form handler of the old JSP pages (add / update / remove / clear). Those
 * forms were removed with the JSP pages, and the same actions are in the JSON API (CartApi),
 * which also protects them against cross-site form posts. A POST now only goes to the cart
 * page and changes nothing. The old handler is in the legacy backup.
 */
@WebServlet("/cart")
public class CartController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.serve(getServletContext(), request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.redirect(request, response, "/cart");
    }
}
