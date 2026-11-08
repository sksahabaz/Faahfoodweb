package com.food.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.food.dao.MenuDAO;
import com.food.dao.RestaurantDAO;
import com.food.daoimpl.MenuDAOImpl;
import com.food.daoimpl.RestaurantDAOImpl;
import com.food.model.Cart;
import com.food.model.Menu;
import com.food.model.Order;
import com.food.model.OrderItem;
import com.food.model.Restaurant;
import com.food.model.User;
import com.food.service.OrderService;
import com.food.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * GET  /api/orders        -> the logged-in user's orders
 * GET  /api/orders/{id}   -> one order with its items (owner only)
 * POST /api/orders  { paymentMethod } -> places the order from the cart
 *                                        and the saved checkout details
 */
@WebServlet(urlPatterns = { "/api/orders", "/api/orders/*" })
public class OrderApi extends ApiServlet {

    private static final long serialVersionUID = 1L;

    private final OrderService orderService = new OrderService();
    private final RestaurantDAO restaurantDAO = new RestaurantDAOImpl();
    private final MenuDAO menuDAO = new MenuDAOImpl();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        User user = requireUser(request, response);
        if (user == null) {
            return;
        }

        Integer orderId = pathId(request);
        if (orderId == null) {
            listOrders(user, response);
        } else {
            orderDetail(user, orderId, response);
        }
    }

    private void listOrders(User user, HttpServletResponse response) throws IOException {

        Map<Integer, String> restaurantNames = new HashMap<>();
        List<Map<String, Object>> views = new ArrayList<>();

        for (Order order : orderService.ordersForUser(user.getUserId())) {
            Map<String, Object> view = ApiViews.order(order);
            view.put("restaurantName", restaurantNames.computeIfAbsent(
                    order.getRestaurantId(), this::restaurantName));
            views.add(view);
        }
        ok(response, views);
    }

    private void orderDetail(User user, int orderId, HttpServletResponse response) throws IOException {

        Order order = orderService.orderForUser(orderId, user.getUserId());
        if (order == null) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Order not found.");
            return;
        }

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : orderService.itemsForOrder(orderId)) {
            Menu menu = menuDAO.getMenuItemById(item.getMenuId());
            Map<String, Object> line = new HashMap<>();
            line.put("menuId", item.getMenuId());
            line.put("itemName", menu == null ? "Item" : menu.getItemName());
            line.put("imageUrl", menu == null ? null : menu.getImageUrl());
            line.put("quantity", item.getQuantity());
            line.put("price", item.getPrice());
            line.put("subtotal", item.getSubtotal());
            items.add(line);
        }

        Map<String, Object> view = ApiViews.order(order);
        view.put("restaurantName", restaurantName(order.getRestaurantId()));
        view.put("items", items);
        ok(response, view);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        User user = requireUser(request, response);
        if (user == null) {
            return;
        }

        Cart cart = currentCart(request);
        if (cart == null || cart.getItems().isEmpty()) {
            error(response, HttpServletResponse.SC_CONFLICT, "Your cart is empty.");
            return;
        }

        HttpSession session = request.getSession();
        String address = (String) session.getAttribute("checkoutAddress");
        if (session.getAttribute("checkoutName") == null
                || session.getAttribute("checkoutPhone") == null
                || address == null) {
            error(response, HttpServletResponse.SC_CONFLICT, "Please add your delivery details first.");
            return;
        }

        String paymentMethod = JsonUtil.getString(JsonUtil.readObject(request), "paymentMethod");
        if (paymentMethod == null || paymentMethod.isEmpty()) {
            throw new IllegalArgumentException("Please select a payment method.");
        }

        int orderId;
        try {
            orderId = orderService.placeOrder(user, cart, address, paymentMethod);
        } catch (IllegalStateException e) {
            error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
            return;
        }

        // Same clean-up as PaymentController.
        cart.clear();
        session.removeAttribute("cart");
        session.removeAttribute("checkoutName");
        session.removeAttribute("checkoutPhone");
        session.removeAttribute("checkoutAddress");
        session.removeAttribute("checkoutInstructions");
        session.setAttribute("lastOrderId", orderId);

        ok(response, Map.of("orderId", orderId));
    }

    private String restaurantName(int restaurantId) {
        Restaurant restaurant = restaurantDAO.getRestaurantById(restaurantId);
        return restaurant == null ? null : restaurant.getName();
    }
}
