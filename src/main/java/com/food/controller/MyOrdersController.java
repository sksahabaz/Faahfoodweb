package com.food.controller;

import java.io.IOException;
import java.util.List;

import com.food.dao.OrderDAO;
import com.food.daoimpl.OrderDAOImpl;
import com.food.model.Order;
import com.food.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/my-orders")
public class MyOrdersController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final OrderDAO orderDAO = new OrderDAOImpl();

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        // =====================================================
        // 1. GET SESSION
        // =====================================================

        HttpSession session = request.getSession();

        // =====================================================
        // 2. CHECK LOGIN
        // =====================================================

        User user = (User) session.getAttribute("user");

        if (user == null) {

            response.sendRedirect(
                    request.getContextPath() + "/login"
            );

            return;
        }

        // =====================================================
        // 3. GET ORDERS OF LOGGED-IN USER
        // =====================================================

        List<Order> orders =
                orderDAO.getOrdersByUserId(
                        user.getUserId()
                );

        // =====================================================
        // 4. SEND ORDERS TO JSP
        // =====================================================

        request.setAttribute(
                "orders",
                orders
        );

        // =====================================================
        // 5. OPEN MY ORDERS PAGE
        // =====================================================

        request.getRequestDispatcher(
                "/my-orders.jsp"
        ).forward(request, response);
    }
}