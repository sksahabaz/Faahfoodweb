package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * /restaurant was the old JSP restaurant list (restaurants.jsp, removed; kept in the legacy
 * backup). Old links and bookmarks go to the homepage, which lists the restaurants.
 */
@WebServlet("/restaurant")
public class RestaurantController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        ReactPages.redirect(request, response, "/#restaurants");
    }
}
