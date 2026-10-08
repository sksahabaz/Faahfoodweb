package com.food.controller;

import java.io.IOException;

import com.food.model.Cart;
import com.food.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/checkout")
public class CheckoutController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    // =========================================================
    // GET /checkout
    //
    // Opens checkout page.
    // =========================================================

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();

        // -----------------------------------------------------
        // CHECK CART
        // -----------------------------------------------------

        Cart cart = (Cart) session.getAttribute("cart");

        if (cart == null || cart.getItems().isEmpty()) {

            response.sendRedirect(
                    request.getContextPath() + "/cart"
            );

            return;
        }

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        User user = (User) session.getAttribute("user");

        if (user == null) {

            response.sendRedirect(
                    request.getContextPath() + "/login"
            );

            return;
        }

        // -----------------------------------------------------
        // SEND CART TO CHECKOUT JSP
        // -----------------------------------------------------

        request.setAttribute("cart", cart);

        // -----------------------------------------------------
        // OPEN CHECKOUT PAGE
        // -----------------------------------------------------

        request.getRequestDispatcher(
                "/checkout.jsp"
        ).forward(request, response);
    }


    // =========================================================
    // POST /checkout
    //
    // Only validates and stores delivery information.
    //
    // NO ORDER IS CREATED HERE.
    //
    // Flow:
    //
    // Checkout
    //    ↓
    // Save details in session
    //    ↓
    // Payment
    // =========================================================

    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();

        // -----------------------------------------------------
        // CHECK CART
        // -----------------------------------------------------

        Cart cart = (Cart) session.getAttribute("cart");

        if (cart == null || cart.getItems().isEmpty()) {

            response.sendRedirect(
                    request.getContextPath() + "/cart"
            );

            return;
        }

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        User user = (User) session.getAttribute("user");

        if (user == null) {

            response.sendRedirect(
                    request.getContextPath() + "/login"
            );

            return;
        }

        // -----------------------------------------------------
        // GET DELIVERY DETAILS
        // -----------------------------------------------------

        String customerName =
                request.getParameter("customerName");

        String phone =
                request.getParameter("phone");

        String address =
                request.getParameter("address");

        String instructions =
                request.getParameter("instructions");

        // -----------------------------------------------------
        // TRIM VALUES
        // -----------------------------------------------------

        if (customerName != null) {
            customerName = customerName.trim();
        }

        if (phone != null) {
            phone = phone.trim();
        }

        if (address != null) {
            address = address.trim();
        }

        if (instructions != null) {
            instructions = instructions.trim();
        }

        // -----------------------------------------------------
        // VALIDATE NAME
        // -----------------------------------------------------

        if (customerName == null || customerName.isEmpty()) {

            showCheckoutError(
                    request,
                    response,
                    cart,
                    "Please enter your full name.",
                    customerName,
                    phone,
                    address,
                    instructions
            );

            return;
        }

        // -----------------------------------------------------
        // VALIDATE PHONE
        // -----------------------------------------------------

        if (phone == null || phone.isEmpty()) {

            showCheckoutError(
                    request,
                    response,
                    cart,
                    "Please enter your phone number.",
                    customerName,
                    phone,
                    address,
                    instructions
            );

            return;
        }

        // -----------------------------------------------------
        // VALIDATE ADDRESS
        // -----------------------------------------------------

        if (address == null || address.isEmpty()) {

            showCheckoutError(
                    request,
                    response,
                    cart,
                    "Please enter your delivery address.",
                    customerName,
                    phone,
                    address,
                    instructions
            );

            return;
        }

        // =====================================================
        // SAVE CHECKOUT DETAILS IN SESSION
        // =====================================================

        session.setAttribute(
                "checkoutName",
                customerName
        );

        session.setAttribute(
                "checkoutPhone",
                phone
        );

        session.setAttribute(
                "checkoutAddress",
                address
        );

        session.setAttribute(
                "checkoutInstructions",
                instructions
        );

        // =====================================================
        // GO TO PAYMENT
        // =====================================================

        response.sendRedirect(
                request.getContextPath() + "/payment"
        );
    }


    // =========================================================
    // CHECKOUT ERROR
    // =========================================================

    private void showCheckoutError(
            HttpServletRequest request,
            HttpServletResponse response,
            Cart cart,
            String errorMessage,
            String customerName,
            String phone,
            String address,
            String instructions)
            throws ServletException, IOException {

        request.setAttribute(
                "cart",
                cart
        );

        request.setAttribute(
                "errorMessage",
                errorMessage
        );

        request.setAttribute(
                "customerName",
                customerName
        );

        request.setAttribute(
                "phone",
                phone
        );

        request.setAttribute(
                "address",
                address
        );

        request.setAttribute(
                "instructions",
                instructions
        );

        request.getRequestDispatcher(
                "/checkout.jsp"
        ).forward(request, response);
    }
}