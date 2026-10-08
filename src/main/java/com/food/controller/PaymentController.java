package com.food.controller;

import java.io.IOException;
import java.util.Map;

import com.food.dao.OrderDAO;
import com.food.dao.OrderItemDAO;
import com.food.daoimpl.OrderDAOImpl;
import com.food.daoimpl.OrderItemDAOImpl;
import com.food.model.Cart;
import com.food.model.CartItem;
import com.food.model.Order;
import com.food.model.OrderItem;
import com.food.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/payment")
public class PaymentController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final OrderDAO orderDAO = new OrderDAOImpl();
    private final OrderItemDAO orderItemDAO = new OrderItemDAOImpl();

    // =========================================================
    // GET /payment
    //
    // Opens the dummy payment page.
    // =========================================================

    @Override
    protected void doGet(HttpServletRequest request,
                          HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();

        // -----------------------------------------------------
        // CHECK CART
        // -----------------------------------------------------

        Cart cart = (Cart) session.getAttribute("cart");

        if (cart == null || cart.getItems().isEmpty()) {

            response.sendRedirect(
                    request.getContextPath() + "/cart"
            );

            return;
        }

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        User user = (User) session.getAttribute("user");

        if (user == null) {

            response.sendRedirect(
                    request.getContextPath() + "/login"
            );

            return;
        }

        // -----------------------------------------------------
        // CHECK CHECKOUT INFORMATION
        // -----------------------------------------------------

        String checkoutName =
                (String) session.getAttribute("checkoutName");

        String checkoutPhone =
                (String) session.getAttribute("checkoutPhone");

        String checkoutAddress =
                (String) session.getAttribute("checkoutAddress");

        if (checkoutName == null
                || checkoutPhone == null
                || checkoutAddress == null) {

            response.sendRedirect(
                    request.getContextPath() + "/checkout"
            );

            return;
        }

        // -----------------------------------------------------
        // SEND CART TO JSP
        // -----------------------------------------------------

        request.setAttribute("cart", cart);

        // -----------------------------------------------------
        // OPEN PAYMENT PAGE
        // -----------------------------------------------------

        request.getRequestDispatcher(
                "/payment.jsp"
        ).forward(request, response);
    }


    // =========================================================
    // POST /payment
    //
    // Dummy payment:
    //
    // 1. Get selected payment method
    // 2. Create order
    // 3. Create order items
    // 4. Clear cart
    // 5. Redirect to confirmation
    // =========================================================

    @Override
    protected void doPost(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();

        // -----------------------------------------------------
        // CHECK CART
        // -----------------------------------------------------

        Cart cart = (Cart) session.getAttribute("cart");

        if (cart == null || cart.getItems().isEmpty()) {

            response.sendRedirect(
                    request.getContextPath() + "/cart"
            );

            return;
        }

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        User user = (User) session.getAttribute("user");

        if (user == null) {

            response.sendRedirect(
                    request.getContextPath() + "/login"
            );

            return;
        }

        // -----------------------------------------------------
        // CHECK CHECKOUT INFORMATION
        // -----------------------------------------------------

        String checkoutName =
                (String) session.getAttribute("checkoutName");

        String checkoutPhone =
                (String) session.getAttribute("checkoutPhone");

        String checkoutAddress =
                (String) session.getAttribute("checkoutAddress");

        String checkoutInstructions =
                (String) session.getAttribute("checkoutInstructions");

        if (checkoutName == null
                || checkoutPhone == null
                || checkoutAddress == null) {

            response.sendRedirect(
                    request.getContextPath() + "/checkout"
            );

            return;
        }

        // -----------------------------------------------------
        // GET PAYMENT METHOD
        // -----------------------------------------------------

        String paymentMethod =
                request.getParameter("paymentMethod");

        if (paymentMethod == null
                || paymentMethod.trim().isEmpty()) {

            request.setAttribute("cart", cart);

            request.setAttribute(
                    "paymentError",
                    "Please select a payment method."
            );

            request.getRequestDispatcher(
                    "/payment.jsp"
            ).forward(request, response);

            return;
        }

        // -----------------------------------------------------
        // CREATE ORDER
        // -----------------------------------------------------

        Order order = new Order();

        order.setUserId(user.getUserId());

        order.setRestaurantId(
                cart.getRestaurantId()
        );

        order.setTotalAmount(
                cart.getTotal()
        );

        order.setStatus("PLACED");

        // Dummy payment
        order.setPaymentMethod(paymentMethod);

        // We are not using a real payment gateway.
        order.setPaymentStatus("PENDING");

        order.setDeliveryAddress(
                checkoutAddress
        );

        // -----------------------------------------------------
        // SAVE ORDER
        // -----------------------------------------------------

        boolean orderCreated =
                orderDAO.addOrder(order);

        if (!orderCreated) {

            request.setAttribute("cart", cart);

            request.setAttribute(
                    "paymentError",
                    "Unable to place your order. Please try again."
            );

            request.getRequestDispatcher(
                    "/payment.jsp"
            ).forward(request, response);

            return;
        }

        // -----------------------------------------------------
        // GET GENERATED ORDER ID
        // -----------------------------------------------------

        int orderId = order.getOrderId();

        // -----------------------------------------------------
        // CREATE ORDER ITEMS
        // -----------------------------------------------------

        for (Map.Entry<Integer, CartItem> entry
                : cart.getItems().entrySet()) {

            CartItem cartItem = entry.getValue();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrderId(orderId);

            orderItem.setMenuId(
                    cartItem.getMenu().getMenuId()
            );

            orderItem.setQuantity(
                    cartItem.getQuantity()
            );

            orderItem.setPrice(
                    cartItem.getMenu().getPrice()
            );

            orderItem.setSubtotal(
                    cartItem.getSubtotal()
            );

            boolean itemCreated =
                    orderItemDAO.addOrderItem(orderItem);

            if (!itemCreated) {

                request.setAttribute(
                        "cart",
                        cart
                );

                request.setAttribute(
                        "paymentError",
                        "Order could not be completed. Please try again."
                );

                request.getRequestDispatcher(
                        "/payment.jsp"
                ).forward(request, response);

                return;
            }
        }

        // -----------------------------------------------------
        // CLEAR CART
        // -----------------------------------------------------

        cart.clear();
        session.removeAttribute("cart");

        session.removeAttribute("checkoutName");
        session.removeAttribute("checkoutPhone");
        session.removeAttribute("checkoutAddress");
        session.removeAttribute("checkoutInstructions");

        session.setAttribute("lastOrderId", orderId);

        response.sendRedirect(request.getContextPath() + "/order-confirmation");
    }
}