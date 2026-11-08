package com.food.api;

import java.io.IOException;

import com.food.dao.MenuDAO;
import com.food.dao.RestaurantDAO;
import com.food.daoimpl.MenuDAOImpl;
import com.food.daoimpl.RestaurantDAOImpl;
import com.food.model.Restaurant;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * GET /api/restaurants              -> all restaurants
 * GET /api/restaurants/{id}         -> one restaurant
 * GET /api/restaurants/{id}/menu    -> menu items of that restaurant
 */
@WebServlet("/api/restaurants/*")
public class RestaurantApi extends ApiServlet {

    private static final long serialVersionUID = 1L;

    private final RestaurantDAO restaurantDAO = new RestaurantDAOImpl();
    private final MenuDAO menuDAO = new MenuDAOImpl();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String[] parts = pathParts(request);

        if (parts.length == 0) {
            ok(response, ApiViews.restaurants(restaurantDAO.getAllRestaurants()));
            return;
        }

        int restaurantId = pathId(request);

        if (parts.length == 1) {
            Restaurant restaurant = restaurantDAO.getRestaurantById(restaurantId);
            if (restaurant == null) {
                error(response, HttpServletResponse.SC_NOT_FOUND, "Restaurant not found.");
                return;
            }
            ok(response, ApiViews.restaurant(restaurant));
            return;
        }

        if (parts.length == 2 && "menu".equals(parts[1])) {
            ok(response, ApiViews.menuItems(menuDAO.getMenuItemsByRestaurantId(restaurantId)));
            return;
        }

        error(response, HttpServletResponse.SC_NOT_FOUND, "Not found.");
    }
}
