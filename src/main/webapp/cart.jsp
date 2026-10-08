<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ page import="com.food.model.Cart"%>
<%@ page import="com.food.model.CartItem"%>
<%@ page import="java.util.Map"%>

<%
    Cart cart = (Cart) request.getAttribute("cart");

    String cartError = (String) session.getAttribute("cartError");

    if (cartError != null) {
        session.removeAttribute("cartError");
    }
%>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">

    <link rel="stylesheet"
          href="<%=request.getContextPath()%>/css/style.css">

    <title>Your Cart - FAah!! FOOD</title>

    <style>

        /* =========================================================
           CART PAGE
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

        button {
            font-family: inherit;
        }


        /* =========================================================
           CART ERROR MESSAGE
        ========================================================= */

        .cart-error-message {
            max-width: 1280px;
            margin: 20px auto;
            padding: 14px 18px;

            display: flex;
            align-items: center;
            gap: 10px;

            background: #fff5f5;
            border: 1px solid #f5c2c7;
            border-radius: 12px;

            color: #b42318;
            font-size: 13px;
            font-weight: 600;

            box-shadow: 0 4px 15px rgba(180, 35, 24, 0.06);
        }

        .cart-error-icon {
            width: 24px;
            height: 24px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 50%;
            background: #fee4e2;
            color: #b42318;

            font-size: 14px;
            font-weight: 800;
        }


        /* =========================================================
           PAGE WRAPPER
        ========================================================= */

        .cart-page {
            min-height: 100vh;
            padding: 95px 36px 60px;
        }

        .cart-container {
            max-width: 1280px;
            margin: 0 auto;
        }


        /* =========================================================
           BREADCRUMB
        ========================================================= */

        .cart-breadcrumb {
            display: flex;
            align-items: center;
            justify-content: space-between;

            margin-bottom: 24px;
            padding: 12px 2px;
        }

        .continue-shopping {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            color: #0050cb;

            font-size: 14px;
            font-weight: 600;

            transition: 0.2s ease;
        }

        .continue-shopping:hover {
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
           MAIN CART LAYOUT
        ========================================================= */

        .cart-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 24px;
            align-items: start;
        }


        /* =========================================================
           MAIN CART CARD
        ========================================================= */

        .cart-main-card {
            background: #ffffff;

            border: 1px solid #dce7f7;
            border-radius: 22px;

            padding: 28px;

            box-shadow: 0 8px 30px rgba(30, 70, 120, 0.06);
        }


        /* =========================================================
           CART HEADING
        ========================================================= */

        .cart-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            gap: 20px;
            margin-bottom: 24px;
        }

        .cart-heading h1 {
            margin: 0;

            font-size: 30px;
            font-weight: 800;

            letter-spacing: -0.5px;
        }

        .cart-heading p {
            margin: 7px 0 0;

            color: #667085;
            font-size: 14px;
        }

        .cart-count {
            display: inline-flex;
            align-items: center;

            margin-left: 8px;
            padding: 4px 9px;

            border-radius: 999px;

            background: #e6efff;
            color: #0050cb;

            font-size: 11px;
            font-weight: 700;

            vertical-align: middle;
        }


        /* =========================================================
           CLEAR CART
        ========================================================= */

        .clear-cart-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            border: 0;
            background: transparent;

            color: #e11d48;

            font-size: 13px;
            font-weight: 700;

            cursor: pointer;

            padding: 8px;
            border-radius: 8px;

            transition: 0.2s ease;
        }

        .clear-cart-btn:hover {
            background: #fff1f2;
        }


        /* =========================================================
           RESTAURANT HEADER
        ========================================================= */

        .restaurant-box {
            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 15px;

            padding: 15px;
            margin-bottom: 18px;

            border: 1px solid #cbdfff;
            border-radius: 16px;

            background: #eff6ff;
        }

        .restaurant-info {
            display: flex;
            align-items: center;

            gap: 13px;
            min-width: 0;
        }

        .restaurant-icon {
            width: 52px;
            height: 52px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 13px;

            background: #ffffff;
            border: 1px solid #d8e6ff;

            color: #0050cb;
        }

        .restaurant-info h2 {
            margin: 0;

            font-size: 16px;
            font-weight: 750;
        }

        .restaurant-info p {
            margin: 5px 0 0;

            color: #667085;
            font-size: 12px;
        }

        .love-badge {
            flex-shrink: 0;

            padding: 8px 13px;

            border-radius: 999px;

            background: #ffffff;
            border: 1px solid #cbdfff;

            color: #0050cb;

            font-size: 12px;
            font-weight: 700;
        }


        /* =========================================================
           CART ITEMS
        ========================================================= */

        .cart-items {
            border: 1px solid #e3eaf5;
            border-radius: 17px;

            overflow: hidden;

            background: #ffffff;
        }

        .cart-item {
            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 20px;

            padding: 20px;

            border-bottom: 1px solid #edf1f7;

            transition: background 0.2s ease;
        }

        .cart-item:last-child {
            border-bottom: none;
        }

        .cart-item:hover {
            background: #f9fbff;
        }


        /* =========================================================
           ITEM LEFT
        ========================================================= */

        .item-left {
            display: flex;
            align-items: center;

            gap: 16px;

            min-width: 0;
            flex: 1;
        }

        .item-image {
            width: 92px;
            height: 92px;

            flex-shrink: 0;

            overflow: hidden;

            border-radius: 14px;

            background: #eef3fa;
            border: 1px solid #e0e8f4;
        }

        .item-image img {
            width: 100%;
            height: 100%;

            display: block;

            object-fit: cover;

            transition: transform 0.35s ease;
        }

        .cart-item:hover .item-image img {
            transform: scale(1.05);
        }

        .item-details {
            min-width: 0;
        }

        .item-details h3 {
            margin: 0 0 6px;

            font-size: 17px;
            font-weight: 750;
        }

        .item-description {
            margin: 0;

            max-width: 500px;

            color: #667085;

            font-size: 13px;
            line-height: 1.5;

            display: -webkit-box;

            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;

            overflow: hidden;
        }

        .item-price {
            margin-top: 9px;

            color: #111827;

            font-size: 16px;
            font-weight: 800;
        }


        /* =========================================================
           ITEM RIGHT SIDE
        ========================================================= */

        .item-actions {
            display: flex;
            align-items: center;

            gap: 18px;

            flex-shrink: 0;
        }

        .item-subtotal {
            min-width: 75px;

            text-align: right;

            font-size: 17px;
            font-weight: 800;
        }


        /* =========================================================
           QUANTITY
        ========================================================= */

        .quantity-form {
            display: flex;
            align-items: center;

            gap: 0;

            padding: 4px;

            border-radius: 11px;

            background: #eef4ff;
            border: 1px solid #d5e3fb;
        }

        .quantity-btn {
            width: 31px;
            height: 31px;

            border: 0;
            border-radius: 8px;

            background: #ffffff;
            color: #0050cb;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 18px;
            font-weight: 700;

            cursor: pointer;

            transition: 0.18s ease;
        }

        .quantity-btn:hover {
            background: #dceaff;
        }

        .quantity-number {
            width: 35px;

            text-align: center;

            color: #111827;

            font-size: 14px;
            font-weight: 750;
        }


        /* =========================================================
           REMOVE
        ========================================================= */

        .remove-form {
            margin: 0;
        }

        .remove-btn {
            width: 36px;
            height: 36px;

            border: 0;
            border-radius: 9px;

            background: transparent;
            color: #98a2b3;

            cursor: pointer;

            font-size: 18px;

            transition: 0.2s ease;
        }

        .remove-btn:hover {
            color: #e11d48;
            background: #fff1f2;
        }


        /* =========================================================
           CART BOTTOM
           TOTAL + CHECKOUT
        ========================================================= */

        .cart-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 20px;

            margin-top: 22px;
            padding: 20px;

            border: 1px solid #dce7f7;
            border-radius: 16px;

            background: #f8fbff;
        }

        .cart-total {
            display: flex;
            align-items: center;

            gap: 12px;

            font-size: 15px;
            font-weight: 700;
        }

        .cart-total strong {
            color: #0050cb;

            font-size: 22px;
            font-weight: 800;
        }

        .checkout-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            padding: 13px 22px;

            border-radius: 12px;

            background: #1769e0;
            color: #ffffff;

            font-size: 14px;
            font-weight: 750;

            transition: 0.2s ease;

            white-space: nowrap;
        }

        .checkout-btn:hover {
            background: #0050cb;
            transform: translateY(-1px);
        }


        /* =========================================================
           EMPTY CART
        ========================================================= */

        .empty-cart {
            padding: 65px 25px;

            text-align: center;
        }

        .empty-icon {
            width: 70px;
            height: 70px;

            margin: 0 auto 18px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 20px;

            background: #eaf2ff;
            color: #0050cb;

            font-size: 30px;
        }

        .empty-cart h2 {
            margin: 0;

            font-size: 22px;
        }

        .empty-cart p {
            margin: 8px auto 20px;

            max-width: 400px;

            color: #667085;

            font-size: 13px;
        }

        .browse-btn {
            display: inline-flex;

            padding: 11px 20px;

            border-radius: 11px;

            background: #1769e0;
            color: #ffffff;

            font-size: 13px;
            font-weight: 700;
        }

        .browse-btn:hover {
            background: #0050cb;
        }


        /* =========================================================
           RESPONSIVE
        ========================================================= */

        @media (max-width: 700px) {

            .cart-page {
                padding: 85px 15px 40px;
            }

            .cart-error-message {
                margin: 15px;
            }

            .cart-main-card {
                padding: 18px;
                border-radius: 17px;
            }

            .cart-heading h1 {
                font-size: 25px;
            }

            .cart-heading {
                flex-direction: column;
            }

            .restaurant-box {
                align-items: flex-start;
                flex-direction: column;
            }

            .cart-item {
                align-items: flex-start;
                flex-direction: column;

                padding: 16px;
            }

            .item-left {
                width: 100%;
            }

            .item-actions {
                width: 100%;

                justify-content: space-between;
            }

            .item-subtotal {
                display: none;
            }

            .item-image {
                width: 78px;
                height: 78px;
            }

            .cart-breadcrumb {
                align-items: flex-start;
                flex-direction: column;

                gap: 8px;
            }

            .cart-bottom {
                align-items: stretch;
                flex-direction: column;

                gap: 15px;
            }

            .cart-total {
                justify-content: space-between;
            }

            .checkout-btn {
                width: 100%;
            }
        }


        @media (max-width: 450px) {

            .item-left {
                align-items: flex-start;
            }

            .item-details h3 {
                font-size: 15px;
            }

            .item-description {
                font-size: 12px;
            }

            .cart-bottom {
                padding: 16px;
            }

            .cart-total strong {
                font-size: 20px;
            }
        }

    </style>

</head>


<body>


    <!-- =========================================================
         EXISTING COMMON NAVBAR
    ========================================================== -->

    <jsp:include page="/common/navbar.jsp" />


    <!-- =========================================================
         CART ERROR MESSAGE
    ========================================================== -->

    <%
        if (cartError != null) {
    %>

        <div class="cart-error-message">

            <span class="cart-error-icon">
                ⚠
            </span>

            <span>
                <%=cartError%>
            </span>

        </div>

    <%
        }
    %>


    <!-- =========================================================
         CART PAGE
    ========================================================== -->

    <main class="cart-page">

        <div class="cart-container">


            <!-- =================================================
                 BREADCRUMB
            ================================================== -->

            <div class="cart-breadcrumb">

                <a
                    href="<%=request.getContextPath()%>/restaurant"
                    class="continue-shopping">

                    ← Explore More items

                </a>


                <div class="breadcrumb-right">

                    <span>Home</span>

                    &nbsp;/&nbsp;

                    <span>Cart</span>

                </div>

            </div>


            <%
                if (cart == null || cart.getItems().isEmpty()) {
            %>


                <!-- =================================================
                     EMPTY CART
                ================================================== -->

                <div class="cart-main-card">

                    <div class="empty-cart">

                        <div class="empty-icon">
                            🛒
                        </div>

                        <h2>
                            Your Cart is Empty
                        </h2>

                        <p>
                            Looks like you haven't added anything yet.
                            Explore delicious food and add your favourites.
                        </p>

                        <a
                            href="<%=request.getContextPath()%>/restaurant"
                            class="browse-btn">

                            Browse Restaurants

                        </a>

                    </div>

                </div>


            <%
                } else {
            %>


                <!-- =================================================
                     CART LAYOUT
                ================================================== -->

                <div class="cart-layout">


                    <!-- =================================================
                         MAIN CART
                    ================================================== -->

                    <section class="cart-main-card">


                        <!-- CART HEADING -->

                        <div class="cart-heading">

                            <div>

                                <h1>

                                    Your Cart

                                    <span class="cart-count">

                                        <%=cart.getItems().size()%>

                                        item<%=cart.getItems().size() == 1 ? "" : "s"%>

                                    </span>

                                </h1>

                                <p>
                                    Delicious food is just a few steps away!
                                </p>

                            </div>


                            <!-- CLEAR CART -->

                            <form
                                action="<%=request.getContextPath()%>/cart"
                                method="post">

                                <input
                                    type="hidden"
                                    name="action"
                                    value="clear">

                                <button
                                    type="submit"
                                    class="clear-cart-btn">

                                    🗑 Clear Cart

                                </button>

                            </form>

                        </div>


                        <!-- =================================================
                             RESTAURANT INFORMATION
                        ================================================== -->

                        <div class="restaurant-box">

                            <div class="restaurant-info">

                                <div class="restaurant-icon">
                                    🍽
                                </div>

                                <div>

                                    <h2>
                                        Your Restaurant
                                    </h2>

                                    <p>
                                        All items in your cart are from the
                                        selected restaurant.
                                    </p>

                                </div>

                            </div>


                            <div class="love-badge">
                                ♡ Preparing with love
                            </div>

                        </div>


                        <!-- =================================================
                             CART ITEMS
                        ================================================== -->

                        <div class="cart-items">

                            <%
                                for (Map.Entry<Integer, CartItem> entry
                                        : cart.getItems().entrySet()) {

                                    CartItem item = entry.getValue();
                            %>


                                <article class="cart-item">


                                    <!-- ITEM INFORMATION -->

                                    <div class="item-left">


                                        <!-- DYNAMIC IMAGE -->

                                        <div class="item-image">

                                            <img
                                                src="<%=item.getMenu().getImageUrl()%>"
                                                alt="<%=item.getMenu().getItemName()%>">

                                        </div>


                                        <!-- DETAILS -->

                                        <div class="item-details">

                                            <h3>
                                                <%=item.getMenu().getItemName()%>
                                            </h3>

                                            <p class="item-description">
                                                <%=item.getMenu().getDescription()%>
                                            </p>

                                            <div class="item-price">

                                                ₹<%=item.getMenu().getPrice()%>

                                            </div>

                                        </div>

                                    </div>


                                    <!-- =================================================
                                         ACTIONS
                                    ================================================== -->

                                    <div class="item-actions">


                                        <!-- SUBTOTAL -->

                                        <div class="item-subtotal">

                                            ₹<%=item.getSubtotal()%>

                                        </div>


                                        <!-- QUANTITY -->

                                        <form
                                            action="<%=request.getContextPath()%>/cart"
                                            method="post"
                                            class="quantity-form">

                                            <input
                                                type="hidden"
                                                name="action"
                                                value="update">

                                            <input
                                                type="hidden"
                                                name="menuId"
                                                value="<%=item.getMenu().getMenuId()%>">


                                            <!-- MINUS -->

                                            <button
                                                type="submit"
                                                name="quantity"
                                                value="<%=item.getQuantity() - 1%>"
                                                class="quantity-btn"
                                                title="Decrease quantity">

                                                −

                                            </button>


                                            <!-- CURRENT QUANTITY -->

                                            <span class="quantity-number">

                                                <%=item.getQuantity()%>

                                            </span>


                                            <!-- PLUS -->

                                            <button
                                                type="submit"
                                                name="quantity"
                                                value="<%=item.getQuantity() + 1%>"
                                                class="quantity-btn"
                                                title="Increase quantity">

                                                +

                                            </button>

                                        </form>


                                        <!-- REMOVE -->

                                        <form
                                            action="<%=request.getContextPath()%>/cart"
                                            method="post"
                                            class="remove-form">

                                            <input
                                                type="hidden"
                                                name="action"
                                                value="remove">

                                            <input
                                                type="hidden"
                                                name="menuId"
                                                value="<%=item.getMenu().getMenuId()%>">

                                            <button
                                                type="submit"
                                                class="remove-btn"
                                                title="Remove item">

                                                ×

                                            </button>

                                        </form>

                                    </div>

                                </article>


                            <%
                                }
                            %>

                        </div>


                        <!-- =================================================
                             CART TOTAL + CHECKOUT
                        ================================================== -->

                        <div class="cart-bottom">

                            <div class="cart-total">

                                <span>
                                    Cart Total
                                </span>

                                <strong>
                                    ₹<%=cart.getTotal()%>
                                </strong>

                            </div>


                            <!--
                                This only navigates to checkout.
                                Checkout logic will be implemented separately.
                            -->

                            <a
                                href="<%=request.getContextPath()%>/checkout"
                                class="checkout-btn">

                                Proceed to Checkout →

                            </a>

                        </div>


                    </section>


                </div>


            <%
                }
            %>


        </div>

    </main>


</body>

</html>