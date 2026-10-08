package com.food.controller;
import at.favre.lib.crypto.bcrypt.BCrypt;
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

@WebServlet("/login")
public class LoginController extends HttpServlet {

    private UserDAO userDAO = new UserDAOImpl();

    /* =========================================================
       GET /login

       Opens the login page.
       ========================================================= */

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        request.getRequestDispatcher(
                "/login.jsp"
        ).forward(request, response);
    }


    /* =========================================================
       POST /login

       Receives email and password,
       verifies the user,
       and creates the login session.
       ========================================================= */

    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        /* =====================================================
           GET FORM DATA
           ===================================================== */

        String email = request.getParameter("email");
        String password = request.getParameter("password");


        /* =====================================================
           CLEAN INPUT
           ===================================================== */

        if (email != null) {
            email = email.trim();
        }

        if (password != null) {
            password = password.trim();
        }


        /* =====================================================
           BASIC VALIDATION
           ===================================================== */

        if (email == null || email.isEmpty()
                || password == null || password.isEmpty()) {

            request.setAttribute(
                    "errorMessage",
                    "Please enter your email and password."
            );

            request.setAttribute(
                    "email",
                    email
            );

            request.getRequestDispatcher(
                    "/login.jsp"
            ).forward(request, response);

            return;
        }


        /* =====================================================
           FIND USER BY EMAIL
           ===================================================== */

        User user = userDAO.getUserByEmail(email);


        /* =====================================================
           USER DOES NOT EXIST
           ===================================================== */

        if (user == null) {

            request.setAttribute(
                    "errorMessage",
                    "Invalid email or password."
            );

            request.setAttribute(
                    "email",
                    email
            );

            request.getRequestDispatcher(
                    "/login.jsp"
            ).forward(request, response);

            return;
        }


        /* =====================================================
           CHECK PASSWORD
           ===================================================== */

        boolean passwordValid =
                BCrypt.verifyer().verify(
                        password.toCharArray(),
                        user.getPassword()
                ).verified;

        if (!passwordValid) {

            request.setAttribute(
                    "errorMessage",
                    "Invalid email or password."
            );

            request.setAttribute(
                    "email",
                    email
            );

            request.getRequestDispatcher(
                    "/login.jsp"
            ).forward(request, response);

            return;
        }


        /* =====================================================
           LOGIN SUCCESSFUL
           ===================================================== */

        HttpSession session = request.getSession();

        session.setAttribute(
                "user",
                user
        );


        /* =====================================================
           REDIRECT TO CHECKOUT

           The user originally came here because checkout
           required authentication.

           So after successful login, continue to checkout.
           ===================================================== */

        response.sendRedirect(
                request.getContextPath() + "/checkout"
        );
    }
}