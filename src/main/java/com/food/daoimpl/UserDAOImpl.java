package com.food.daoimpl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.food.dao.UserDAO;
import com.food.model.User;
import com.food.util.DBConnection;

public class UserDAOImpl implements UserDAO {

    private static final String INSERT_USER =
            "INSERT INTO users "
            + "(name, email, password, phone, address, role) "
            + "VALUES (?, ?, ?, ?, ?, ?)";

    private static final String SELECT_USER_BY_ID =
            "SELECT * FROM users WHERE user_id = ?";

    private static final String SELECT_USER_BY_EMAIL =
            "SELECT * FROM users WHERE email = ?";

    private static final String SELECT_ALL_USERS =
            "SELECT * FROM users";

    private static final String UPDATE_USER =
            "UPDATE users SET "
            + "name = ?, "
            + "email = ?, "
            + "password = ?, "
            + "phone = ?, "
            + "address = ?, "
            + "role = ? "
            + "WHERE user_id = ?";

    private static final String DELETE_USER =
            "DELETE FROM users WHERE user_id = ?";

    @Override
    public boolean addUser(User user) {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(INSERT_USER)
        ) {

            preparedStatement.setString(1, user.getName());
            preparedStatement.setString(2, user.getEmail());
            preparedStatement.setString(3, user.getPassword());
            preparedStatement.setString(4, user.getPhone());
            preparedStatement.setString(5, user.getAddress());
            preparedStatement.setString(6, user.getRole());

            int rowsAffected = preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public User getUserById(int userId) {

        User user = null;

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(SELECT_USER_BY_ID)
        ) {

            preparedStatement.setInt(1, userId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {

                if (resultSet.next()) {
                    user = mapResultSetToUser(resultSet);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return user;
    }

    @Override
    public User getUserByEmail(String email) {

        User user = null;

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(SELECT_USER_BY_EMAIL)
        ) {

            preparedStatement.setString(1, email);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {

                if (resultSet.next()) {
                    user = mapResultSetToUser(resultSet);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return user;
    }

    @Override
    public List<User> getAllUsers() {

        List<User> users = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(SELECT_ALL_USERS);
                ResultSet resultSet = preparedStatement.executeQuery()
        ) {

            while (resultSet.next()) {
                User user = mapResultSetToUser(resultSet);
                users.add(user);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return users;
    }

    @Override
    public boolean updateUser(User user) {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(UPDATE_USER)
        ) {

            preparedStatement.setString(1, user.getName());
            preparedStatement.setString(2, user.getEmail());
            preparedStatement.setString(3, user.getPassword());
            preparedStatement.setString(4, user.getPhone());
            preparedStatement.setString(5, user.getAddress());
            preparedStatement.setString(6, user.getRole());
            preparedStatement.setInt(7, user.getUserId());

            int rowsAffected = preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public boolean deleteUser(int userId) {

        try (
                Connection connection = DBConnection.getConnection();
                PreparedStatement preparedStatement =
                        connection.prepareStatement(DELETE_USER)
        ) {

            preparedStatement.setInt(1, userId);

            int rowsAffected = preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    private User mapResultSetToUser(ResultSet resultSet) throws SQLException {

        User user = new User();

        user.setUserId(resultSet.getInt("user_id"));
        user.setName(resultSet.getString("name"));
        user.setEmail(resultSet.getString("email"));
        user.setPassword(resultSet.getString("password"));
        user.setPhone(resultSet.getString("phone"));
        user.setAddress(resultSet.getString("address"));
        user.setRole(resultSet.getString("role"));
        user.setCreatedDate(resultSet.getTimestamp("created_date"));
        user.setLastLoginDate(resultSet.getTimestamp("last_login_date"));

        return user;
    }
}