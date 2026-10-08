package com.food.daoimpl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.food.dao.OrderDAO;
import com.food.model.Order;
import com.food.util.DBConnection;

public class OrderDAOImpl implements OrderDAO {

    private static final String INSERT_ORDER =
            "INSERT INTO orders "
            + "(user_id, restaurant_id, total_amount, status, payment_method, payment_status, delivery_address) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?)";

    private static final String SELECT_ORDER_BY_ID =
            "SELECT * FROM orders WHERE order_id = ?";

    private static final String SELECT_ALL_ORDERS =
            "SELECT * FROM orders";

    private static final String SELECT_ORDERS_BY_USER_ID =
            "SELECT * FROM orders WHERE user_id = ?";

    private static final String SELECT_ORDERS_BY_RESTAURANT_ID =
            "SELECT * FROM orders WHERE restaurant_id = ?";

    private static final String UPDATE_ORDER =
            "UPDATE orders SET "
            + "user_id = ?, "
            + "restaurant_id = ?, "
            + "total_amount = ?, "
            + "status = ?, "
            + "payment_method = ?, "
            + "payment_status = ?, "
            + "delivery_address = ? "
            + "WHERE order_id = ?";

    private static final String UPDATE_ORDER_STATUS =
            "UPDATE orders SET status = ? WHERE order_id = ?";

    private static final String DELETE_ORDER =
            "DELETE FROM orders WHERE order_id = ?";


    // =========================================================
    // CREATE ORDER
    // =========================================================

    @Override
    public boolean addOrder(Order order) {

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                INSERT_ORDER,
                                Statement.RETURN_GENERATED_KEYS
                        )
        ) {

            preparedStatement.setInt(1, order.getUserId());
            preparedStatement.setInt(2, order.getRestaurantId());
            preparedStatement.setBigDecimal(3, order.getTotalAmount());
            preparedStatement.setString(4, order.getStatus());

            // No payment system in our project
            preparedStatement.setString(5, null);

            // Keep database default: PENDING
            preparedStatement.setString(6, "PENDING");

            preparedStatement.setString(7, order.getDeliveryAddress());

            int rowsAffected = preparedStatement.executeUpdate();

            if (rowsAffected == 0) {
                return false;
            }

            // Get generated order ID
            try (ResultSet generatedKeys =
                         preparedStatement.getGeneratedKeys()) {

                if (generatedKeys.next()) {

                    int generatedOrderId =
                            generatedKeys.getInt(1);

                    order.setOrderId(generatedOrderId);

                    return true;
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @Override
    public Order getOrderById(int orderId) {

        Order order = null;

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_ORDER_BY_ID
                        )
        ) {

            preparedStatement.setInt(1, orderId);

            try (ResultSet resultSet =
                         preparedStatement.executeQuery()) {

                if (resultSet.next()) {
                    order = mapResultSetToOrder(resultSet);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return order;
    }


    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    @Override
    public List<Order> getAllOrders() {

        List<Order> orders = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_ALL_ORDERS
                        );

                ResultSet resultSet =
                        preparedStatement.executeQuery()
        ) {

            while (resultSet.next()) {

                Order order =
                        mapResultSetToOrder(resultSet);

                orders.add(order);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return orders;
    }


    // =========================================================
    // GET ORDERS BY USER ID
    // =========================================================

    @Override
    public List<Order> getOrdersByUserId(int userId) {

        List<Order> orders = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_ORDERS_BY_USER_ID
                        )
        ) {

            preparedStatement.setInt(1, userId);

            try (ResultSet resultSet =
                         preparedStatement.executeQuery()) {

                while (resultSet.next()) {

                    Order order =
                            mapResultSetToOrder(resultSet);

                    orders.add(order);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return orders;
    }


    // =========================================================
    // GET ORDERS BY RESTAURANT ID
    // =========================================================

    @Override
    public List<Order> getOrdersByRestaurantId(int restaurantId) {

        List<Order> orders = new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_ORDERS_BY_RESTAURANT_ID
                        )
        ) {

            preparedStatement.setInt(1, restaurantId);

            try (ResultSet resultSet =
                         preparedStatement.executeQuery()) {

                while (resultSet.next()) {

                    Order order =
                            mapResultSetToOrder(resultSet);

                    orders.add(order);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return orders;
    }


    // =========================================================
    // UPDATE ORDER
    // =========================================================

    @Override
    public boolean updateOrder(Order order) {

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                UPDATE_ORDER
                        )
        ) {

            preparedStatement.setInt(1, order.getUserId());
            preparedStatement.setInt(2, order.getRestaurantId());
            preparedStatement.setBigDecimal(3, order.getTotalAmount());
            preparedStatement.setString(4, order.getStatus());
            preparedStatement.setString(5, order.getPaymentMethod());
            preparedStatement.setString(6, order.getPaymentStatus());
            preparedStatement.setString(7, order.getDeliveryAddress());
            preparedStatement.setInt(8, order.getOrderId());

            int rowsAffected =
                    preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @Override
    public boolean updateOrderStatus(
            int orderId,
            String status) {

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                UPDATE_ORDER_STATUS
                        )
        ) {

            preparedStatement.setString(1, status);
            preparedStatement.setInt(2, orderId);

            int rowsAffected =
                    preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // =========================================================
    // DELETE ORDER
    // =========================================================

    @Override
    public boolean deleteOrder(int orderId) {

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                DELETE_ORDER
                        )
        ) {

            preparedStatement.setInt(1, orderId);

            int rowsAffected =
                    preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // =========================================================
    // RESULT SET → ORDER OBJECT
    // =========================================================

    private Order mapResultSetToOrder(
            ResultSet resultSet) throws SQLException {

        Order order = new Order();

        order.setOrderId(
                resultSet.getInt("order_id")
        );

        order.setUserId(
                resultSet.getInt("user_id")
        );

        order.setRestaurantId(
                resultSet.getInt("restaurant_id")
        );

        order.setOrderDate(
                resultSet.getTimestamp("order_date")
        );

        order.setTotalAmount(
                resultSet.getBigDecimal("total_amount")
        );

        order.setStatus(
                resultSet.getString("status")
        );

        order.setPaymentMethod(
                resultSet.getString("payment_method")
        );

        order.setPaymentStatus(
                resultSet.getString("payment_status")
        );

        order.setDeliveryAddress(
                resultSet.getString("delivery_address")
        );

        return order;
    }
}