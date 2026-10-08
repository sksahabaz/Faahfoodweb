package com.food.controller;

import java.io.IOException;

import com.food.dao.UserDAO;
import com.food.daoimpl.UserDAOImpl;
import com.food.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/account-check")
public class AccountCheckController extends HttpServlet {

    private UserDAO userDAO = new UserDAOImpl();

    /* =========================================================
       GET /account-check

       Opens the account-check page.
       ========================================================= */

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        request.getRequestDispatcher(
                "/account-check.jsp"
        ).forward(request, response);
    }


    /* =========================================================
       POST /account-check

       Checks whether the entered email already exists.
       ========================================================= */

    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        String email = request.getParameter("email");

        /* =====================================================
           CLEAN INPUT
           ===================================================== */

        if (email != null) {
            email = email.trim();
        }


        /* =====================================================
           VALIDATE EMAIL
           ===================================================== */

        if (email == null || email.isEmpty()) {

            request.setAttribute(
                    "errorMessage",
                    "Please enter your email address."
            );

            request.getRequestDispatcher(
                    "/account-check.jsp"
            ).forward(request, response);

            return;
        }


        /* =====================================================
           CHECK USER IN DATABASE
           ===================================================== */

        User user = userDAO.getUserByEmail(email);


        /* =====================================================
           EXISTING USER
           ===================================================== */

        if (user != null) {

            HttpSession session = request.getSession();

            /*
             * Store the existing user temporarily in session.
             *
             * We are NOT doing password verification here.
             * That will be handled by the login step.
             */

            session.setAttribute(
                    "accountEmail",
                    user.getEmail()
            );

            response.sendRedirect(
                    request.getContextPath() + "/login"
            );

            return;
        }


        /* =====================================================
           NEW USER
           ===================================================== */

        request.setAttribute(
                "email",
                email
        );

        request.setAttribute(
                "newUser",
                true
        );

        request.getRequestDispatcher(
                "/account-check.jsp"
        ).forward(request, response);
    }
}