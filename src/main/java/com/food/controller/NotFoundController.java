package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Unknown URLs (web.xml error page for 404): the React app, whose router shows its own
 * "page not found" screen for the address in the browser, instead of Tomcat's plain error
 * page. The 404 status is kept. API errors are JSON and never come here.
 */
@WebServlet("/not-found")
public class NotFoundController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        if (request.getDispatcherType() != jakarta.servlet.DispatcherType.ERROR) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
        ReactPages.serve(getServletContext(), request, response);
    }
}
