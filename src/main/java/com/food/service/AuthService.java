package com.food.service;

import com.food.dao.UserDAO;
import com.food.daoimpl.UserDAOImpl;
import com.food.model.User;

import at.favre.lib.crypto.bcrypt.BCrypt;

/**
 * Login and signup rules, matching LoginController and SignupController.
 */
public class AuthService {

    private static final int BCRYPT_COST = 12;

    private final UserDAO userDAO = new UserDAOImpl();

    public boolean emailExists(String email) {
        return userDAO.getUserByEmail(email) != null;
    }

    /** Returns the user when email and password match, otherwise null. */
    public User login(String email, String password) {

        User user = userDAO.getUserByEmail(email);
        if (user == null) {
            return null;
        }

        boolean valid = BCrypt.verifyer()
                .verify(password.toCharArray(), user.getPassword())
                .verified;

        return valid ? user : null;
    }

    /**
     * Creates a customer account and returns the saved user.
     * Throws IllegalStateException when the email is already taken
     * or the insert fails.
     */
    public User signup(String name, String email, String password, String phone, String address) {

        if (emailExists(email)) {
            throw new IllegalStateException("An account with this email already exists.");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(BCrypt.withDefaults().hashToString(BCRYPT_COST, password.toCharArray()));
        user.setPhone(phone);
        user.setAddress(address);
        user.setRole("CUSTOMER");

        if (!userDAO.addUser(user)) {
            throw new IllegalStateException("Unable to create your account. Please try again.");
        }

        return userDAO.getUserByEmail(email);
    }
}
