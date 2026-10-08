package com.food.daoimpl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.food.dao.OrderItemDAO;
import com.food.model.OrderItem;
import com.food.util.DBConnection;

public class OrderItemDAOImpl implements OrderItemDAO {

    private static final String INSERT_ORDER_ITEM =
            "INSERT INTO order_items "
            + "(order_id, menu_id, quantity, price, subtotal) "
            + "VALUES (?, ?, ?, ?, ?)";

    private static final String SELECT_ORDER_ITEM_BY_ID =
            "SELECT * FROM order_items WHERE order_item_id = ?";

    private static final String SELECT_ALL_ORDER_ITEMS =
            "SELECT * FROM order_items";

    private static final String SELECT_ORDER_ITEMS_BY_ORDER_ID =
            "SELECT * FROM order_items WHERE order_id = ?";

    private static final String UPDATE_ORDER_ITEM =
            "UPDATE order_items SET "
            + "order_id = ?, "
            + "menu_id = ?, "
            + "quantity = ?, "
            + "price = ?, "
            + "subtotal = ? "
            + "WHERE order_item_id = ?";

    private static final String DELETE_ORDER_ITEM =
            "DELETE FROM order_items WHERE order_item_id = ?";


    // =========================================================
    // CREATE ORDER ITEM
    // =========================================================

    @Override
    public boolean addOrderItem(OrderItem orderItem) {

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                INSERT_ORDER_ITEM
                        )
        ) {

            preparedStatement.setInt(
                    1,
                    orderItem.getOrderId()
            );

            preparedStatement.setInt(
                    2,
                    orderItem.getMenuId()
            );

            preparedStatement.setInt(
                    3,
                    orderItem.getQuantity()
            );

            preparedStatement.setBigDecimal(
                    4,
                    orderItem.getPrice()
            );

            preparedStatement.setBigDecimal(
                    5,
                    orderItem.getSubtotal()
            );

            int rowsAffected =
                    preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // =========================================================
    // GET ORDER ITEM BY ID
    // =========================================================

    @Override
    public OrderItem getOrderItemById(int orderItemId) {

        OrderItem orderItem = null;

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_ORDER_ITEM_BY_ID
                        )
        ) {

            preparedStatement.setInt(
                    1,
                    orderItemId
            );

            try (
                    ResultSet resultSet =
                            preparedStatement.executeQuery()
            ) {

                if (resultSet.next()) {

                    orderItem =
                            mapResultSetToOrderItem(
                                    resultSet
                            );
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return orderItem;
    }


    // =========================================================
    // GET ALL ORDER ITEMS
    // =========================================================

    @Override
    public List<OrderItem> getAllOrderItems() {

        List<OrderItem> orderItems =
                new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_ALL_ORDER_ITEMS
                        );

                ResultSet resultSet =
                        preparedStatement.executeQuery()
        ) {

            while (resultSet.next()) {

                OrderItem orderItem =
                        mapResultSetToOrderItem(
                                resultSet
                        );

                orderItems.add(orderItem);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return orderItems;
    }


    // =========================================================
    // GET ORDER ITEMS BY ORDER ID
    // =========================================================

    @Override
    public List<OrderItem> getOrderItemsByOrderId(
            int orderId) {

        List<OrderItem> orderItems =
                new ArrayList<>();

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                SELECT_ORDER_ITEMS_BY_ORDER_ID
                        )
        ) {

            preparedStatement.setInt(
                    1,
                    orderId
            );

            try (
                    ResultSet resultSet =
                            preparedStatement.executeQuery()
            ) {

                while (resultSet.next()) {

                    OrderItem orderItem =
                            mapResultSetToOrderItem(
                                    resultSet
                            );

                    orderItems.add(orderItem);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return orderItems;
    }


    // =========================================================
    // UPDATE ORDER ITEM
    // =========================================================

    @Override
    public boolean updateOrderItem(
            OrderItem orderItem) {

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                UPDATE_ORDER_ITEM
                        )
        ) {

            preparedStatement.setInt(
                    1,
                    orderItem.getOrderId()
            );

            preparedStatement.setInt(
                    2,
                    orderItem.getMenuId()
            );

            preparedStatement.setInt(
                    3,
                    orderItem.getQuantity()
            );

            preparedStatement.setBigDecimal(
                    4,
                    orderItem.getPrice()
            );

            preparedStatement.setBigDecimal(
                    5,
                    orderItem.getSubtotal()
            );

            preparedStatement.setInt(
                    6,
                    orderItem.getOrderItemId()
            );

            int rowsAffected =
                    preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // =========================================================
    // DELETE ORDER ITEM
    // =========================================================

    @Override
    public boolean deleteOrderItem(
            int orderItemId) {

        try (
                Connection connection = DBConnection.getConnection();

                PreparedStatement preparedStatement =
                        connection.prepareStatement(
                                DELETE_ORDER_ITEM
                        )
        ) {

            preparedStatement.setInt(
                    1,
                    orderItemId
            );

            int rowsAffected =
                    preparedStatement.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // =========================================================
    // RESULT SET → ORDER ITEM OBJECT
    // =========================================================

    private OrderItem mapResultSetToOrderItem(
            ResultSet resultSet)
            throws SQLException {

        OrderItem orderItem =
                new OrderItem();

        orderItem.setOrderItemId(
                resultSet.getInt(
                        "order_item_id"
                )
        );

        orderItem.setOrderId(
                resultSet.getInt(
                        "order_id"
                )
        );

        orderItem.setMenuId(
                resultSet.getInt(
                        "menu_id"
                )
        );

        orderItem.setQuantity(
                resultSet.getInt(
                        "quantity"
                )
        );

        orderItem.setPrice(
                resultSet.getBigDecimal(
                        "price"
                )
        );

        orderItem.setSubtotal(
                resultSet.getBigDecimal(
                        "subtotal"
                )
        );

        return orderItem;
    }
}