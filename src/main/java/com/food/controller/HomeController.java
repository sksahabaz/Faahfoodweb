package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * The React app's homepage ("/") and restaurant menu page (/restaurants/{id}).
 * The page loads restaurants and menus from /api/restaurants.
 */
@WebServlet(urlPatterns = { "", "/restaurants/*" })
public class HomeController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.serve(getServletContext(), request, response);
    }
}
