package com.food.api;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.food.model.Cart;
import com.food.model.CartItem;
import com.food.model.Menu;
import com.food.model.Order;
import com.food.model.Restaurant;
import com.food.model.User;
import com.food.util.AvatarStore;

/**
 * Turns models into the JSON shapes the React app receives.
 * Keeping this in one place means sensitive fields (like the
 * password hash) are never sent by accident.
 */
final class ApiViews {

    private ApiViews() {
    }

    static Map<String, Object> user(User user) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("userId", user.getUserId());
        view.put("name", user.getName());
        view.put("email", user.getEmail());
        view.put("phone", user.getPhone());
        view.put("address", user.getAddress());
        // account creation time (users.created_date), shown as "Member since"
        view.put("memberSince", user.getCreatedDate());
        // the profile picture, if uploaded: a URL relative to the application, versioned by
        // the file's modification time so a new picture is never served from cache
        Long avatar = AvatarStore.version(user.getUserId());
        view.put("avatarUrl", avatar == null ? null : "api/profile/avatar?v=" + avatar);
        return view;
    }

    static Map<String, Object> restaurant(Restaurant restaurant) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("restaurantId", restaurant.getRestaurantId());
        view.put("name", restaurant.getName());
        view.put("description", restaurant.getDescription());
        view.put("address", restaurant.getAddress());
        view.put("phone", restaurant.getPhone());
        view.put("rating", restaurant.getRating());
        view.put("deliveryTime", restaurant.getDeliveryTime());
        view.put("imageUrl", restaurant.getImageUrl());
        return view;
    }

    static List<Map<String, Object>> restaurants(List<Restaurant> restaurants) {
        List<Map<String, Object>> views = new ArrayList<>();
        for (Restaurant restaurant : restaurants) {
            views.add(restaurant(restaurant));
        }
        return views;
    }

    static Map<String, Object> menuItem(Menu menu) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("menuId", menu.getMenuId());
        view.put("restaurantId", menu.getRestaurantId());
        view.put("itemName", menu.getItemName());
        view.put("description", menu.getDescription());
        view.put("price", menu.getPrice());
        view.put("category", menu.getCategory());
        view.put("imageUrl", menu.getImageUrl());
        view.put("available", menu.isAvailable());
        return view;
    }

    static List<Map<String, Object>> menuItems(List<Menu> items) {
        List<Map<String, Object>> views = new ArrayList<>();
        for (Menu menu : items) {
            views.add(menuItem(menu));
        }
        return views;
    }

    static Map<String, Object> cart(Cart cart) {
        Map<String, Object> view = new LinkedHashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();
        int count = 0;

        if (cart != null) {
            for (CartItem item : cart.getItems().values()) {
                Map<String, Object> line = menuItem(item.getMenu());
                line.put("quantity", item.getQuantity());
                line.put("subtotal", item.getSubtotal());
                items.add(line);
                count += item.getQuantity();
            }
        }

        boolean empty = items.isEmpty();
        view.put("restaurantId", empty ? null : cart.getRestaurantId());
        view.put("items", items);
        view.put("itemCount", count);
        view.put("total", empty ? 0 : cart.getTotal());
        return view;
    }

    static Map<String, Object> order(Order order) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("orderId", order.getOrderId());
        view.put("restaurantId", order.getRestaurantId());
        view.put("orderDate", order.getOrderDate());
        view.put("totalAmount", order.getTotalAmount());
        view.put("status", order.getStatus());
        view.put("paymentMethod", order.getPaymentMethod());
        view.put("paymentStatus", order.getPaymentStatus());
        view.put("deliveryAddress", order.getDeliveryAddress());
        return view;
    }
}
