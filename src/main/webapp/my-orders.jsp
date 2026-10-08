<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%@ page import="java.util.List" %>
<%@ page import="com.food.model.Order" %>

<%
    List<Order> orders =
            (List<Order>) request.getAttribute("orders");
%>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>My Orders - FAah!! FOOD</title>

    <link rel="preconnect"
          href="https://fonts.googleapis.com">

    <link rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">

    <link
        rel="stylesheet"
        href="<%=request.getContextPath()%>/css/style.css">

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: #f4f8ff;
            color: #111827;
            font-family: "Plus Jakarta Sans",
                         Arial,
                         Helvetica,
                         sans-serif;
        }

        a {
            text-decoration: none;
        }

        .orders-page {
            min-height: 100vh;
            padding: 110px 30px 60px;
        }

        .orders-container {
            max-width: 1100px;
            margin: 0 auto;
        }

        .orders-header {
            margin-bottom: 30px;
        }

        .orders-header h1 {
            margin: 0 0 8px;
            font-size: 34px;
            font-weight: 800;
            color: #111827;
        }

        .orders-header p {
            margin: 0;
            color: #6b7280;
            font-size: 15px;
        }

        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        .order-card {
            background: #ffffff;
            border-radius: 18px;
            padding: 24px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 8px 25px rgba(15, 23, 42, 0.06);
            transition: 0.25s ease;
        }

        .order-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.10);
        }

        .order-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 18px;
            border-bottom: 1px solid #eef0f4;
        }

        .order-id {
            font-size: 18px;
            font-weight: 800;
            color: #111827;
        }

        .order-date {
            margin-top: 5px;
            font-size: 13px;
            color: #6b7280;
        }

        .status {
            display: inline-flex;
            align-items: center;
            padding: 7px 13px;
            border-radius: 999px;
            background: #e8f7ee;
            color: #15803d;
            font-size: 12px;
            font-weight: 700;
        }

        .order-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 20px 0;
        }

        .detail-box {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .detail-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
        }

        .detail-value {
            font-size: 15px;
            color: #111827;
            font-weight: 700;
        }

        .address-section {
            padding-top: 18px;
            border-top: 1px solid #eef0f4;
        }

        .address-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 6px;
        }

        .address-value {
            font-size: 14px;
            color: #374151;
            line-height: 1.6;
        }

        .empty-orders {
            background: #ffffff;
            border-radius: 20px;
            padding: 60px 30px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }

        .empty-icon {
            font-size: 55px;
            margin-bottom: 15px;
        }

        .empty-orders h2 {
            margin: 0 0 8px;
            font-size: 24px;
            font-weight: 800;
        }

        .empty-orders p {
            margin: 0 0 25px;
            color: #6b7280;
            font-size: 14px;
        }

        .shop-button {
            display: inline-block;
            padding: 12px 22px;
            border-radius: 10px;
            background: #2563eb;
            color: white;
            font-size: 14px;
            font-weight: 700;
            transition: 0.2s ease;
        }

        .shop-button:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }

        @media (max-width: 700px) {

            .orders-page {
                padding: 95px 16px 40px;
            }

            .orders-header h1 {
                font-size: 28px;
            }

            .order-top {
                flex-direction: column;
                align-items: flex-start;
            }

            .order-details {
                grid-template-columns: 1fr;
                gap: 15px;
            }
        }

    </style>

</head>

<body>

    <%@ include file="common/navbar.jsp" %>

    <main class="orders-page">

        <div class="orders-container">

            <div class="orders-header">

                <h1>My Orders</h1>

                <p>
                    View your previous orders and their current status.
                </p>

            </div>


            <%
                if (orders == null || orders.isEmpty()) {
            %>

                <div class="empty-orders">

                    <div class="empty-icon">
                        🍽️
                    </div>

                    <h2>No Orders Yet</h2>

                    <p>
                        You haven't placed any orders yet.
                        Start exploring delicious food!
                    </p>

                    <a
                        href="<%=request.getContextPath()%>/"
                        class="shop-button">
                        Browse Food
                    </a>

                </div>

            <%
                } else {
            %>

                <div class="orders-list">

                    <%
                        for (Order order : orders) {
                    %>

                        <div class="order-card">

                            <div class="order-top">

                                <div>

                                    <div class="order-id">
                                        Order #<%=order.getOrderId()%>
                                    </div>

                                    <div class="order-date">
                                        <%=order.getOrderDate()%>
                                    </div>

                                </div>

                                <div class="status">
                                    <%=order.getStatus()%>
                                </div>

                            </div>


                            <div class="order-details">

                                <div class="detail-box">

                                    <span class="detail-label">
                                        Total Amount
                                    </span>

                                    <span class="detail-value">
                                        ₹<%=order.getTotalAmount()%>
                                    </span>

                                </div>


                                <div class="detail-box">

                                    <span class="detail-label">
                                        Payment Method
                                    </span>

                                    <span class="detail-value">

                                        <%
                                            String paymentMethod =
                                                    order.getPaymentMethod();

                                            if ("COD".equals(paymentMethod)) {
                                        %>
                                            Cash on Delivery
                                        <%
                                            } else if ("UPI".equals(paymentMethod)) {
                                        %>
                                            UPI
                                        <%
                                            } else if ("CARD".equals(paymentMethod)) {
                                        %>
                                            Credit / Debit Card
                                        <%
                                            } else {
                                        %>
                                            <%=paymentMethod != null
                                                ? paymentMethod
                                                : "Not specified"%>
                                        <%
                                            }
                                        %>

                                    </span>

                                </div>


                                <div class="detail-box">

                                    <span class="detail-label">
                                        Payment Status
                                    </span>

                                    <span class="detail-value">
                                        <%=order.getPaymentStatus()%>
                                    </span>

                                </div>

                            </div>


                            <div class="address-section">

                                <div class="address-label">
                                    Delivery Address
                                </div>

                                <div class="address-value">
                                    <%=order.getDeliveryAddress()%>
                                </div>

                            </div>

                        </div>

                    <%
                        }
                    %>

                </div>

            <%
                }
            %>

        </div>

    </main>

</body>

</html>