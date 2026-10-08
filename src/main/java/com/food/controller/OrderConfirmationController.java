package com.food.controller;

import java.io.IOException;

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

@WebServlet("/order-confirmation")
public class OrderConfirmationController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final OrderDAO orderDAO = new OrderDAOImpl();

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();

        // 1. CHECK LOGIN
        User user = (User) session.getAttribute("user");

        if (user == null) {
            response.sendRedirect(
                    request.getContextPath() + "/login"
            );
            return;
        }

        // 2. GET LAST ORDER ID
        Object orderIdObject =
                session.getAttribute("lastOrderId");

        if (orderIdObject == null) {
            response.sendRedirect(
                    request.getContextPath() + "/"
            );
            return;
        }

        int orderId = (Integer) orderIdObject;

        // 3. GET ORDER FROM DATABASE
        Order order =
                orderDAO.getOrderById(orderId);

        // 4. CHECK ORDER
        if (order == null) {
            response.sendRedirect(
                    request.getContextPath() + "/"
            );
            return;
        }

        // 5. SECURITY CHECK
        if (order.getUserId() != user.getUserId()) {
            response.sendRedirect(
                    request.getContextPath() + "/"
            );
            return;
        }

        // 6. SEND ORDER TO JSP
        request.setAttribute("order", order);

        // 7. OPEN CONFIRMATION PAGE
        request.getRequestDispatcher(
                "/order-confirmation.jsp"
        ).forward(request, response);
    }
}