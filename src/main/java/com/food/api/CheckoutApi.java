package com.food.api;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import com.food.model.Cart;
import com.food.model.User;
import com.food.util.JsonUtil;
import com.google.gson.JsonObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Delivery details step, same rules and session keys as CheckoutController.
 *
 * GET  /api/checkout  -> saved details (falls back to the user's profile)
 * POST /api/checkout  { customerName, phone, address, instructions } -> saved details
 */
@WebServlet("/api/checkout")
public class CheckoutApi extends ApiServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        User user = requireUser(request, response);
        if (user == null) {
            return;
        }

        HttpSession session = request.getSession();
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("customerName", orDefault(session.getAttribute("checkoutName"), user.getName()));
        details.put("phone", orDefault(session.getAttribute("checkoutPhone"), user.getPhone()));
        details.put("address", orDefault(session.getAttribute("checkoutAddress"), user.getAddress()));
        details.put("instructions", orDefault(session.getAttribute("checkoutInstructions"), ""));
        ok(response, details);
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

        JsonObject body = JsonUtil.readObject(request);
        String customerName = JsonUtil.getString(body, "customerName");
        String phone = JsonUtil.getString(body, "phone");
        String address = JsonUtil.getString(body, "address");
        String instructions = JsonUtil.getString(body, "instructions");

        if (customerName == null || customerName.isEmpty()) {
            throw new IllegalArgumentException("Please enter your full name.");
        }
        if (phone == null || phone.isEmpty()) {
            throw new IllegalArgumentException("Please enter your phone number.");
        }
        if (address == null || address.isEmpty()) {
            throw new IllegalArgumentException("Please enter your delivery address.");
        }

        HttpSession session = request.getSession();
        session.setAttribute("checkoutName", customerName);
        session.setAttribute("checkoutPhone", phone);
        session.setAttribute("checkoutAddress", address);
        session.setAttribute("checkoutInstructions", instructions);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("customerName", customerName);
        details.put("phone", phone);
        details.put("address", address);
        details.put("instructions", instructions == null ? "" : instructions);
        ok(response, details);
    }

    private Object orDefault(Object value, Object fallback) {
        return value != null ? value : fallback;
    }
}
