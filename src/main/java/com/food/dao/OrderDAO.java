package com.food.dao;

import java.util.List;

import com.food.model.Order;

public interface OrderDAO {

    // Create a new order
    boolean addOrder(Order order);

    // Get order by ID
    Order getOrderById(int orderId);

    // Get all orders
    List<Order> getAllOrders();

    // Get all orders placed by a user
    List<Order> getOrdersByUserId(int userId);

    // Get all orders belonging to a restaurant
    List<Order> getOrdersByRestaurantId(int restaurantId);

    // Update order details
    boolean updateOrder(Order order);

    // Update only order status
    boolean updateOrderStatus(int orderId, String status);

    // Delete order
    boolean deleteOrder(int orderId);
}