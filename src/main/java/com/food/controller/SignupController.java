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

@WebServlet("/signup")
public class SignupController extends HttpServlet {

    private UserDAO userDAO = new UserDAOImpl();

    /* =========================================================
       GET /signup

       Opens the signup page.
       ========================================================= */

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        request.getRequestDispatcher(
                "/signup.jsp"
        ).forward(request, response);
    }


    /* =========================================================
       POST /signup

       Receives registration information and creates
       a new user account.
       ========================================================= */

    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        /* =====================================================
           GET FORM DATA
           ===================================================== */

        String name =
                request.getParameter("name");

        String email =
                request.getParameter("email");

        String password =
                request.getParameter("password");

        String phone =
                request.getParameter("phone");

        String address =
                request.getParameter("address");


        System.out.println("----- SIGNUP DATA -----");
        System.out.println("NAME = " + name);
        System.out.println("EMAIL = " + email);
        System.out.println("PHONE = " + phone);
        System.out.println("ADDRESS = " + address);
        System.out.println("-----------------------");


        /* =====================================================
           CLEAN INPUT
           ===================================================== */

        if (name != null) {
            name = name.trim();
        }

        if (email != null) {
            email = email.trim();
        }

        if (password != null) {
            password = password.trim();
        }

        if (phone != null) {
            phone = phone.trim();
        }

        if (address != null) {
            address = address.trim();
        }


        /* =====================================================
           BASIC VALIDATION
           ===================================================== */

        String errorMessage = null;

        if (name == null || name.isEmpty()) {

            errorMessage = "Please enter your full name.";

        }
        else if (email == null || email.isEmpty()) {

            errorMessage = "Please enter your email.";

        }
        else if (password == null || password.isEmpty()) {

            errorMessage = "Please enter a password.";

        }
        else if (phone == null || phone.isEmpty()) {

            errorMessage = "Please enter your phone number.";

        }
        else if (address == null || address.isEmpty()) {

            errorMessage = "Please enter your address.";

        }


        /* =====================================================
           IF VALIDATION FAILS
           ===================================================== */

        if (errorMessage != null) {

            request.setAttribute(
                    "errorMessage",
                    errorMessage
            );

            request.setAttribute(
                    "name",
                    name
            );

            request.setAttribute(
                    "email",
                    email
            );

            request.setAttribute(
                    "phone",
                    phone
            );

            request.setAttribute(
                    "address",
                    address
            );

            request.getRequestDispatcher(
                    "/signup.jsp"
            ).forward(request, response);

            return;
        }


        /* =====================================================
           CHECK WHETHER EMAIL ALREADY EXISTS
           ===================================================== */

        User existingUser =
                userDAO.getUserByEmail(email);

        if (existingUser != null) {

            request.setAttribute(
                    "errorMessage",
                    "An account with this email already exists."
            );

            request.setAttribute(
                    "name",
                    name
            );

            request.setAttribute(
                    "email",
                    email
            );

            request.setAttribute(
                    "phone",
                    phone
            );

            request.setAttribute(
                    "address",
                    address
            );

            request.getRequestDispatcher(
                    "/signup.jsp"
            ).forward(request, response);

            return;
        }


        /* =====================================================
           CREATE NEW USER OBJECT
           ===================================================== */

        User user = new User();


        /* =====================================================
           HASH PASSWORD USING BCRYPT
           ===================================================== */

        String hashedPassword =
                BCrypt.withDefaults().hashToString(
                        12,
                        password.toCharArray()
                );


        /* =====================================================
           SET USER DETAILS
           ===================================================== */

        user.setName(name);

        user.setEmail(email);

        user.setPassword(hashedPassword);

        user.setPhone(phone);

        user.setAddress(address);

        /*
         * Every normal registered user will have
         * CUSTOMER role.
         */
        user.setRole("CUSTOMER");


        /* =====================================================
           DEBUG USER OBJECT
           ===================================================== */

        System.out.println("----- USER OBJECT -----");

        System.out.println(
                "USER NAME = " + user.getName()
        );

        System.out.println(
                "USER EMAIL = " + user.getEmail()
        );

        System.out.println(
                "USER PASSWORD SET = " +
                (user.getPassword() != null)
        );

        System.out.println(
                "USER PHONE = " + user.getPhone()
        );

        System.out.println(
                "USER ADDRESS = " + user.getAddress()
        );

        System.out.println(
                "USER ROLE = " + user.getRole()
        );

        System.out.println("-----------------------");


        /* =====================================================
           INSERT USER INTO DATABASE
           ===================================================== */

        boolean userCreated =
                userDAO.addUser(user);


        /* =====================================================
           CHECK INSERT RESULT
           ===================================================== */

        if (!userCreated) {

            request.setAttribute(
                    "errorMessage",
                    "Unable to create your account. Please try again."
            );

            request.setAttribute(
                    "name",
                    name
            );

            request.setAttribute(
                    "email",
                    email
            );

            request.setAttribute(
                    "phone",
                    phone
            );

            request.setAttribute(
                    "address",
                    address
            );

            request.getRequestDispatcher(
                    "/signup.jsp"
            ).forward(request, response);

            return;
        }


        /* =====================================================
           REGISTRATION SUCCESSFUL
           ===================================================== */

        /*
         * At this point the user has been successfully
         * inserted into the database.
         *
         * Retrieve the user again so that the database-generated
         * user_id and other fields are available.
         */

        User createdUser =
                userDAO.getUserByEmail(email);


        /* =====================================================
           CREATE LOGIN SESSION
           ===================================================== */

        HttpSession session =
                request.getSession();

        session.setAttribute(
                "user",
                createdUser
        );


        /* =====================================================
           CONTINUE TO CHECKOUT
           ===================================================== */

        response.sendRedirect(
                request.getContextPath() + "/checkout"
        );
    }
}