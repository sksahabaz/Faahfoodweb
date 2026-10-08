<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ page import="com.food.model.Cart"%>
<%@ page import="com.food.model.CartItem"%>
<%@ page import="java.util.Map"%>

<%
    Cart cart = (Cart) request.getAttribute("cart");

    String errorMessage = (String) request.getAttribute("errorMessage");

    String customerName = (String) request.getAttribute("customerName");
    String phone = (String) request.getAttribute("phone");
    String address = (String) request.getAttribute("address");
    String instructions = (String) request.getAttribute("instructions");

    /*
     * If the page is opened normally through GET,
     * request attributes will be null.
     *
     * We can also recover previously saved checkout
     * information from the session.
     */
    if (customerName == null) {
        customerName = (String) session.getAttribute("checkoutName");
    }

    if (phone == null) {
        phone = (String) session.getAttribute("checkoutPhone");
    }

    if (address == null) {
        address = (String) session.getAttribute("checkoutAddress");
    }

    if (instructions == null) {
        instructions = (String) session.getAttribute("checkoutInstructions");
    }
%>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

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

    <title>Checkout - FAah!! FOOD</title>


    <style>

        /* =========================================================
           CHECKOUT PAGE
        ========================================================= */

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: #f4f8ff;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
        }

        a {
            text-decoration: none;
        }

        button,
        input,
        textarea {
            font-family: inherit;
        }


        /* =========================================================
           PAGE WRAPPER
        ========================================================= */

        .checkout-page {
            min-height: 100vh;
            padding: 95px 36px 60px;
        }

        .checkout-container {
            max-width: 1280px;
            margin: 0 auto;
        }


        /* =========================================================
           BREADCRUMB
        ========================================================= */

        .checkout-breadcrumb {
            display: flex;
            align-items: center;
            justify-content: space-between;

            margin-bottom: 24px;
            padding: 12px 2px;
        }

        .back-to-cart {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            color: #0050cb;

            font-size: 14px;
            font-weight: 600;

            transition: 0.2s ease;
        }

        .back-to-cart:hover {
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


        /* =========================================================
           PAGE HEADING
        ========================================================= */

        .checkout-heading {
            margin-bottom: 25px;
        }

        .checkout-heading h1 {
            margin: 0;

            font-size: 32px;
            font-weight: 800;

            letter-spacing: -0.6px;
        }

        .checkout-heading p {
            margin: 8px 0 0;

            color: #667085;
            font-size: 14px;
        }


        /* =========================================================
           ERROR MESSAGE
        ========================================================= */

        .checkout-error {
            display: flex;
            align-items: center;

            gap: 10px;

            margin-bottom: 20px;
            padding: 13px 16px;

            border: 1px solid #f5c2c7;
            border-radius: 12px;

            background: #fff5f5;

            color: #b42318;

            font-size: 13px;
            font-weight: 600;
        }

        .checkout-error-icon {
            width: 24px;
            height: 24px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 50%;

            background: #fee4e2;
            color: #b42318;

            font-size: 13px;
            font-weight: 800;
        }


        /* =========================================================
           MAIN CHECKOUT GRID
        ========================================================= */

        .checkout-layout {
            display: grid;

            grid-template-columns: minmax(0, 1fr) 390px;

            gap: 24px;

            align-items: start;
        }


        /* =========================================================
           COMMON CARD
        ========================================================= */

        .checkout-card {
            background: #ffffff;

            border: 1px solid #dce7f7;
            border-radius: 20px;

            padding: 25px;

            box-shadow: 0 8px 30px rgba(30, 70, 120, 0.06);

            margin-bottom: 20px;
        }

        .checkout-card:last-child {
            margin-bottom: 0;
        }


        /* =========================================================
           CARD HEADER
        ========================================================= */

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

            flex-shrink: 0;

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


        /* =========================================================
           FORM
        ========================================================= */

        .form-row {
            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 15px;

            margin-bottom: 16px;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-row .form-group {
            margin-bottom: 0;
        }

        .form-group label {
            display: block;

            margin-bottom: 7px;

            color: #344054;

            font-size: 12px;
            font-weight: 700;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;

            border: 1px solid #d7e1ef;

            border-radius: 11px;

            outline: none;

            background: #ffffff;

            color: #111827;

            font-size: 13px;

            transition: 0.2s ease;
        }

        .form-group input {
            height: 45px;

            padding: 0 13px;
        }

        .form-group textarea {
            min-height: 95px;

            padding: 12px 13px;

            resize: vertical;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            border-color: #0050cb;

            box-shadow: 0 0 0 3px rgba(0, 80, 203, 0.08);
        }

        .required {
            color: #e11d48;
        }


        /* =========================================================
           SPECIAL INSTRUCTIONS
        ========================================================= */

        .instructions-note {
            margin-top: -8px;
            margin-bottom: 15px;

            color: #667085;

            font-size: 12px;
        }


        /* =========================================================
           ORDER CARD
        ========================================================= */

        .order-card {
            position: sticky;
            top: 90px;
        }

        .restaurant-mini {
            display: flex;
            align-items: center;

            gap: 11px;

            padding: 12px;
            margin-bottom: 18px;

            border: 1px solid #cbdfff;
            border-radius: 13px;

            background: #eff6ff;
        }

        .restaurant-mini-icon {
            width: 40px;
            height: 40px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 10px;

            background: #ffffff;
            border: 1px solid #d8e6ff;

            color: #0050cb;
        }

        .restaurant-mini strong {
            display: block;

            font-size: 13px;
        }

        .restaurant-mini span {
            display: block;

            margin-top: 3px;

            color: #667085;

            font-size: 11px;
        }


        /* =========================================================
           ORDER ITEMS
        ========================================================= */

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
            width: 55px;
            height: 55px;

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


        /* =========================================================
           TOTAL
        ========================================================= */

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


        /* =========================================================
           CHECKOUT ACTION
        ========================================================= */

        .checkout-action {
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

            box-shadow: 0 8px 18px rgba(23, 105, 224, 0.22);

            transition: 0.2s ease;
        }

        .checkout-action:hover {
            background: #0050cb;

            transform: translateY(-1px);
        }


        /* =========================================================
           RESPONSIVE
        ========================================================= */

        @media (max-width: 1000px) {

            .checkout-layout {
                grid-template-columns: 1fr;
            }

            .order-card {
                position: static;
            }
        }


        @media (max-width: 700px) {

            .checkout-page {
                padding: 85px 15px 40px;
            }

            .checkout-heading h1 {
                font-size: 27px;
            }

            .checkout-breadcrumb {
                align-items: flex-start;

                flex-direction: column;

                gap: 8px;
            }

            .checkout-card {
                padding: 18px;

                border-radius: 17px;
            }

            .form-row {
                grid-template-columns: 1fr;

                gap: 0;
            }

            .form-row .form-group {
                margin-bottom: 16px;
            }
        }


        @media (max-width: 450px) {

            .checkout-heading h1 {
                font-size: 24px;
            }

            .card-header h2 {
                font-size: 16px;
            }

            .order-item {
                padding: 12px;
            }

            .order-item-image {
                width: 48px;
                height: 48px;
            }
        }

    </style>

</head>


<body>


    <!-- =========================================================
         NAVBAR
    ========================================================== -->

    <jsp:include page="/common/navbar.jsp" />


    <!-- =========================================================
         CHECKOUT PAGE
    ========================================================== -->

    <main class="checkout-page">

        <div class="checkout-container">


            <!-- =================================================
                 BREADCRUMB
            ================================================== -->

            <div class="checkout-breadcrumb">

                <a
                    href="<%=request.getContextPath()%>/cart"
                    class="back-to-cart">

                    ← Back to Cart

                </a>


                <div class="breadcrumb-right">

                    <span>Home</span>

                    &nbsp;/&nbsp;

                    <span>Cart</span>

                    &nbsp;/&nbsp;

                    <span>Checkout</span>

                </div>

            </div>


            <!-- =================================================
                 HEADING
            ================================================== -->

            <div class="checkout-heading">

                <h1>
                    Checkout
                </h1>

                <p>
                    Complete your details and review your order before placing it.
                </p>

            </div>


            <!-- =================================================
                 ERROR MESSAGE
            ================================================== -->

            <%
                if (errorMessage != null) {
            %>

                <div class="checkout-error">

                    <span class="checkout-error-icon">
                        ⚠
                    </span>

                    <span>
                        <%=errorMessage%>
                    </span>

                </div>

            <%
                }
            %>


            <!-- =================================================
                 CHECKOUT FORM
            ================================================== -->

            <form
                action="<%=request.getContextPath()%>/checkout"
                method="post">


                <!-- =================================================
                     MAIN CHECKOUT LAYOUT
                ================================================== -->

                <div class="checkout-layout">


                    <!-- =================================================
                         LEFT SIDE
                    ================================================== -->

                    <div>


                        <!-- =================================================
                             DELIVERY DETAILS
                        ================================================== -->

                        <section class="checkout-card">


                            <div class="card-header">

                                <div class="card-icon">
                                    📍
                                </div>

                                <div>

                                    <h2>
                                        Delivery Details
                                    </h2>

                                    <p>
                                        Where should we deliver your food?
                                    </p>

                                </div>

                            </div>


                            <!-- NAME + PHONE -->

                            <div class="form-row">


                                <div class="form-group">

                                    <label for="customerName">

                                        Full Name
                                        <span class="required">*</span>

                                    </label>

                                    <input
                                        type="text"
                                        id="customerName"
                                        name="customerName"
                                        value="<%=customerName != null ? customerName : ""%>"
                                        placeholder="Enter your full name">

                                </div>


                                <div class="form-group">

                                    <label for="phone">

                                        Phone Number
                                        <span class="required">*</span>

                                    </label>

                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value="<%=phone != null ? phone : ""%>"
                                        placeholder="Enter your phone number">

                                </div>

                            </div>


                            <!-- ADDRESS -->

                            <div class="form-group">

                                <label for="address">

                                    Delivery Address
                                    <span class="required">*</span>

                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter your complete delivery address"><%=address != null ? address : ""%></textarea>

                            </div>


                        </section>


                        <!-- =================================================
                             SPECIAL INSTRUCTIONS
                        ================================================== -->

                        <section class="checkout-card">


                            <div class="card-header">

                                <div class="card-icon">
                                    📝
                                </div>

                                <div>

                                    <h2>
                                        Special Instructions
                                    </h2>

                                    <p>
                                        Optional instructions for your order.
                                    </p>

                                </div>

                            </div>


                            <div class="instructions-note">

                                Example: Less spicy, no onions, ring the bell, etc.

                            </div>


                            <div class="form-group">

                                <textarea
                                    id="instructions"
                                    name="instructions"
                                    placeholder="Add any special instructions for the restaurant or delivery partner..."><%=instructions != null ? instructions : ""%></textarea>

                            </div>


                        </section>


                    </div>


                    <!-- =================================================
                         RIGHT SIDE — ORDER
                    ================================================== -->

                    <aside>


                        <section class="checkout-card order-card">


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


                            <!-- RESTAURANT -->

                            <div class="restaurant-mini">

                                <div class="restaurant-mini-icon">
                                    🍽
                                </div>

                                <div>

                                    <strong>
                                        Your Restaurant
                                    </strong>

                                    <span>
                                        Preparing your food with love
                                    </span>

                                </div>

                            </div>


                            <!-- =================================================
                                 ORDER ITEMS
                            ================================================== -->

                            <div class="order-items">

                                <%
                                    for (Map.Entry<Integer, CartItem> entry
                                            : cart.getItems().entrySet()) {

                                        CartItem item = entry.getValue();
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
                                                    Qty: <%=item.getQuantity()%>
                                                </span>

                                            </div>

                                        </div>


                                        <div class="order-item-price">

                                            <strong>
                                                ₹<%=item.getSubtotal()%>
                                            </strong>

                                            <span>
                                                ₹<%=item.getMenu().getPrice()%> each
                                            </span>

                                        </div>


                                    </div>


                                <%
                                    }
                                %>

                            </div>


                            <!-- =================================================
                                 TOTAL
                            ================================================== -->

                            <div class="order-divider"></div>


                            <div class="total-row">

                                <span>
                                    Cart Total
                                </span>

                                <strong>
                                    ₹<%=cart.getTotal()%>
                                </strong>

                            </div>


                            <!-- =================================================
                                 SUBMIT CHECKOUT
                            ================================================== -->

                            <button
                                type="submit"
                                class="checkout-action">

                                Continue to Payment →

                            </button>


                        </section>


                    </aside>


                </div>


            </form>


        </div>

    </main>


</body>

</html>