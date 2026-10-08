package com.food.dao;

import java.util.List;

import com.food.model.Menu;

public interface MenuDAO {

    // Add a new menu item
    boolean addMenuItem(Menu menu);

    // Get menu item by ID
    Menu getMenuItemById(int menuId);

    // Get all menu items
    List<Menu> getAllMenuItems();

    // Get menu items belonging to a restaurant
    List<Menu> getMenuItemsByRestaurantId(int restaurantId);

    // Update menu item
    boolean updateMenuItem(Menu menu);

    // Delete menu item
    boolean deleteMenuItem(int menuId);
}