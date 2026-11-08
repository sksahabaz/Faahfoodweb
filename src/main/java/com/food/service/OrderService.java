package com.food.service;

import java.util.List;

import com.food.dao.OrderDAO;
import com.food.dao.OrderItemDAO;
import com.food.daoimpl.OrderDAOImpl;
import com.food.daoimpl.OrderItemDAOImpl;
import com.food.model.Cart;
import com.food.model.CartItem;
import com.food.model.Order;
import com.food.model.OrderItem;
import com.food.model.User;

/**
 * Order placement, matching PaymentController step for step.
 */
public class OrderService {

    private final OrderDAO orderDAO = new OrderDAOImpl();
    private final OrderItemDAO orderItemDAO = new OrderItemDAOImpl();

    /**
     * Saves the order and its items. Returns the new order id.
     * Throws IllegalStateException if anything could not be saved.
     */
    public int placeOrder(User user, Cart cart, String deliveryAddress, String paymentMethod) {

        Order order = new Order();
        order.setUserId(user.getUserId());
        order.setRestaurantId(cart.getRestaurantId());
        order.setTotalAmount(cart.getTotal());
        order.setStatus("PLACED");
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("PENDING");
        order.setDeliveryAddress(deliveryAddress);

        if (!orderDAO.addOrder(order)) {
            throw new IllegalStateException("Unable to place your order. Please try again.");
        }

        for (CartItem cartItem : cart.getItems().values()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getOrderId());
            orderItem.setMenuId(cartItem.getMenu().getMenuId());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getMenu().getPrice());
            orderItem.setSubtotal(cartItem.getSubtotal());

            if (!orderItemDAO.addOrderItem(orderItem)) {
                throw new IllegalStateException("Order could not be completed. Please try again.");
            }
        }

        return order.getOrderId();
    }

    public List<Order> ordersForUser(int userId) {
        return orderDAO.getOrdersByUserId(userId);
    }

    /** Returns the order only if it belongs to this user, otherwise null. */
    public Order orderForUser(int orderId, int userId) {
        Order order = orderDAO.getOrderById(orderId);
        return order != null && order.getUserId() == userId ? order : null;
    }

    public List<OrderItem> itemsForOrder(int orderId) {
        return orderItemDAO.getOrderItemsByOrderId(orderId);
    }
}
