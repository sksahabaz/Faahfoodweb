package com.food.controller;

import java.io.IOException;

import com.food.dao.MenuDAO;
import com.food.daoimpl.MenuDAOImpl;
import com.food.model.Cart;
import com.food.model.Menu;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/cart")
public class CartController extends HttpServlet {
	private MenuDAO menuDAO = new MenuDAOImpl();

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		HttpSession session = request.getSession();

		Cart cart = (Cart) session.getAttribute("cart");

		request.setAttribute("cart", cart);

		request.getRequestDispatcher("/cart.jsp").forward(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request,
	                      HttpServletResponse response)
	        throws ServletException, IOException {

	    String action = request.getParameter("action");

	    HttpSession session = request.getSession();

	    Cart cart = (Cart) session.getAttribute("cart");


	    // =========================
	    // ADD ITEM
	    // =========================

	    if ("add".equals(action)) {

	        int menuId = Integer.parseInt(
	                request.getParameter("menuId")
	        );

	        Menu menu = menuDAO.getMenuItemById(menuId);

	        if (menu == null) {
	            response.sendError(
	                    HttpServletResponse.SC_NOT_FOUND,
	                    "Menu item not found"
	            );
	            return;
	        }

	        if (cart == null) {
	            cart = new Cart();
	            session.setAttribute("cart", cart);
	        }

	        try {

	            cart.addItem(menu);

	        } catch (IllegalArgumentException e) {

	            session.setAttribute(
	                    "cartError",
	                    "You already have items from another restaurant. Clear your current cart before adding this item."
	            );
	        }
	    }


	    // =========================
	    // UPDATE QUANTITY
	    // =========================

	    else if ("update".equals(action)) {

	        int menuId = Integer.parseInt(
	                request.getParameter("menuId")
	        );

	        int quantity = Integer.parseInt(
	                request.getParameter("quantity")
	        );

	        if (cart != null) {
	            cart.updateQuantity(menuId, quantity);
	        }
	    }


	    // =========================
	    // REMOVE ITEM
	    // =========================

	    else if ("remove".equals(action)) {

	        int menuId = Integer.parseInt(
	                request.getParameter("menuId")
	        );

	        if (cart != null) {
	            cart.removeItem(menuId);
	        }
	    }


	    // =========================
	    // CLEAR CART
	    // =========================

	    else if ("clear".equals(action)) {

	        if (cart != null) {
	            cart.clear();
	        }
	    }


	    // =========================
	    // GO BACK TO CART
	    // =========================

	    response.sendRedirect(
	            request.getContextPath() + "/cart"
	    );
	}
}