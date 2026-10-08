<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%@ page import="com.food.model.Cart" %>
<%@ page import="com.food.model.CartItem" %>

<%
    Cart cart = (Cart) request.getAttribute("cart");

    String paymentError =
            (String) request.getAttribute("paymentError");

    String checkoutName =
            (String) session.getAttribute("checkoutName");

    String checkoutPhone =
            (String) session.getAttribute("checkoutPhone");

    String checkoutAddress =
            (String) session.getAttribute("checkoutAddress");

    String checkoutInstructions =
            (String) session.getAttribute("checkoutInstructions");
%>


<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Payment - FAah!! FOOD</title>


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

        /* =====================================================
           PAYMENT PAGE
           ===================================================== */

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


        a {
            text-decoration: none;
        }


        button,
        input {
            font-family: inherit;
        }


        /* =====================================================
           PAGE
           ===================================================== */

        .payment-page {

            min-height: 100vh;

            padding: 95px 36px 60px;

        }


        .payment-container {

            max-width: 1100px;

            margin: 0 auto;

        }


        /* =====================================================
           BREADCRUMB
           ===================================================== */

        .payment-breadcrumb {

            display: flex;

            align-items: center;

            justify-content: space-between;

            margin-bottom: 24px;

            padding: 12px 2px;

        }


        .back-to-checkout {

            color: #0050cb;

            font-size: 14px;

            font-weight: 600;

            transition: 0.2s ease;

        }


        .back-to-checkout:hover {

            color: #003fa4;

            transform: translateX(-2px);

        }


        .breadcrumb-right {

            color: #667085;

            font-size: 13px;

        }


        .breadcrumb-right span:last-child {

            color: #111827;

            font-weight: 600;

        }


        /* =====================================================
           HEADING
           ===================================================== */

        .payment-heading {

            margin-bottom: 25px;

        }


        .payment-heading h1 {

            margin: 0;

            font-size: 32px;

            font-weight: 800;

            letter-spacing: -0.6px;

        }


        .payment-heading p {

            margin: 8px 0 0;

            color: #667085;

            font-size: 14px;

        }


        /* =====================================================
           ERROR
           ===================================================== */

        .payment-error {

            margin-bottom: 20px;

            padding: 13px 16px;

            border: 1px solid #f5c2c7;

            border-radius: 12px;

            background: #fff5f5;

            color: #b42318;

            font-size: 13px;

            font-weight: 600;

        }


        /* =====================================================
           LAYOUT
           ===================================================== */

        .payment-layout {

            display: grid;

            grid-template-columns:
                minmax(0, 1fr)
                380px;

            gap: 24px;

            align-items: start;

        }


        /* =====================================================
           CARD
           ===================================================== */

        .payment-card {

            background: #ffffff;

            border: 1px solid #dce7f7;

            border-radius: 20px;

            padding: 25px;

            box-shadow:
                0 8px 30px rgba(30, 70, 120, 0.06);

            margin-bottom: 20px;

        }


        .payment-card:last-child {

            margin-bottom: 0;

        }


        /* =====================================================
           CARD HEADER
           ===================================================== */

        .card-header {

            display: flex;

            align-items: center;

            gap: 12px;

            margin-bottom: 22px;

        }


        .card-icon {

            width: 40px;

            height: 40px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 11px;

            background: #e8f0ff;

            color: #0050cb;

            font-size: 18px;

        }


        .card-header h2 {

            margin: 0;

            font-size: 18px;

            font-weight: 800;

        }


        .card-header p {

            margin: 4px 0 0;

            color: #667085;

            font-size: 12px;

        }


        /* =====================================================
           PAYMENT METHODS
           ===================================================== */

        .payment-methods {

            display: flex;

            flex-direction: column;

            gap: 12px;

        }


        .payment-option {

            position: relative;

        }


        .payment-option input {

            position: absolute;

            opacity: 0;

            pointer-events: none;

        }


        .payment-option label {

            display: flex;

            align-items: center;

            gap: 14px;

            width: 100%;

            padding: 16px;

            border: 1px solid #d7e1ef;

            border-radius: 14px;

            background: #ffffff;

            cursor: pointer;

            transition: 0.2s ease;

        }


        .payment-option label:hover {

            border-color: #8eb5f5;

            background: #f8fbff;

        }


        .payment-option input:checked + label {

            border-color: #1769e0;

            background: #eff6ff;

            box-shadow:
                0 0 0 2px rgba(23, 105, 224, 0.08);

        }


        .payment-radio {

            width: 20px;

            height: 20px;

            border: 2px solid #b8c4d4;

            border-radius: 50%;

            flex-shrink: 0;

            display: flex;

            align-items: center;

            justify-content: center;

        }


        .payment-option input:checked + label .payment-radio {

            border-color: #1769e0;

        }


        .payment-option input:checked
        + label
        .payment-radio::after {

            content: "";

            width: 9px;

            height: 9px;

            border-radius: 50%;

            background: #1769e0;

        }


        .payment-method-icon {

            width: 42px;

            height: 42px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 10px;

            background: #f1f5f9;

            font-size: 20px;

            flex-shrink: 0;

        }


        .payment-method-info {

            flex: 1;

        }


        .payment-method-info strong {

            display: block;

            color: #111827;

            font-size: 14px;

            font-weight: 750;

        }


        .payment-method-info span {

            display: block;

            margin-top: 3px;

            color: #667085;

            font-size: 11px;

        }


        /* =====================================================
           DELIVERY SUMMARY
           ===================================================== */

        .delivery-info {

            display: flex;

            flex-direction: column;

            gap: 13px;

        }


        .delivery-row {

            display: flex;

            gap: 12px;

        }


        .delivery-row-icon {

            width: 34px;

            height: 34px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 9px;

            background: #eff6ff;

            color: #0050cb;

            flex-shrink: 0;

        }


        .delivery-row-content {

            flex: 1;

        }


        .delivery-row-content strong {

            display: block;

            font-size: 12px;

            font-weight: 750;

        }


        .delivery-row-content span {

            display: block;

            margin-top: 3px;

            color: #667085;

            font-size: 12px;

            line-height: 1.5;

        }


        /* =====================================================
           ORDER SUMMARY
           ===================================================== */

        .order-card {

            position: sticky;

            top: 90px;

        }


        .order-items {

            border: 1px solid #e3eaf5;

            border-radius: 14px;

            overflow: hidden;

        }


        .order-item {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            padding: 14px;

            border-bottom: 1px solid #edf1f7;

        }


        .order-item:last-child {

            border-bottom: none;

        }


        .order-item-left {

            display: flex;

            align-items: center;

            gap: 11px;

            min-width: 0;

        }


        .order-item-image {

            width: 50px;

            height: 50px;

            flex-shrink: 0;

            overflow: hidden;

            border-radius: 10px;

            background: #eef3fa;

            border: 1px solid #e0e8f4;

        }


        .order-item-image img {

            width: 100%;

            height: 100%;

            display: block;

            object-fit: cover;

        }


        .order-item-details {

            min-width: 0;

        }


        .order-item-details h3 {

            margin: 0 0 4px;

            font-size: 13px;

            font-weight: 750;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

        }


        .order-item-details span {

            color: #667085;

            font-size: 11px;

        }


        .order-item-price {

            flex-shrink: 0;

            text-align: right;

        }


        .order-item-price strong {

            display: block;

            font-size: 13px;

            font-weight: 800;

        }


        .order-item-price span {

            display: block;

            margin-top: 3px;

            color: #667085;

            font-size: 10px;

        }


        /* =====================================================
           TOTAL
           ===================================================== */

        .order-divider {

            height: 1px;

            margin: 20px 0;

            background: #e7edf6;

        }


        .total-row {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 15px;

        }


        .total-row span {

            font-size: 16px;

            font-weight: 800;

        }


        .total-row strong {

            color: #0050cb;

            font-size: 23px;

            font-weight: 850;

        }


        /* =====================================================
           PAY BUTTON
           ===================================================== */

        .pay-button {

            width: 100%;

            margin-top: 20px;

            padding: 14px;

            border: 0;

            border-radius: 13px;

            background: #1769e0;

            color: #ffffff;

            font-size: 14px;

            font-weight: 750;

            cursor: pointer;

            box-shadow:
                0 8px 18px rgba(23, 105, 224, 0.22);

            transition: 0.2s ease;

        }


        .pay-button:hover {

            background: #0050cb;

            transform: translateY(-1px);

        }


        /* =====================================================
           SECURE NOTE
           ===================================================== */

        .secure-note {

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 6px;

            margin-top: 12px;

            color: #667085;

            font-size: 10px;

            text-align: center;

        }


        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 900px) {

            .payment-layout {

                grid-template-columns: 1fr;

            }


            .order-card {

                position: static;

            }

        }


        @media (max-width: 700px) {

            .payment-page {

                padding: 85px 15px 40px;

            }


            .payment-heading h1 {

                font-size: 27px;

            }


            .payment-breadcrumb {

                align-items: flex-start;

                flex-direction: column;

                gap: 8px;

            }


            .payment-card {

                padding: 18px;

                border-radius: 17px;

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
         PAYMENT PAGE
         ===================================================== -->

    <main class="payment-page">

        <div class="payment-container">


            <!-- =================================================
                 BREADCRUMB
                 ================================================= -->

            <div class="payment-breadcrumb">

                <a href="<%=request.getContextPath()%>/checkout"
                   class="back-to-checkout">

                    ← Back to Checkout

                </a>


                <div class="breadcrumb-right">

                    <span>Home</span>

                    &nbsp;/&nbsp;

                    <span>Cart</span>

                    &nbsp;/&nbsp;

                    <span>Checkout</span>

                    &nbsp;/&nbsp;

                    <span>Payment</span>

                </div>

            </div>


            <!-- =================================================
                 HEADING
                 ================================================= -->

            <div class="payment-heading">

                <h1>Payment</h1>

                <p>
                    Choose your preferred payment method to continue.
                </p>

            </div>


            <!-- =================================================
                 ERROR
                 ================================================= -->

            <% if (paymentError != null) { %>

                <div class="payment-error">

                    ⚠ <%= paymentError %>

                </div>

            <% } %>


            <!-- =================================================
                 PAYMENT FORM
                 ================================================= -->

            <form action="<%=request.getContextPath()%>/payment"
                  method="post">


                <div class="payment-layout">


                    <!-- =========================================
                         LEFT SIDE
                         ========================================= -->

                    <div>


                        <!-- =====================================
                             PAYMENT METHODS
                             ===================================== -->

                        <section class="payment-card">


                            <div class="card-header">

                                <div class="card-icon">
                                    💳
                                </div>

                                <div>

                                    <h2>
                                        Choose Payment Method
                                    </h2>

                                    <p>
                                        Select how you want to pay.
                                    </p>

                                </div>

                            </div>


                            <div class="payment-methods">


                                <!-- CASH ON DELIVERY -->

                                <div class="payment-option">

                                    <input type="radio"
                                           id="cod"
                                           name="paymentMethod"
                                           value="COD">


                                    <label for="cod">

                                        <div class="payment-radio"></div>

                                        <div class="payment-method-icon">
                                            💵
                                        </div>

                                        <div class="payment-method-info">

                                            <strong>
                                                Cash on Delivery
                                            </strong>

                                            <span>
                                                Pay when your order arrives.
                                            </span>

                                        </div>

                                    </label>

                                </div>


                                <!-- UPI -->

                                <div class="payment-option">

                                    <input type="radio"
                                           id="upi"
                                           name="paymentMethod"
                                           value="UPI">


                                    <label for="upi">

                                        <div class="payment-radio"></div>

                                        <div class="payment-method-icon">
                                            📱
                                        </div>

                                        <div class="payment-method-info">

                                            <strong>
                                                UPI
                                            </strong>

                                            <span>
                                                Pay using your UPI app.
                                            </span>

                                        </div>

                                    </label>

                                </div>


                                <!-- CARD -->

                                <div class="payment-option">

                                    <input type="radio"
                                           id="card"
                                           name="paymentMethod"
                                           value="CARD">


                                    <label for="card">

                                        <div class="payment-radio"></div>

                                        <div class="payment-method-icon">
                                            💳
                                        </div>

                                        <div class="payment-method-info">

                                            <strong>
                                                Credit / Debit Card
                                            </strong>

                                            <span>
                                                Pay securely using your card.
                                            </span>

                                        </div>

                                    </label>

                                </div>

                            </div>

                        </section>


                        <!-- =====================================
                             DELIVERY INFORMATION
                             ===================================== -->

                        <section class="payment-card">


                            <div class="card-header">

                                <div class="card-icon">
                                    📍
                                </div>

                                <div>

                                    <h2>
                                        Delivery Details
                                    </h2>

                                    <p>
                                        Your order will be delivered here.
                                    </p>

                                </div>

                            </div>


                            <div class="delivery-info">


                                <!-- NAME -->

                                <div class="delivery-row">

                                    <div class="delivery-row-icon">
                                        👤
                                    </div>

                                    <div class="delivery-row-content">

                                        <strong>
                                            Name
                                        </strong>

                                        <span>
                                            <%= checkoutName %>
                                        </span>

                                    </div>

                                </div>


                                <!-- PHONE -->

                                <div class="delivery-row">

                                    <div class="delivery-row-icon">
                                        📞
                                    </div>

                                    <div class="delivery-row-content">

                                        <strong>
                                            Phone
                                        </strong>

                                        <span>
                                            <%= checkoutPhone %>
                                        </span>

                                    </div>

                                </div>


                                <!-- ADDRESS -->

                                <div class="delivery-row">

                                    <div class="delivery-row-icon">
                                        🏠
                                    </div>

                                    <div class="delivery-row-content">

                                        <strong>
                                            Delivery Address
                                        </strong>

                                        <span>
                                            <%= checkoutAddress %>
                                        </span>

                                    </div>

                                </div>


                                <!-- INSTRUCTIONS -->

                                <% if (checkoutInstructions != null
                                       && !checkoutInstructions.isEmpty()) { %>

                                    <div class="delivery-row">

                                        <div class="delivery-row-icon">
                                            📝
                                        </div>

                                        <div class="delivery-row-content">

                                            <strong>
                                                Instructions
                                            </strong>

                                            <span>
                                                <%= checkoutInstructions %>
                                            </span>

                                        </div>

                                    </div>

                                <% } %>


                            </div>

                        </section>

                    </div>


                    <!-- =========================================
                         RIGHT SIDE
                         ========================================= -->

                    <aside>


                        <section class="payment-card order-card">


                            <div class="card-header">

                                <div class="card-icon">
                                    🛒
                                </div>

                                <div>

                                    <h2>
                                        Your Order
                                    </h2>

                                    <p>
                                        Review your selected items.
                                    </p>

                                </div>

                            </div>


                            <!-- ORDER ITEMS -->

                            <div class="order-items">

                                <%
                                    for (CartItem item
                                            : cart.getItems().values()) {
                                %>


                                    <div class="order-item">


                                        <div class="order-item-left">


                                            <div class="order-item-image">

                                                <img
                                                    src="<%=item.getMenu().getImageUrl()%>"
                                                    alt="<%=item.getMenu().getItemName()%>">

                                            </div>


                                            <div class="order-item-details">

                                                <h3>
                                                    <%=item.getMenu().getItemName()%>
                                                </h3>

                                                <span>
                                                    Qty:
                                                    <%=item.getQuantity()%>
                                                </span>

                                            </div>

                                        </div>


                                        <div class="order-item-price">

                                            <strong>
                                                ₹<%=item.getSubtotal()%>
                                            </strong>

                                            <span>
                                                ₹<%=item.getMenu().getPrice()%>
                                                each
                                            </span>

                                        </div>


                                    </div>


                                <%
                                    }
                                %>

                            </div>


                            <!-- TOTAL -->

                            <div class="order-divider"></div>


                            <div class="total-row">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹<%=cart.getTotal()%>
                                </strong>

                            </div>


                            <!-- PAY -->

<button
    type="submit"
    class="pay-button">
    Confirm & Pay →
</button>


                            <div class="secure-note">

                                🔒 Secure payment

                            </div>


                        </section>

                    </aside>


                </div>

            </form>

        </div>

    </main>

</body>

</html>