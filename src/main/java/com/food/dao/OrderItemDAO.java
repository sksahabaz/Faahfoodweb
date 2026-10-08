package com.food.dao;

import java.util.List;

import com.food.model.OrderItem;

public interface OrderItemDAO {

    // Create a new order item
    boolean addOrderItem(OrderItem orderItem);

    // Get order item by ID
    OrderItem getOrderItemById(int orderItemId);

    // Get all order items
    List<OrderItem> getAllOrderItems();

    // Get all items belonging to an order
    List<OrderItem> getOrderItemsByOrderId(int orderId);

    // Update order item
    boolean updateOrderItem(OrderItem orderItem);

    // Delete order item
    boolean deleteOrderItem(int orderItemId);
}