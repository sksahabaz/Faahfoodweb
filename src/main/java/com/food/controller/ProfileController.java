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
 * GET /profile, /profile/addresses  the React profile page (details and picture through
 * /api/profile). Guests go to /login first and come back here.
 */
@WebServlet(urlPatterns = { "/profile", "/profile/*" })
public class ProfileController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");

        if (user == null) {
            boolean addresses = "/addresses".equals(request.getPathInfo());
            session.setAttribute(LoginController.REDIRECT_AFTER_LOGIN, addresses ? "/profile/addresses" : "/profile");
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        ReactPages.serve(getServletContext(), request, response);
    }
}
