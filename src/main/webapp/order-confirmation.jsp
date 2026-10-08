<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%@ page import="com.food.model.Order" %>

<%
    Order order = (Order) request.getAttribute("order");

    if (order == null) {
        response.sendRedirect(
                request.getContextPath() + "/"
        );
        return;
    }
%>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Order Confirmed - FAah!! FOOD</title>

    <!-- Google Font -->
    <link rel="preconnect"
          href="https://fonts.googleapis.com">

    <link rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet">

    <!-- Main CSS -->
    <link rel="stylesheet"
          href="<%=request.getContextPath()%>/css/style.css">


    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: #f4f8ff;
            color: #111827;
            font-family:
                "Plus Jakarta Sans",
                Arial,
                Helvetica,
                sans-serif;
        }


        .confirmation-page {

            min-height: 100vh;

            padding:
                110px
                20px
                60px;

            display: flex;

            align-items: center;

            justify-content: center;
        }


        .confirmation-container {

            width: 100%;

            max-width: 760px;

            margin: 0 auto;
        }


        /* =====================================================
           SUCCESS CARD
           ===================================================== */

        .success-card {

            background: #ffffff;

            border:
                1px solid #dce7f7;

            border-radius: 24px;

            padding: 45px 40px;

            text-align: center;

            box-shadow:
                0 15px 45px
                rgba(30, 70, 120, 0.08);
        }


        /* =====================================================
           SUCCESS ICON
           ===================================================== */

        .success-icon {

            width: 82px;

            height: 82px;

            margin: 0 auto 22px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 50%;

            background: #e8f7ee;

            color: #16834b;

            font-size: 42px;

            font-weight: 800;

            border:
                8px solid #f1fbf5;
        }


        .success-card h1 {

            margin: 0;

            font-size: 30px;

            font-weight: 800;

            letter-spacing: -0.6px;

            color: #111827;
        }


        .success-message {

            margin:
                10px
                auto
                28px;

            max-width: 520px;

            color: #667085;

            font-size: 14px;

            line-height: 1.7;
        }


        /* =====================================================
           ORDER DETAILS
           ===================================================== */

        .order-details {

            margin-top: 25px;

            padding: 22px;

            background: #f8fbff;

            border:
                1px solid #e1eaf6;

            border-radius: 16px;

            text-align: left;
        }


        .order-details-title {

            margin: 0 0 17px;

            font-size: 15px;

            font-weight: 800;

            color: #111827;
        }


        .detail-row {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 20px;

            padding:
                12px
                0;

            border-bottom:
                1px solid #e7edf6;

            font-size: 13px;
        }


        .detail-row:last-child {

            border-bottom: none;

            padding-bottom: 0;
        }


        .detail-row:first-of-type {

            padding-top: 0;
        }


        .detail-label {

            color: #667085;

            font-weight: 500;
        }


        .detail-value {

            color: #111827;

            font-weight: 700;

            text-align: right;

            word-break: break-word;
        }


        .order-status {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            padding:
                6px
                11px;

            border-radius: 999px;

            background: #e8f7ee;

            color: #16834b;

            font-size: 11px;

            font-weight: 800;

            text-transform: uppercase;

            letter-spacing: 0.3px;
        }


        .order-total {

            color: #0050cb;

            font-size: 17px;

            font-weight: 800;
        }


        /* =====================================================
           DELIVERY ADDRESS
           ===================================================== */

        .address-box {

            margin-top: 18px;

            padding: 16px;

            border:
                1px solid #dce7f7;

            border-radius: 13px;

            background: #ffffff;
        }


        .address-label {

            display: block;

            margin-bottom: 6px;

            color: #667085;

            font-size: 11px;

            font-weight: 700;

            text-transform: uppercase;

            letter-spacing: 0.4px;
        }


        .address-text {

            color: #111827;

            font-size: 13px;

            line-height: 1.6;

            font-weight: 600;
        }


        /* =====================================================
           ACTION BUTTONS
           ===================================================== */

        .action-buttons {

            display: flex;

            gap: 12px;

            margin-top: 30px;
        }


        .action-button {

            flex: 1;

            display: flex;

            align-items: center;

            justify-content: center;

            min-height: 48px;

            padding:
                12px
                18px;

            border-radius: 13px;

            text-decoration: none;

            font-size: 13px;

            font-weight: 750;

            transition:
                0.2s ease;
        }


        .primary-button {

            background: #1769e0;

            color: #ffffff;

            box-shadow:
                0 8px 18px
                rgba(23, 105, 224, 0.20);
        }


        .primary-button:hover {

            background: #0050cb;

            transform:
                translateY(-1px);
        }


        .secondary-button {

            background: #ffffff;

            color: #0050cb;

            border:
                1px solid #cbd9ec;
        }


        .secondary-button:hover {

            background: #f5f9ff;

            border-color: #8eb5f5;

            transform:
                translateY(-1px);
        }


        /* =====================================================
           FOOT NOTE
           ===================================================== */

        .confirmation-note {

            margin-top: 22px;

            color: #667085;

            font-size: 11px;

            line-height: 1.6;
        }


        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 600px) {

            .confirmation-page {

                padding:
                    90px
                    15px
                    40px;
            }


            .success-card {

                padding:
                    32px
                    20px;

                border-radius: 20px;
            }


            .success-card h1 {

                font-size: 25px;
            }


            .success-icon {

                width: 70px;

                height: 70px;

                font-size: 34px;
            }


            .action-buttons {

                flex-direction: column;
            }


            .detail-row {

                align-items: flex-start;

                flex-direction: column;

                gap: 5px;
            }


            .detail-value {

                text-align: left;
            }
        }

    </style>

</head>


<body>


    <!-- =====================================================
         NAVBAR
         ===================================================== -->

    <jsp:include page="/common/navbar.jsp" />


    <!-- =====================================================
         CONFIRMATION PAGE
         ===================================================== -->

    <main class="confirmation-page">

        <div class="confirmation-container">


            <section class="success-card">


                <!-- SUCCESS ICON -->

                <div class="success-icon">
                    ✓
                </div>


                <!-- HEADING -->

                <h1>
                    Order Placed Successfully!
                </h1>


                <p class="success-message">

                    Thank you for ordering with
                    <strong>FAah!! FOOD</strong>.

                    Your order has been placed successfully
                    and is now being prepared.

                </p>


                <!-- =================================================
                     ORDER DETAILS
                     ================================================= -->

                <div class="order-details">

                    <h2 class="order-details-title">
                        Order Details
                    </h2>


                    <!-- ORDER ID -->

                    <div class="detail-row">

                        <span class="detail-label">
                            Order ID
                        </span>

                        <span class="detail-value">
                            #<%=order.getOrderId()%>
                        </span>

                    </div>


                    <!-- ORDER STATUS -->

                    <div class="detail-row">

                        <span class="detail-label">
                            Status
                        </span>

                        <span class="detail-value">

                            <span class="order-status">
                                <%=order.getStatus()%>
                            </span>

                        </span>

                    </div>


                    <!-- PAYMENT METHOD -->

                    <div class="detail-row">

                        <span class="detail-label">
                            Payment Method
                        </span>

                        <span class="detail-value">

                            <%
                                String paymentMethod =
                                        order.getPaymentMethod();

                                if (paymentMethod == null
                                        || paymentMethod.isEmpty()) {

                                    paymentMethod = "Not specified";
                                }

                                if ("COD".equals(paymentMethod)) {
                                    paymentMethod =
                                            "Cash on Delivery";
                                } else if ("UPI".equals(paymentMethod)) {
                                    paymentMethod = "UPI";
                                } else if ("CARD".equals(paymentMethod)) {
                                    paymentMethod =
                                            "Credit / Debit Card";
                                }
                            %>

                            <%=paymentMethod%>

                        </span>

                    </div>


                    <!-- TOTAL -->

                    <div class="detail-row">

                        <span class="detail-label">
                            Total Amount
                        </span>

                        <span class="detail-value order-total">

                            ₹<%=order.getTotalAmount()%>

                        </span>

                    </div>


                    <!-- DELIVERY ADDRESS -->

                    <div class="address-box">

                        <span class="address-label">
                            Delivery Address
                        </span>

                        <div class="address-text">

                            <%=order.getDeliveryAddress()%>

                        </div>

                    </div>

                </div>


                <!-- =================================================
                     ACTION BUTTONS
                     ================================================= -->

                <div class="action-buttons">


                    <a
                        href="<%=request.getContextPath()%>/my-orders"
                        class="action-button primary-button">

                        View My Orders →

                    </a>


                    <a
                        href="<%=request.getContextPath()%>/"
                        class="action-button secondary-button">

                        Continue Shopping

                    </a>


                </div>


                <!-- NOTE -->

                <div class="confirmation-note">

                    Your order details have been saved successfully.
                    You can view your order history anytime from
                    <strong>My Orders</strong>.

                </div>


            </section>

        </div>

    </main>


</body>

</html>