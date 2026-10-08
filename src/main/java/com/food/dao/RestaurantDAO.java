package com.food.dao;

import java.util.List;

import com.food.model.Restaurant;

public interface RestaurantDAO {

    // Add a new restaurant
    boolean addRestaurant(Restaurant restaurant);

    // Get restaurant by ID
    Restaurant getRestaurantById(int restaurantId);

    // Get all restaurants
    List<Restaurant> getAllRestaurants();

    // Update restaurant
    boolean updateRestaurant(Restaurant restaurant);

    // Delete restaurant
    boolean deleteRestaurant(int restaurantId);
}