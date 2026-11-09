package com.food.controller;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * GET /logout ends the session and goes to the homepage. (The React app logs out with
 * POST /api/auth/logout; this URL is kept for old links.)
 */
@WebServlet("/logout")
public class LogoutController extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

    	HttpSession session = request.getSession(false);

    	if (session != null) {
    	    session.invalidate();
    	}

    	// back to the homepage (the old JSP restaurant page is gone)
    	response.sendRedirect(
    	        request.getContextPath() + "/"
    	);
    }
}