package com.food.daoimpl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.food.dao.MenuDAO;
import com.food.model.Menu;
import com.food.util.DBConnection;

public class MenuDAOImpl implements MenuDAO {

    private static final String INSERT_MENU_ITEM =
            "INSERT INTO menu "
            + "(restaurant_id, item_name, description, price, category, image_url, is_available) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?)";

    private static final String SELECT_MENU_ITEM_BY_ID =
            "SELECT * FROM menu WHERE menu_id = ?";

    private static final String SELECT_ALL_MENU_ITEMS =
            "SELECT * FROM menu";

    private static final String SELECT_MENU_ITEMS_BY_RESTAURANT_ID =
            "SELECT * FROM menu WHERE restaurant_id = ?";

    private static final String UPDATE_MENU_ITEM =
            "UPDATE menu SET "
            + "restaurant_id = ?, "
            + "item_name = ?, "
            + "description = ?, "
            + "price = ?, "
            + "category = ?, "
            + "image_url = ?, "
            + "is_available = ? "
            + "WHERE menu_id = ?";

    private static final String DELETE_MENU_ITEM =
            "DELETE FROM menu WHERE menu_id = ?";

    @Override
    public boolean addMenuItem(Menu menu) {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(INSERT_MENU_ITEM)
        ) {

            preparedStatement.setInt(1, menu.getRestaurantId());
            preparedStatement.setString(2, menu.getItemName());
            preparedStatement.setString(3, menu.getDescription());
            preparedStatement.setBigDecimal(4, menu.getPrice());
            preparedStatement.setString(5, menu.getCategory());
            preparedStatement.setString(6, menu.getImageUrl());
            preparedStatement.setBoolean(7, menu.isAvailable());

            int rowsAffected = preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public Menu getMenuItemById(int menuId) {

        Menu menu = null;

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(SELECT_MENU_ITEM_BY_ID)
        ) {

            preparedStatement.setInt(1, menuId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {

                if (resultSet.next()) {
                    menu = mapResultSetToMenu(resultSet);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return menu;
    }

    @Override
    public List<Menu> getAllMenuItems() {

        List<Menu> menuItems = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(SELECT_ALL_MENU_ITEMS);
                ResultSet resultSet = preparedStatement.executeQuery()
        ) {

            while (resultSet.next()) {
                Menu menu = mapResultSetToMenu(resultSet);
                menuItems.add(menu);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return menuItems;
    }

    @Override
    public List<Menu> getMenuItemsByRestaurantId(int restaurantId) {

        List<Menu> menuItems = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_MENU_ITEMS_BY_RESTAURANT_ID
                        )
        ) {

            preparedStatement.setInt(1, restaurantId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {

                while (resultSet.next()) {
                    Menu menu = mapResultSetToMenu(resultSet);
                    menuItems.add(menu);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return menuItems;
    }

    @Override
    public boolean updateMenuItem(Menu menu) {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(UPDATE_MENU_ITEM)
        ) {

            preparedStatement.setInt(1, menu.getRestaurantId());
            preparedStatement.setString(2, menu.getItemName());
            preparedStatement.setString(3, menu.getDescription());
            preparedStatement.setBigDecimal(4, menu.getPrice());
            preparedStatement.setString(5, menu.getCategory());
            preparedStatement.setString(6, menu.getImageUrl());
            preparedStatement.setBoolean(7, menu.isAvailable());
            preparedStatement.setInt(8, menu.getMenuId());

            int rowsAffected = preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public boolean deleteMenuItem(int menuId) {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(DELETE_MENU_ITEM)
        ) {

            preparedStatement.setInt(1, menuId);

            int rowsAffected = preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    private Menu mapResultSetToMenu(ResultSet resultSet)
            throws SQLException {

        Menu menu = new Menu();

        menu.setMenuId(
                resultSet.getInt("menu_id")
        );

        menu.setRestaurantId(
                resultSet.getInt("restaurant_id")
        );

        menu.setItemName(
                resultSet.getString("item_name")
        );

        menu.setDescription(
                resultSet.getString("description")
        );

        menu.setPrice(
                resultSet.getBigDecimal("price")
        );

        menu.setCategory(
                resultSet.getString("category")
        );

        menu.setImageUrl(
                resultSet.getString("image_url")
        );

        menu.setAvailable(
                resultSet.getBoolean("is_available")
        );

        menu.setCreatedDate(
                resultSet.getTimestamp("created_date")
        );

        return menu;
    }
}