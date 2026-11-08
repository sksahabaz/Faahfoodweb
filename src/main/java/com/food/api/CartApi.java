package com.food.api;

import java.io.IOException;

import com.food.dao.MenuDAO;
import com.food.daoimpl.MenuDAOImpl;
import com.food.model.Cart;
import com.food.model.Menu;
import com.food.util.JsonUtil;
import com.google.gson.JsonObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Same session cart as CartController. Every call returns the updated cart.
 *
 * GET    /api/cart                     -> cart
 * POST   /api/cart/items  { menuId }   -> add one of this item
 * PUT    /api/cart/items/{menuId}  { quantity }  -> set quantity (0 removes it)
 * DELETE /api/cart/items/{menuId}      -> remove item
 * DELETE /api/cart                     -> clear cart
 */
@WebServlet(urlPatterns = { "/api/cart", "/api/cart/*" })
public class CartApi extends ApiServlet {

    private static final long serialVersionUID = 1L;

    private final MenuDAO menuDAO = new MenuDAOImpl();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ok(response, ApiViews.cart(currentCart(request)));
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String[] parts = pathParts(request);
        if (parts.length != 1 || !"items".equals(parts[0])) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
            return;
        }

        JsonObject body = JsonUtil.readObject(request);
        Menu menu = menuDAO.getMenuItemById(JsonUtil.getInt(body, "menuId"));
        if (menu == null) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Menu item not found.");
            return;
        }

        Cart cart = cartForUpdate(request);
        try {
            cart.addItem(menu);
        } catch (IllegalArgumentException e) {
            error(response, HttpServletResponse.SC_CONFLICT,
                    "You already have items from another restaurant. Clear your current cart before adding this item.");
            return;
        }

        ok(response, ApiViews.cart(cart));
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {

        Integer menuId = itemId(request);
        if (menuId == null) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
            return;
        }

        int quantity = JsonUtil.getInt(JsonUtil.readObject(request), "quantity");
        Cart cart = currentCart(request);
        if (cart != null) {
            cart.updateQuantity(menuId, quantity);
        }
        ok(response, ApiViews.cart(cart));
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {

        Cart cart = currentCart(request);
        String[] parts = pathParts(request);

        if (parts.length == 0) {
            if (cart != null) {
                cart.clear();
            }
            ok(response, ApiViews.cart(cart));
            return;
        }

        Integer menuId = itemId(request);
        if (menuId == null) {
            error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
            return;
        }
        if (cart != null) {
            cart.removeItem(menuId);
        }
        ok(response, ApiViews.cart(cart));
    }

    /** Reads {menuId} from /api/cart/items/{menuId}. */
    private Integer itemId(HttpServletRequest request) {
        String[] parts = pathParts(request);
        if (parts.length != 2 || !"items".equals(parts[0])) {
            return null;
        }
        try {
            return Integer.parseInt(parts[1]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid menu id in URL.");
        }
    }
}
