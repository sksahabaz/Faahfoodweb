package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * /payment was the old JSP payment step (payment.jsp, removed; kept in the legacy backup):
 * GET showed the page and POST placed the order from a form. The React checkout places
 * orders through POST /api/orders (same OrderService, protected against cross-site posts),
 * so both now go to the checkout page and place nothing.
 */
@WebServlet("/payment")
public class PaymentController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.redirect(request, response, "/checkout");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.redirect(request, response, "/checkout");
    }
}
