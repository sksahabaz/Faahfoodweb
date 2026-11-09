package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * /menu?restaurantId={id} was the old JSP menu page (menu.jsp, removed; kept in the legacy
 * backup). Old links go to the React menu page /restaurants/{id} (or the homepage).
 */
@WebServlet("/menu")
public class MenuController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String id = request.getParameter("restaurantId");
        ReactPages.redirect(request, response,
                id != null && id.trim().matches("\\d{1,9}") ? "/restaurants/" + id.trim() : "/");
    }
}
