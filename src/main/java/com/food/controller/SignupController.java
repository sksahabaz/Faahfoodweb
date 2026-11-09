package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * GET /signup  the React signup page. It registers with POST /api/auth/signup (AuthApi →
 *              AuthService: same checks as before, BCrypt-hashed password, CUSTOMER role)
 *              and then opens the login page; signing up does not log in.
 *
 * POST /signup was the form handler of the old signup.jsp (removed; kept in the legacy
 * backup). A form POST here now just shows the signup page.
 */
@WebServlet("/signup")
public class SignupController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.serve(getServletContext(), request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.redirect(request, response, "/signup");
    }
}
