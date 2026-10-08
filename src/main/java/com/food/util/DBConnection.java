package com.food.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static final String URL =
            System.getenv("DB_URL");

    private static final String USER =
            System.getenv("DB_USER");

    private static final String PASSWORD =
            System.getenv("DB_PASSWORD");

    public static Connection getConnection() {

        try {

            // Step 1: Load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            System.out.println("MySQL JDBC Driver loaded successfully!");

            // Step 2: Create database connection
            Connection connection =
                    DriverManager.getConnection(URL, USER, PASSWORD);

            System.out.println("Database connected successfully!");

            return connection;

        } catch (ClassNotFoundException e) {

            System.out.println("MySQL JDBC Driver NOT FOUND!");
            e.printStackTrace();

        } catch (SQLException e) {

            System.out.println("Database connection FAILED!");
            e.printStackTrace();
        }

        return null;
    }
}