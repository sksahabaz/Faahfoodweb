package com.food.daoimpl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.food.dao.RestaurantDAO;
import com.food.model.Restaurant;
import com.food.util.DBConnection;

public class RestaurantDAOImpl implements RestaurantDAO {

	private static final String INSERT_RESTAURANT = "INSERT INTO restaurants "
			+ "(name, description, address, phone, rating, delivery_time, image_url) " + "VALUES (?, ?, ?, ?, ?, ?, ?)";

	private static final String SELECT_RESTAURANT_BY_ID = "SELECT * FROM restaurants WHERE restaurant_id = ?";

	private static final String SELECT_ALL_RESTAURANTS = "SELECT * FROM restaurants";

	private static final String UPDATE_RESTAURANT = "UPDATE restaurants SET " + "name = ?, " + "description = ?, "
			+ "address = ?, " + "phone = ?, " + "rating = ?, " + "delivery_time = ?, " + "image_url = ? "
			+ "WHERE restaurant_id = ?";

	private static final String DELETE_RESTAURANT = "DELETE FROM restaurants WHERE restaurant_id = ?";

	@Override
	public boolean addRestaurant(Restaurant restaurant) {

		try (Connection connection = DBConnection.getConnection();
				PreparedStatement preparedStatement = connection.prepareStatement(INSERT_RESTAURANT)) {

			preparedStatement.setString(1, restaurant.getName());
			preparedStatement.setString(2, restaurant.getDescription());
			preparedStatement.setString(3, restaurant.getAddress());
			preparedStatement.setString(4, restaurant.getPhone());
			preparedStatement.setBigDecimal(5, restaurant.getRating());
			preparedStatement.setInt(6, restaurant.getDeliveryTime());
			preparedStatement.setString(7, restaurant.getImageUrl());

			int rowsAffected = preparedStatement.executeUpdate();

			return rowsAffected > 0;

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return false;
	}

	@Override
	public Restaurant getRestaurantById(int restaurantId) {

		Restaurant restaurant = null;

		try (Connection connection = DBConnection.getConnection();
				PreparedStatement preparedStatement = connection.prepareStatement(SELECT_RESTAURANT_BY_ID)) {

			preparedStatement.setInt(1, restaurantId);

			try (ResultSet resultSet = preparedStatement.executeQuery()) {

				if (resultSet.next()) {
					restaurant = mapResultSetToRestaurant(resultSet);
				}
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return restaurant;
	}

	@Override
	public List<Restaurant> getAllRestaurants() {

		List<Restaurant> restaurants = new ArrayList<>();

		try (Connection connection = DBConnection.getConnection();
				PreparedStatement preparedStatement = connection.prepareStatement(SELECT_ALL_RESTAURANTS);
				ResultSet resultSet = preparedStatement.executeQuery()) {

			while (resultSet.next()) {

				Restaurant restaurant = mapResultSetToRestaurant(resultSet);

				restaurants.add(restaurant);
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return restaurants;
	}

	@Override
	public boolean updateRestaurant(Restaurant restaurant) {

		try (Connection connection = DBConnection.getConnection();
				PreparedStatement preparedStatement = connection.prepareStatement(UPDATE_RESTAURANT)) {

			preparedStatement.setString(1, restaurant.getName());
			preparedStatement.setString(2, restaurant.getDescription());
			preparedStatement.setString(3, restaurant.getAddress());
			preparedStatement.setString(4, restaurant.getPhone());
			preparedStatement.setBigDecimal(5, restaurant.getRating());
			preparedStatement.setInt(6, restaurant.getDeliveryTime());
			preparedStatement.setString(7, restaurant.getImageUrl());
			preparedStatement.setInt(8, restaurant.getRestaurantId());

			int rowsAffected = preparedStatement.executeUpdate();

			return rowsAffected > 0;

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return false;
	}

	@Override
	public boolean deleteRestaurant(int restaurantId) {

		try (Connection connection = DBConnection.getConnection();
				PreparedStatement preparedStatement = connection.prepareStatement(DELETE_RESTAURANT)) {

			preparedStatement.setInt(1, restaurantId);

			int rowsAffected = preparedStatement.executeUpdate();

			return rowsAffected > 0;

		} catch (SQLException e) {
			e.printStackTrace();
		}

		return false;
	}

	private Restaurant mapResultSetToRestaurant(ResultSet resultSet) throws SQLException {

		Restaurant restaurant = new Restaurant();

		restaurant.setRestaurantId(resultSet.getInt("restaurant_id"));

		restaurant.setName(resultSet.getString("name"));

		restaurant.setDescription(resultSet.getString("description"));

		restaurant.setAddress(resultSet.getString("address"));

		restaurant.setPhone(resultSet.getString("phone"));

		restaurant.setRating(resultSet.getBigDecimal("rating"));

		restaurant.setDeliveryTime(resultSet.getInt("delivery_time"));

		restaurant.setCreatedDate(resultSet.getTimestamp("created_date"));

		restaurant.setImageUrl(resultSet.getString("image_url"));

		return restaurant;
	}
}