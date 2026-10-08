package com.food.controller;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.food.dao.RestaurantDAO;
import com.food.daoimpl.RestaurantDAOImpl;
import com.food.model.Restaurant;

@WebServlet("/restaurant")
public class RestaurantController extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		RestaurantDAO restaurantDAO = new RestaurantDAOImpl();

		List<Restaurant> allRestaurants = restaurantDAO.getAllRestaurants();

		request.setAttribute("restaurants", allRestaurants);

		RequestDispatcher dispatcher = request.getRequestDispatcher("restaurants.jsp");

		dispatcher.forward(request, response);

	}
}