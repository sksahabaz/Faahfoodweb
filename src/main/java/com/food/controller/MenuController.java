package com.food.controller;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.food.dao.MenuDAO;
import com.food.daoimpl.MenuDAOImpl;
import com.food.model.Menu;

@WebServlet("/menu")
public class MenuController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private MenuDAO menuDAO;

    @Override
    public void init() throws ServletException {
        menuDAO = new MenuDAOImpl();
    }

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        // Get restaurant ID from the URL
        String restaurantIdParam = request.getParameter("restaurantId");

        // Check whether restaurantId was provided
        if (restaurantIdParam == null || restaurantIdParam.trim().isEmpty()) {
            response.sendError(
                HttpServletResponse.SC_BAD_REQUEST,
                "Restaurant ID is required"
            );
            return;
        }

        try {
            // Convert String to int
            int restaurantId = Integer.parseInt(restaurantIdParam);

            // Get menu items for the selected restaurant
            List<Menu> menuList =
                    menuDAO.getMenuItemsByRestaurantId(restaurantId);

            // Store menu list in request
            request.setAttribute("menuList", menuList);

            // Forward to menu.jsp
            request.getRequestDispatcher("menu.jsp")
                   .forward(request, response);

        } catch (NumberFormatException e) {
            response.sendError(
                HttpServletResponse.SC_BAD_REQUEST,
                "Invalid restaurant ID"
            );

        } catch (Exception e) {

            e.printStackTrace();

            response.sendError(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Unable to load menu"
            );
        }
    }
}