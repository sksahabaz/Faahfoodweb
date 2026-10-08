<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ page import="java.util.List"%>
<%@ page import="com.food.model.Menu"%>
<%@ page import="com.food.model.Cart"%>
<%@ page import="com.food.model.CartItem"%>

<%
    List<Menu> menuList =
            (List<Menu>) request.getAttribute("menuList");

    /*
     * Get the current cart from session.
     *
     * This is used only to display the current quantity
     * of an item when the menu page is loaded/refreshed.
     */
    Cart sessionCart =
            (Cart) session.getAttribute("cart");
%>


<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">


<!-- Google Font -->

<link rel="preconnect"
      href="https://fonts.googleapis.com">

<link rel="preconnect"
      href="https://fonts.gstatic.com"
      crossorigin>

<link
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    rel="stylesheet">


<!-- Main Project CSS -->

<link rel="stylesheet"
      href="<%=request.getContextPath()%>/css/style.css">


<title>Menu | Faah!! Food</title>



<!-- =====================================================
     MENU PAGE CSS
     ===================================================== -->

<style>

/* =====================================================
   MENU HERO
   ===================================================== */


/* =====================================================
   MENU SECTION
   ===================================================== */

.faah-menu-catalog {

    width: 100%;

    max-width: 1200px;

    margin: 0 auto;

    padding: 70px 24px 90px;

}


.faah-menu-section-header {

    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: 20px;

    margin-bottom: 35px;

}


.faah-menu-section-label {

    display: inline-block;

    color: #1124AD;

    font-size: 12px;

    font-weight: 800;

    letter-spacing: 0.08em;

    text-transform: uppercase;

    margin-bottom: 8px;

}


.faah-menu-section-title {

    margin: 0;

    color: #1E293B;

    font-size: 32px;

    font-weight: 800;

    letter-spacing: -0.02em;

}


.faah-menu-item-count {

    color: #64748B;

    font-size: 14px;

    font-weight: 600;

    white-space: nowrap;

}


/* =====================================================
   CARD GRID
   ===================================================== */

.faah-menu-card-grid {

    display: grid;

    grid-template-columns: repeat(3, minmax(0, 1fr));

    gap: 26px;

}


/* =====================================================
   FOOD CARD
   ===================================================== */

.faah-food-card {

    background: #FFFFFF;

    border: 1px solid #E8EBF2;

    border-radius: 18px;

    overflow: hidden;

    box-shadow: 0 8px 25px rgba(20, 30, 70, 0.06);

    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease,
        border-color 0.3s ease;

    display: flex;

    flex-direction: column;

}


.faah-food-card:hover {

    transform: translateY(-7px);

    border-color: rgba(17, 36, 173, 0.25);

    box-shadow: 0 18px 40px rgba(17, 36, 173, 0.13);

}


/* =====================================================
   CARD IMAGE
   ===================================================== */

.faah-food-card-image-wrapper {

    position: relative;

    width: 100%;

    height: 210px;

    overflow: hidden;

    background: #F1F3F7;

}


.faah-food-card-image {

    width: 100%;

    height: 100%;

    object-fit: cover;

    display: block;

    transition: transform 0.5s ease;

}


.faah-food-card:hover
.faah-food-card-image {

    transform: scale(1.06);

}


/* Category badge */

.faah-food-category {

    position: absolute;

    top: 14px;

    left: 14px;

    padding: 6px 11px;

    background: rgba(255, 255, 255, 0.94);

    color: #1124AD;

    border-radius: 20px;

    font-size: 11px;

    font-weight: 800;

    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

}


/* Availability badge */

.faah-food-availability {

    position: absolute;

    top: 14px;

    right: 14px;

    padding: 6px 10px;

    border-radius: 20px;

    background: #10B981;

    color: #FFFFFF;

    font-size: 10px;

    font-weight: 800;

    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

}


.faah-food-availability.unavailable {

    background: #6B7280;

}


/* =====================================================
   CARD CONTENT
   ===================================================== */

.faah-food-card-content {

    padding: 20px;

    display: flex;

    flex-direction: column;

    flex: 1;

}


.faah-food-card-title {

    margin: 0 0 8px;

    color: #1E293B;

    font-size: 19px;

    font-weight: 800;

    line-height: 1.35;

}


.faah-food-card-description {

    margin: 0 0 18px;

    color: #64748B;

    font-size: 13px;

    line-height: 1.55;

    display: -webkit-box;

    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;

    overflow: hidden;

    min-height: 40px;

}


/* =====================================================
   CARD BOTTOM
   ===================================================== */

.faah-food-card-bottom {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    margin-top: auto;

}


.faah-food-price {

    color: #1124AD;

    font-size: 20px;

    font-weight: 900;

}


/* =====================================================
   ADD BUTTON
   ===================================================== */

.faah-add-btn {

    min-width: 88px;

    height: 38px;

    padding: 0 16px;

    border:
        1px solid rgba(17, 36, 173, 0.18);

    border-radius: 9px;

    background: #FFFFFF;

    color: #1124AD;

    font-size: 12px;

    font-weight: 800;

    cursor: pointer;

    box-shadow:
        0 4px 12px rgba(15, 23, 42, 0.08);

    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;

}


.faah-add-btn:hover {

    background: #1124AD;

    color: #FFFFFF;

    transform: translateY(-2px);

    box-shadow:
        0 7px 18px rgba(17, 36, 173, 0.22);

}


/* =====================================================
   QUANTITY CONTROL
   ===================================================== */

.faah-quantity-control {

    display: none;

    align-items: center;

    height: 38px;

    border:
        1px solid #1124AD;

    border-radius: 9px;

    overflow: hidden;

    background: #FFFFFF;

}


.faah-quantity-control.active {

    display: flex;

}


.faah-quantity-btn {

    width: 34px;

    height: 100%;

    border: none;

    background: #FFFFFF;

    color: #1124AD;

    font-size: 18px;

    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease;

}


.faah-quantity-btn:hover {

    background: #EEF2FF;

}


.faah-quantity-value {

    min-width: 30px;

    text-align: center;

    color: #1124AD;

    font-size: 13px;

    font-weight: 800;

}


/* =====================================================
   DISABLED
   ===================================================== */

.faah-food-unavailable {

    opacity: 0.75;

}


.faah-food-unavailable .faah-add-btn {

    background: #F1F3F5;

    border-color: #E2E5E9;

    color: #8A929D;

    cursor: not-allowed;

    box-shadow: none;

}


.faah-food-unavailable .faah-add-btn:hover {

    background: #F1F3F5;

    color: #8A929D;

    transform: none;

    box-shadow: none;

}


/* =====================================================
   CART REQUEST MESSAGE
   ===================================================== */

.faah-cart-message {

    position: fixed;

    top: 90px;

    right: 25px;

    z-index: 9999;

    background: #1124AD;

    color: #FFFFFF;

    padding: 13px 18px;

    border-radius: 10px;

    font-size: 13px;

    font-weight: 700;

    box-shadow:
        0 10px 30px rgba(17, 36, 173, 0.25);

    opacity: 0;

    transform: translateY(-10px);

    pointer-events: none;

    transition:
        opacity 0.25s ease,
        transform 0.25s ease;

}


.faah-cart-message.show {

    opacity: 1;

    transform: translateY(0);

}


/* =====================================================
   EMPTY STATE
   ===================================================== */

.faah-menu-empty {

    padding: 70px 20px;

    text-align: center;

    background: #FFFFFF;

    border: 1px solid #E5E7EB;

    border-radius: 18px;

}


.faah-menu-empty-icon {

    font-size: 45px;

    margin-bottom: 12px;

}


.faah-menu-empty h3 {

    margin: 0 0 8px;

    color: #0E1B78;

    font-size: 22px;

}


.faah-menu-empty p {

    margin: 0;

    color: #64748B;

    font-size: 14px;

}


/* =====================================================
   TABLET
   ===================================================== */

@media (max-width: 992px) {

    .faah-menu-hero {

        padding:
            3rem
            1.25rem
            3.5rem;

    }


    .faah-menu-hero-container {

        flex-direction: column;

        text-align: center;

        gap: 2.75rem;

        min-height: auto;

    }


    .faah-menu-hero-content {

        align-items: center;

        max-width: 100%;

    }


    .faah-menu-hero-headline {

        font-size: 2.75rem;

    }


    .faah-menu-hero-desc {

        font-size: 1.05rem;

    }


    .faah-menu-hero-features {

        justify-content: center;

    }


    .faah-menu-hero-visual {

        width: 100%;

        max-width: 440px;

        min-height: 380px;

    }


    .faah-food-center {

        width: 270px;

        height: 270px;

    }


    .faah-visual-bg-disc-large {

        width: 340px;

        height: 340px;

    }


    .faah-visual-bg-disc-inner {

        width: 260px;

        height: 260px;

    }


    /* =================================================
       MENU CARD GRID
       Same structure as Restaurant Cards
       ================================================= */

    .faah-menu-card-grid {

        width: 100%;

        display: grid;

        grid-template-columns:
            repeat(3, minmax(0, 1fr));

        gap: 24px;

    }


    /* =================================================
       MENU CARD
       ================================================= */

    .faah-food-card {

        position: relative;

        display: flex;

        flex-direction: column;

        overflow: hidden;

        background: #ffffff;

        border: 1px solid #e5e7eb;

        border-radius: 18px;

        box-shadow:
            0 4px 16px rgba(17, 36, 173, 0.05);

        transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;

    }


    .faah-food-card:hover {

        transform: translateY(-6px);

        border-color:
            rgba(17, 36, 173, 0.25);

        box-shadow:
            0 18px 40px rgba(17, 36, 173, 0.13);

    }


    /* =================================================
       IMAGE
       ================================================= */

    .faah-food-card-image-wrapper {

        position: relative;

        width: 100%;

        height: 210px;

        overflow: hidden;

        background: #e8ecf7;

    }


    .faah-food-card-image {

        display: block;

        width: 100%;

        height: 100%;

        object-fit: cover;

        object-position: center;

        transition:
            transform 0.35s ease;

    }


    .faah-food-card:hover
    .faah-food-card-image {

        transform: scale(1.04);

    }


    /* =================================================
       CARD CONTENT
       ================================================= */

    .faah-food-card-content {

        display: flex;

        flex-direction: column;

        flex: 1;

        padding: 18px;

    }


    .faah-food-card-title {

        margin: 0 0 7px;

        color: #1e293b;

        font-size: 18px;

        font-weight: 800;

        line-height: 1.35;

    }


    .faah-food-card-description {

        margin: 0 0 18px;

        color: #64748b;

        font-size: 13px;

        line-height: 1.55;

        display: -webkit-box;

        -webkit-line-clamp: 2;

        -webkit-box-orient: vertical;

        overflow: hidden;

        min-height: 40px;

    }


    /* =================================================
       PRICE + ADD
       ================================================= */

    .faah-food-card-bottom {

        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 12px;

        margin-top: auto;

    }


    .faah-food-price {

        color: #1124ad;

        font-size: 18px;

        font-weight: 800;

    }

}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 600px) {

    .faah-menu-hero {

        padding:
            2.25rem
            1rem
            3rem;

    }


    .faah-menu-hero-headline {

        font-size: 2.25rem;

    }


    .faah-menu-hero-desc {

        font-size: 0.95rem;

    }


    .faah-menu-hero-features {

        gap:
            0.875rem
            1.25rem;

    }


    .faah-menu-hero-cta {

        width: 100%;

        max-width: 320px;

    }


    .faah-menu-hero-visual {

        min-height: 320px;

        max-width: 340px;

    }


    .faah-food-center {

        width: 210px;

        height: 210px;

    }


    .faah-visual-bg-disc-large {

        width: 270px;

        height: 270px;

    }


    .faah-visual-bg-disc-inner {

        width: 200px;

        height: 200px;

    }


    .faah-satellite-burger {

        width: 80px;

        height: 80px;

        top: -5px;

        left: 5px;

    }


    .faah-satellite-pizza {

        width: 76px;

        height: 76px;

        top: 0;

        right: 5px;

    }


    .faah-satellite-fries {

        width: 70px;

        height: 70px;

        bottom: 5px;

        right: 15px;

    }


    .faah-floating-tag {

        bottom: 10px;

        left: 5px;

        font-size: 0.75rem;

    }


    .faah-menu-catalog {

        padding:
            35px
            16px
            70px;

    }


    .faah-menu-section-header {

        align-items: flex-start;

        flex-direction: column;

        gap: 6px;

        margin-bottom: 25px;

    }


    .faah-menu-section-title {

        font-size: 27px;

    }


    .faah-menu-card-grid {

        grid-template-columns: 1fr;

        gap: 20px;

    }


    .faah-food-card-image-wrapper {

        height: 220px;

    }


    .faah-cart-message {

        left: 16px;

        right: 16px;

        top: 80px;

        text-align: center;

    }

}


/* Reduced motion */

@media (prefers-reduced-motion: reduce) {

    .faah-food-center,
    .faah-satellite-burger,
    .faah-satellite-pizza,
    .faah-satellite-fries,
    .faah-floating-tag {

        animation: none !important;

    }

}

</style>

</head>



<body>



<!-- =====================================================
     NAVBAR
     LOCKED
     ===================================================== -->

<%@ include file="common/navbar.jsp"%>



<!-- =====================================================
     MENU HERO
     ===================================================== -->



<!-- =====================================================
     MENU CATALOG
     ===================================================== -->

<section class="faah-menu-catalog"
         id="menu-catalog">


    <div class="faah-menu-section-header">


        <div>

            <span class="faah-menu-section-label">
                OUR MENU
            </span>

            <h2 class="faah-menu-section-title">
                Choose Your Favourite
            </h2>

        </div>


        <%

        if (menuList != null) {

        %>

            <span class="faah-menu-item-count">

                <%=menuList.size()%>

                items

            </span>

        <%

        }

        %>

    </div>



    <%

    if (menuList != null && !menuList.isEmpty()) {

    %>



        <!-- =================================================
             FOOD CARD GRID
             ================================================= -->

        <div class="faah-menu-card-grid">


        <%

        for (Menu menu : menuList) {

            /*
             * Determine whether this menu item already
             * exists in the session cart.
             */

            int currentQuantity = 0;

            if (sessionCart != null &&
                sessionCart.getItems() != null) {

                CartItem existingItem =
                    sessionCart.getItems()
                               .get(menu.getMenuId());

                if (existingItem != null) {

                    currentQuantity =
                        existingItem.getQuantity();

                }

            }

        %>



            <article
                class="faah-food-card
                <%=!menu.isAvailable()
                    ? "faah-food-unavailable"
                    : ""%>">


                <!-- IMAGE -->

                <div class="faah-food-card-image-wrapper">


                    <img
                        class="faah-food-card-image"
                        src="<%=menu.getImageUrl()%>"
                        alt="<%=menu.getItemName()%>"
                        loading="lazy">


                    <!-- CATEGORY -->

                    <%

                    if (menu.getCategory() != null &&
                        !menu.getCategory().trim().isEmpty()) {

                    %>

                        <span class="faah-food-category">

                            <%=menu.getCategory()%>

                        </span>

                    <%

                    }

                    %>



                    <!-- AVAILABILITY -->

                    <%

                    if (menu.isAvailable()) {

                    %>

                        <span class="faah-food-availability">

                            Available

                        </span>

                    <%

                    } else {

                    %>

                        <span
                            class="faah-food-availability unavailable">

                            Unavailable

                        </span>

                    <%

                    }

                    %>


                </div>



                <!-- CARD CONTENT -->

                <div class="faah-food-card-content">


                    <!-- NAME -->

                    <h3 class="faah-food-card-title">

                        <%=menu.getItemName()%>

                    </h3>



                    <!-- DESCRIPTION -->

                    <p class="faah-food-card-description">

                        <%=menu.getDescription()%>

                    </p>



                    <!-- PRICE + ACTION -->

                    <div class="faah-food-card-bottom">


                        <span class="faah-food-price">

                            &#8377;<%=menu.getPrice()%>

                        </span>



                        <%

                        if (menu.isAvailable()) {

                        %>


                            <!-- =================================================
                                 ADD / QUANTITY CONTROL
                                 ================================================= -->

                            <div class="faah-menu-action">


                                <!-- ADD BUTTON -->

                                <button
                                    type="button"
                                    class="faah-add-btn"
                                    style="<%=currentQuantity > 0
                                            ? "display:none;"
                                            : ""%>"
                                    onclick="addItem(
                                        this,
                                        <%=menu.getMenuId()%>
                                    )">

                                    + ADD

                                </button>



                                <!-- QUANTITY -->

                                <div
                                    class="faah-quantity-control
                                    <%=currentQuantity > 0
                                        ? "active"
                                        : ""%>">


                                    <!-- MINUS -->

                                    <button
                                        type="button"
                                        class="faah-quantity-btn"
                                        onclick="decreaseItem(
                                            this,
                                            <%=menu.getMenuId()%>
                                        )">

                                        &minus;

                                    </button>



                                    <!-- CURRENT QUANTITY -->

                                    <span
                                        class="faah-quantity-value">

                                        <%=currentQuantity > 0
                                            ? currentQuantity
                                            : 1%>

                                    </span>



                                    <!-- PLUS -->

                                    <button
                                        type="button"
                                        class="faah-quantity-btn"
                                        onclick="increaseItem(
                                            this,
                                            <%=menu.getMenuId()%>
                                        )">

                                        +

                                    </button>


                                </div>


                            </div>


                        <%

                        } else {

                        %>


                            <button
                                type="button"
                                class="faah-add-btn"
                                disabled>

                                UNAVAILABLE

                            </button>


                        <%

                        }

                        %>


                    </div>


                </div>


            </article>



        <%

        }

        %>


        </div>



    <%

    } else {

    %>



        <!-- =================================================
             EMPTY STATE
             ================================================= -->

        <div class="faah-menu-empty">


            <div class="faah-menu-empty-icon">

                🍽️

            </div>


            <h3>

                No menu items found

            </h3>


            <p>

                This restaurant currently has no available
                menu items.

            </p>


        </div>



    <%

    }

    %>



</section>



<!-- =====================================================
     FOOTER
     ===================================================== -->

<%@ include file="common/footer.jsp"%>



<!-- =====================================================
     QUANTITY JAVASCRIPT
     ===================================================== -->

<script>


/*
 * =====================================================
 * SHOW MESSAGE
 * =====================================================
 */

function showCartMessage(message) {

    let messageBox =
        document.getElementById("faahCartMessage");


    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "faahCartMessage";

        messageBox.className =
            "faah-cart-message";

        document.body.appendChild(messageBox);

    }


    messageBox.textContent = message;

    messageBox.classList.add("show");


    setTimeout(function() {

        messageBox.classList.remove("show");

    }, 1800);

}



/*
 * =====================================================
 * SEND CART REQUEST
 *
 * IMPORTANT:
 *
 * We use fetch() instead of normal form submission.
 *
 * Therefore:
 *
 *     POST /cart
 *
 * happens in the background and the browser
 * remains on menu.jsp.
 *
 * =====================================================
 */

function sendCartRequest(action, menuId, quantity) {


    const formData =
        new URLSearchParams();


    formData.append(
        "action",
        action
    );


    formData.append(
        "menuId",
        menuId
    );


    if (quantity !== undefined) {

        formData.append(
            "quantity",
            quantity
        );

    }


    return fetch(
        "<%=request.getContextPath()%>/cart",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body: formData.toString()
        }
    );

}



/*
 * =====================================================
 * ADD ITEM
 * =====================================================
 */

function addItem(button, menuId) {


    const cardBottom =
        button.parentElement.parentElement;


    const quantityControl =
        cardBottom.querySelector(
            ".faah-quantity-control"
        );


    const quantityValue =
        quantityControl.querySelector(
            ".faah-quantity-value"
        );


    /*
     * First update backend.
     */

    sendCartRequest(
        "add",
        menuId
    )
    .then(function(response) {


        /*
         * If the request was successful,
         * update the UI.
         */

        if (response.ok) {

            button.style.display =
                "none";


            quantityValue.textContent =
                "1";


            quantityControl.classList.add(
                "active"
            );


            showCartMessage(
                "Item added to cart"
            );

        }

    })
    .catch(function(error) {

        console.error(
            "Add to cart error:",
            error
        );

        showCartMessage(
            "Unable to add item"
        );

    });

}



/*
 * =====================================================
 * INCREASE QUANTITY
 * =====================================================
 */

function increaseItem(button, menuId) {


    const quantityControl =
        button.parentElement;


    const quantityValue =
        quantityControl.querySelector(
            ".faah-quantity-value"
        );


    let quantity =
        parseInt(
            quantityValue.textContent
        );


    quantity++;


    /*
     * Update UI immediately.
     */

    quantityValue.textContent =
        quantity;


    /*
     * Update backend.
     */

    sendCartRequest(
        "update",
        menuId,
        quantity
    )
    .then(function(response) {

        if (!response.ok) {

            console.error(
                "Quantity update failed"
            );

        }

    })
    .catch(function(error) {

        console.error(
            "Quantity update error:",
            error
        );

    });

}



/*
 * =====================================================
 * DECREASE QUANTITY
 * =====================================================
 */

function decreaseItem(button, menuId) {


    const quantityControl =
        button.parentElement;


    const quantityValue =
        quantityControl.querySelector(
            ".faah-quantity-value"
        );


    const cardBottom =
        quantityControl.parentElement;


    const addButton =
        cardBottom.querySelector(
            ".faah-add-btn"
        );


    let quantity =
        parseInt(
            quantityValue.textContent
        );


    quantity--;



    /*
     * If quantity becomes ZERO,
     * remove item from cart.
     */

    if (quantity <= 0) {


        sendCartRequest(
            "remove",
            menuId
        )
        .then(function(response) {


            if (response.ok) {


                quantityValue.textContent =
                    "1";


                quantityControl.classList.remove(
                    "active"
                );


                addButton.style.display =
                    "inline-flex";


                showCartMessage(
                    "Item removed from cart"
                );

            }

        })
        .catch(function(error) {

            console.error(
                "Remove item error:",
                error
            );

        });


        return;

    }



    /*
     * Normal quantity decrease.
     */

    quantityValue.textContent =
        quantity;


    sendCartRequest(
        "update",
        menuId,
        quantity
    )
    .then(function(response) {

        if (!response.ok) {

            console.error(
                "Quantity update failed"
            );

        }

    })
    .catch(function(error) {

        console.error(
            "Quantity update error:",
            error
        );

    });

}


</script>



</body>

</html>