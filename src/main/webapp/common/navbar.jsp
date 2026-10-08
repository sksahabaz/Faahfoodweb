<%@ page import="com.food.model.Cart" %>
<%@ page import="com.food.model.CartItem" %>
<%@ page import="com.food.model.User" %>

<%
    Cart navCart = (Cart) session.getAttribute("cart");

    int cartItemCount = 0;

    if (navCart != null && navCart.getItems() != null) {
        for (CartItem item : navCart.getItems().values()) {
            cartItemCount += item.getQuantity();
        }
    }

    // =========================================================
    // USER LOGIN STATUS
    // =========================================================

    User navUser = (User) session.getAttribute("user");

    boolean isLoggedIn = navUser != null;

    String userInitial = "";

    if (isLoggedIn
            && navUser.getName() != null
            && !navUser.getName().trim().isEmpty()) {

        userInitial = navUser.getName()
                .trim()
                .substring(0, 1)
                .toUpperCase();
    }
%>


<header class="faah-navbar" id="mainHeader">

    <div class="faah-nav-container">


        <!-- =====================================================
             LOGO
             ===================================================== -->

        <a href="<%= request.getContextPath() %>/restaurant"
           class="faah-brand">

            <div class="faah-brand-icon">

                <svg width="22"
                     height="22"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="2.2"
                     stroke-linecap="round"
                     stroke-linejoin="round">

                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>

                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>

                    <line x1="6"
                          y1="1"
                          x2="6"
                          y2="4"></line>

                    <line x1="10"
                          y1="1"
                          x2="10"
                          y2="4"></line>

                    <line x1="14"
                          y1="1"
                          x2="14"
                          y2="4"></line>

                </svg>

            </div>


            <div class="faah-brand-text">

                <span class="faah-brand-name">
                    FAah<span>!!</span> FOOD
                </span>

                <span class="faah-brand-sub">
                    DELIVERY
                </span>

            </div>

        </a>


        <!-- =====================================================
             LOCATION + SEARCH
             ===================================================== -->

        <div class="faah-nav-center">


            <!-- LOCATION -->

            <button type="button"
                    class="faah-location-picker">

                <span class="faah-loc-icon">

                    <svg width="17"
                         height="17"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         stroke-width="2.2">

                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"></path>

                        <circle cx="12"
                                cy="10"
                                r="3"></circle>

                    </svg>

                </span>


                <span class="faah-loc-text">
                    Bangalore
                </span>


                <span class="faah-loc-chevron">

                    <svg width="14"
                         height="14"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         stroke-width="2.2">

                        <polyline points="6 9 12 15 18 9"></polyline>

                    </svg>

                </span>

            </button>


            <!-- SEARCH -->

            <div class="faah-search-wrapper">

                <span class="faah-search-icon">

                    <svg width="18"
                         height="18"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         stroke-width="2.2">

                        <circle cx="11"
                                cy="11"
                                r="8"></circle>

                        <line x1="21"
                              y1="21"
                              x2="16.65"
                              y2="16.65"></line>

                    </svg>

                </span>


                <input type="search"
                       class="faah-search-input"
                       placeholder="Search for restaurants, cuisines or dishes...">

            </div>

        </div>


        <!-- =====================================================
             RIGHT NAVIGATION
             ===================================================== -->

        <nav class="faah-nav-right">

            <ul class="faah-nav-links">


                <!-- HOME -->

                <li>

                    <a href="<%= request.getContextPath() %>/restaurant"
                       class="faah-nav-link active">

                        Home

                    </a>

                </li>


                <!-- RESTAURANTS -->

                <li>

                    <a href="<%= request.getContextPath() %>/restaurant"
                       class="faah-nav-link">

                        Restaurants

                    </a>

                </li>


                <!-- ORDERS -->

                <li>

<a href="<%=request.getContextPath()%>/my-orders"
   style="text-decoration: none;">
    My Orders
</a>
                </li>

            </ul>


            <div class="faah-divider"></div>


            <!-- =================================================
                 CART
                 ================================================= -->

            <a href="<%= request.getContextPath() %>/cart"
               class="faah-icon-btn faah-cart-btn"
               title="Cart"
               aria-label="Shopping cart">


                <svg width="24"
                     height="24"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="2"
                     stroke-linecap="round"
                     stroke-linejoin="round">

                    <path d="M3 5h2l2.5 11h9L19 8H6"></path>

                    <path d="M9 5V3"></path>

                    <circle cx="9"
                            cy="20"
                            r="1.5"></circle>

                    <circle cx="17"
                            cy="20"
                            r="1.5"></circle>

                </svg>


                <!-- CART QUANTITY -->

                <span class="faah-cart-badge"
                      id="faahCartBadge"
                      <%= cartItemCount == 0
                          ? "style=\"display:none;\""
                          : "" %>>

                    <%= cartItemCount %>

                </span>

            </a>


            <!-- =================================================
                 PROFILE / LOGIN / LOGOUT
                 ================================================= -->

            <div class="faah-user-wrapper">


                <% if (isLoggedIn) { %>


                    <!-- ===============================
                         LOGGED-IN USER
                         =============================== -->

                    <a href="#"
                       class="faah-user-pill"
                       title="<%= navUser.getName() %>"
                       aria-label="My Account">

                        <div class="faah-user-avatar">

                            <%= userInitial %>

                        </div>

                    </a>


                    <!-- LOGOUT MENU -->

                    <div class="faah-user-menu">

                        <div class="faah-user-name">

                            <%= navUser.getName() %>

                        </div>


                        <a href="<%= request.getContextPath() %>/logout"
                           class="faah-user-action">

                            Logout

                        </a>

                    </div>


                <% } else { %>


                    <!-- ===============================
                         NOT LOGGED-IN USER
                         =============================== -->

                    <a href="#"
                       class="faah-user-pill"
                       title="Login"
                       aria-label="Login">

                        <div class="faah-user-avatar">


                            <!-- DEFAULT USER ICON -->

                            <svg width="18"
                                 height="18"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 stroke-width="2"
                                 stroke-linecap="round"
                                 stroke-linejoin="round">

                                <circle cx="12"
                                        cy="8"
                                        r="4"></circle>

                                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path>

                            </svg>


                        </div>

                    </a>


                    <!-- LOGIN MENU -->

                    <div class="faah-user-menu">

                        <a href="<%= request.getContextPath() %>/login"
                           class="faah-user-action">

                            Login

                        </a>

                    </div>


                <% } %>


            </div>


            <!-- =================================================
                 MOBILE MENU
                 ================================================= -->

            <button type="button"
                    class="faah-mobile-toggle"
                    id="mobileMenuBtn"
                    aria-label="Open navigation menu">


                <svg width="22"
                     height="22"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="2"
                     stroke-linecap="round"
                     stroke-linejoin="round">

                    <line x1="3"
                          y1="12"
                          x2="21"
                          y2="12"></line>

                    <line x1="3"
                          y1="6"
                          x2="21"
                          y2="6"></line>

                    <line x1="3"
                          y1="18"
                          x2="21"
                          y2="18"></line>

                </svg>

            </button>

        </nav>

    </div>

</header>


<!-- =========================================================
     PROFILE MENU STYLING
     ========================================================= -->

<style>

/* =========================================================
   CART ICON
   ========================================================= */

.faah-cart-btn {

    position: relative;

    display: inline-flex;

    align-items: center;

    justify-content: center;

}


.faah-cart-btn svg {

    transition: transform 0.2s ease;

}


.faah-cart-btn:hover svg {

    transform: scale(1.08);

}


/* =========================================================
   CART BADGE
   ========================================================= */

.faah-cart-badge {

    position: absolute;

    top: -5px;

    right: -6px;

    min-width: 18px;

    height: 18px;

    padding: 0 5px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50px;

    background: #2563eb;

    color: #ffffff;

    font-size: 10px;

    font-weight: 700;

    line-height: 1;

    border: 2px solid #ffffff;

    box-sizing: border-box;

    transition: transform 0.15s ease;

}


/* =========================================================
   USER PROFILE WRAPPER
   ========================================================= */

.faah-user-wrapper {

    position: relative;

    display: flex;

    align-items: center;

    justify-content: center;

}


/* =========================================================
   CIRCULAR PROFILE
   ========================================================= */

/*
   IMPORTANT:
   This keeps the existing circular profile design.
*/

.faah-user-avatar {

    width: 36px;

    height: 36px;

    border-radius: 50%;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 14px;

    font-weight: 700;

    cursor: pointer;

}


/* =========================================================
   USER DROPDOWN
   ========================================================= */

.faah-user-menu {

    position: absolute;

    top: calc(100% + 10px);

    right: 0;

    min-width: 150px;

    padding: 8px;

    background: #ffffff;

    border: 1px solid #e5e7eb;

    border-radius: 10px;

    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);

    opacity: 0;

    visibility: hidden;

    transform: translateY(-5px);

    transition:
        opacity 0.2s ease,
        visibility 0.2s ease,
        transform 0.2s ease;

    z-index: 1000;

}


/* =========================================================
   SHOW DROPDOWN ON HOVER
   ========================================================= */

.faah-user-wrapper:hover .faah-user-menu {

    opacity: 1;

    visibility: visible;

    transform: translateY(0);

}


/* =========================================================
   USER NAME
   ========================================================= */

.faah-user-name {

    padding: 8px 10px;

    font-size: 14px;

    font-weight: 600;

    color: #222222;

    border-bottom: 1px solid #eeeeee;

    margin-bottom: 4px;

}


/* =========================================================
   LOGIN / LOGOUT BUTTON
   ========================================================= */

.faah-user-action {

    display: block;

    padding: 9px 10px;

    border-radius: 7px;

    text-decoration: none;

    color: #333333;

    font-size: 14px;

    font-weight: 500;

    transition:
        background 0.2s ease,
        color 0.2s ease;

}


.faah-user-action:hover {

    background: #f1f5f9;

    color: #2563eb;

}

</style>


<!-- =========================================================
     CART BADGE UPDATE
     ========================================================= -->

<script>

window.addEventListener("cartUpdated", function(event) {

    const badge =
        document.getElementById("faahCartBadge");


    if (!badge) {

        return;

    }


    const quantity =
        event.detail.quantity || 0;


    if (quantity <= 0) {

        badge.textContent = "0";

        badge.style.display = "none";

    }

    else {

        badge.textContent = quantity;

        badge.style.display = "flex";


        badge.style.transform = "scale(1.2)";


        setTimeout(function() {

            badge.style.transform = "scale(1)";

        }, 150);

    }

});

</script>