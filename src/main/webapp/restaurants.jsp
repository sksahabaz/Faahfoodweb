<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ page import="java.util.List" %>
<%@ page import="com.food.model.Restaurant" %>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Restaurants | Faah!! Food</title>


    <!-- Google Font -->

    <link rel="preconnect"
          href="https://fonts.googleapis.com">

    <link rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">


    <!-- Main CSS -->

    <link
        rel="stylesheet"
        href="<%= request.getContextPath() %>/css/style.css">


</head>


<body>


    <!-- =====================================================
         COMMON NAVBAR
    ====================================================== -->

    <%@ include file="common/navbar.jsp" %>


    <!-- =====================================================
         HERO SECTION
         LOCKED — DO NOT CHANGE
    ====================================================== -->

    <section
        class="faah-hero-section"
        aria-label="Welcome to FAah!! FOOD">

        <div class="hero-container">


            <!-- LEFT CONTENT -->

            <div class="hero-content">

                <div class="hero-eyebrow">

                    <span class="spark-icon">
                        ⚡
                    </span>

                    <span>
                        GOOD FOOD. BETTER MOOD.
                    </span>

                </div>


                <h1 class="hero-headline">

                    FIND YOUR FOOD

                    <span class="highlight-word">
                        FAAH!!
                    </span>

                </h1>


                <p class="hero-description">

                    Discover amazing food from the best restaurants
                    in your city. Fresh, fast and always faah!!

                </p>


                <div class="hero-action-group">

                    <a
                        href="<%= request.getContextPath() %>/restaurant"
                        class="hero-primary-btn">

                        <span>
                            Explore Restaurants
                        </span>

                        <span class="btn-arrow">
                            →
                        </span>

                    </a>

                </div>


                <!-- TRUST INDICATORS -->

                <div class="hero-trust-indicators">


                    <div class="trust-item">

                        <span class="trust-badge-icon">
                            ✓
                        </span>

                        <span>
                            Fast Delivery
                        </span>

                    </div>


                    <div class="trust-item">

                        <span class="trust-badge-icon">
                            ✓
                        </span>

                        <span>
                            Safe &amp; Secure
                        </span>

                    </div>


                    <div class="trust-item">

                        <span class="trust-badge-icon">
                            ✓
                        </span>

                        <span>
                            Wide Variety
                        </span>

                    </div>


                </div>

            </div>


            <!-- RIGHT FOOD IMAGE -->

            <div class="hero-visual-wrapper">

                <div class="food-stage">

                    <div class="stage-backdrop-ring">
                    </div>

                    <div class="stage-backdrop-glow">
                    </div>


                    <div class="floating-pill pill-top-left">

                        <span class="pill-star">
                            ★
                        </span>

                        <span>
                            Chef's Special Biryani
                        </span>

                    </div>


                    <div class="floating-pill pill-bottom-right">

                        <span class="pill-icon">
                            🔥
                        </span>

                        <span>
                            Fresh &amp; Hot
                        </span>

                    </div>


                    <div class="food-image-frame">

                        <img
                            id="heroFoodImage"
                            class="hero-food-image"
                            src="<%= request.getContextPath() %>/images/hero/biryani.png"
                            alt="Delicious biryani">

                    </div>


                    <!-- SLIDER DOTS -->

                    <div class="slider-dots">

                        <button
                            type="button"
                            class="dot-btn active"
                            data-index="0">
                        </button>

                        <button
                            type="button"
                            class="dot-btn"
                            data-index="1">
                        </button>

                        <button
                            type="button"
                            class="dot-btn"
                            data-index="2">
                        </button>

                    </div>

                </div>

            </div>

        </div>

    </section>



    <!-- =====================================================
         PART 3 — WHAT'S ON YOUR MIND
         LOCKED — DO NOT CHANGE
    ====================================================== -->

    <section
        class="cuisine-section"
        aria-label="Explore by cuisine">

        <div class="cuisine-container">


            <!-- SECTION HEADER -->

            <div class="cuisine-header">

                <div class="cuisine-header-titles">

                    <span class="cuisine-eyebrow">
                        EXPLORE BY CUISINE
                    </span>

                    <h2 class="cuisine-heading">
                        What are you in the mood for?
                    </h2>

                </div>


                <a
                    class="cuisine-view-all"
                    href="#">

                    View All

                    <span>
                        →
                    </span>

                </a>

            </div>


            <!-- CATEGORY LIST -->

            <div
                class="category-list"
                role="list">


                <!-- ALL -->

                <a
                    class="category-item selected"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/all.png"
                            alt="All Cuisines">

                    </div>

                    <span class="category-name">
                        All
                    </span>

                </a>


                <!-- BIRYANI -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/biryani.png"
                            alt="Biryani">

                    </div>

                    <span class="category-name">
                        Biryani
                    </span>

                </a>


                <!-- PIZZA -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/pizza.png"
                            alt="Pizza">

                    </div>

                    <span class="category-name">
                        Pizza
                    </span>

                </a>


                <!-- BURGERS -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/burgers.png"
                            alt="Burgers">

                    </div>

                    <span class="category-name">
                        Burgers
                    </span>

                </a>


                <!-- CHINESE -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/chinese.png"
                            alt="Chinese">

                    </div>

                    <span class="category-name">
                        Chinese
                    </span>

                </a>


                <!-- SOUTH INDIAN -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/south-indian.png"
                            alt="South Indian">

                    </div>

                    <span class="category-name">
                        South Indian
                    </span>

                </a>


                <!-- DESSERTS -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/desserts.png"
                            alt="Desserts">

                    </div>

                    <span class="category-name">
                        Desserts
                    </span>

                </a>


                <!-- HEALTHY -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/healthy.png"
                            alt="Healthy Food">

                    </div>

                    <span class="category-name">
                        Healthy
                    </span>

                </a>


                <!-- BEVERAGES -->

                <a
                    class="category-item"
                    href="#"
                    role="listitem">

                    <div class="category-img-wrap">

                        <img
                            src="<%= request.getContextPath() %>/images/categories/beverages.png"
                            alt="Beverages">

                    </div>

                    <span class="category-name">
                        Beverages
                    </span>

                </a>


            </div>

        </div>

    </section>



    <!-- =====================================================
         PART 4 — TOP RESTAURANTS
    ====================================================== -->

    <%
        List<Restaurant> restaurants =
            (List<Restaurant>) request.getAttribute("restaurants");
    %>


    <section
        class="faah-restaurants-section"
        id="top-restaurants">


        <div class="faah-container">


            <!-- =========================
                 SECTION HEADER
            ========================== -->

            <div class="faah-section-header">


                <div class="faah-header-text">

                    <span class="faah-eyebrow">
                        POPULAR NEAR YOU
                    </span>


                    <h2 class="faah-main-heading">
                        Top Restaurants
                    </h2>


                    <p class="faah-supporting-text">
                        Explore the most loved restaurants in your area.
                    </p>

                </div>


                <a
                    href="<%= request.getContextPath() %>/restaurant"
                    class="faah-see-all-link">

                    <span>
                        See All
                    </span>


                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round">

                        <line
                            x1="5"
                            y1="12"
                            x2="19"
                            y2="12">
                        </line>

                        <polyline
                            points="12 5 19 12 12 19">
                        </polyline>

                    </svg>

                </a>

            </div>



            <!-- =========================
                 RESTAURANT GRID
            ========================== -->

            <div class="faah-restaurant-grid">


                <%
                    if (restaurants != null && !restaurants.isEmpty()) {

                        for (Restaurant restaurant : restaurants) {
                %>


                    <!-- =========================
                         RESTAURANT CARD
                    ========================== -->

                    <article
                        class="faah-restaurant-card"
                        data-restaurant-id="<%= restaurant.getRestaurantId() %>">


                        <!-- RESTAURANT IMAGE -->

                        <div class="faah-card-media">


                            <img
                                class="faah-card-img"
                                src="<%= restaurant.getImageUrl() %>"
                                alt="<%= restaurant.getName() %>"
                                loading="lazy">


                            <!-- FAVORITE BUTTON -->

                            <button
                                type="button"
                                class="faah-favorite-btn"
                                aria-label="Add <%= restaurant.getName() %> to favorites">


                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round">

                                    <path
                                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                                    </path>

                                </svg>

                            </button>


                        </div>



                        <!-- CARD CONTENT -->

                        <div class="faah-card-content">


                            <!-- RATING + DELIVERY -->

                            <div class="faah-meta-row">


                                <!-- RATING -->

                                <div class="faah-rating-badge">

                                    <svg
                                        class="faah-star-icon"
                                        viewBox="0 0 24 24">

                                        <polygon
                                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                                        </polygon>

                                    </svg>


                                    <span>
                                        <%= restaurant.getRating() %>
                                    </span>

                                </div>



                                <!-- DELIVERY TIME -->

                                <div class="faah-delivery-time">


                                    <svg
                                        class="faah-time-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round">

                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10">
                                        </circle>

                                        <polyline
                                            points="12 6 12 12 16 14">
                                        </polyline>

                                    </svg>


                                    <span>
                                        <%= restaurant.getDeliveryTime() %> min
                                    </span>


                                </div>


                            </div>



                            <!-- RESTAURANT NAME -->

                            <h3 class="faah-restaurant-name">

                                <%= restaurant.getName() %>

                            </h3>



                            <!-- DESCRIPTION -->

                            <p class="faah-restaurant-desc">

                                <%= restaurant.getDescription() %>

                            </p>



                            <!-- VIEW MENU -->

                            <a
                                class="faah-menu-btn"
                                href="<%= request.getContextPath() %>/menu?restaurantId=<%= restaurant.getRestaurantId() %>">


                                <span>
                                    View Menu
                                </span>


                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round">

                                    <line
                                        x1="5"
                                        y1="12"
                                        x2="19"
                                        y2="12">
                                    </line>

                                    <polyline
                                        points="12 5 19 12 12 19">
                                    </polyline>

                                </svg>


                            </a>


                        </div>

                    </article>


                <%
                        }

                    } else {
                %>


                    <!-- EMPTY STATE -->

                    <div class="faah-empty-state">


                        <div class="faah-empty-icon">
                            🍽️
                        </div>


                        <h3>
                            No restaurants available
                        </h3>


                        <p>
                            We're adding more restaurants soon.
                        </p>


                    </div>


                <%
                    }
                %>


            </div>

        </div>

    </section>
<!-- =========================================================
     PART 5 — WHY CHOOSE FAAH!! FOOD
     ========================================================= -->

<section class="faah-why-choose-section"
         aria-labelledby="why-choose-title">

    <div class="faah-container">

        <!-- SECTION HEADER -->
        <div class="faah-section-header">

            <div class="faah-badge">
                <span class="faah-badge-dot"></span>
                The Faah!! Promise
            </div>

            <h2 id="why-choose-title"
                class="faah-heading">
                Why Choose Faah!! Food?
            </h2>

            <p class="faah-subheading">
                Good food, great choices, and a delivery experience
                made around you.
            </p>

        </div>


        <!-- FEATURES -->
        <div class="faah-features-grid">

            <!-- FAST DELIVERY -->
            <article class="faah-card">

                <div class="faah-icon-box"
                     aria-hidden="true">

                    <svg class="faah-icon-svg"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         stroke-linecap="round"
                         stroke-linejoin="round">

                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>

                    </svg>

                </div>

                <h3 class="faah-card-title">
                    Fast Delivery
                </h3>

                <p class="faah-card-desc">
                    Hot and fresh food delivered to your doorstep
                    without the long wait.
                </p>

            </article>


            <!-- QUALITY FOOD -->
            <article class="faah-card">

                <div class="faah-icon-box"
                     aria-hidden="true">

                    <svg class="faah-icon-svg"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         stroke-linecap="round"
                         stroke-linejoin="round">

                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>

                        <path d="m9 12 2 2 4-4"/>

                    </svg>

                </div>

                <h3 class="faah-card-title">
                    Quality Food
                </h3>

                <p class="faah-card-desc">
                    Discover trusted restaurants serving food made
                    with care and quality ingredients.
                </p>

            </article>


            <!-- SECURE PAYMENTS -->
            <article class="faah-card">

                <div class="faah-icon-box"
                     aria-hidden="true">

                    <svg class="faah-icon-svg"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         stroke-linecap="round"
                         stroke-linejoin="round">

                        <rect x="2"
                              y="5"
                              width="20"
                              height="14"
                              rx="2"/>

                        <line x1="2"
                              y1="10"
                              x2="22"
                              y2="10"/>

                        <circle cx="7"
                                cy="15"
                                r="1"/>

                        <circle cx="11"
                                cy="15"
                                r="1"/>

                    </svg>

                </div>

                <h3 class="faah-card-title">
                    Secure Payments
                </h3>

                <p class="faah-card-desc">
                    Simple and secure payment options for a smooth
                    checkout experience.
                </p>

            </article>


            <!-- FOOD YOU'LL LOVE -->
            <article class="faah-card">

                <div class="faah-icon-box"
                     aria-hidden="true">

                    <svg class="faah-icon-svg"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         stroke-linecap="round"
                         stroke-linejoin="round">

                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>

                    </svg>

                </div>

                <h3 class="faah-card-title">
                    Food You'll Love
                </h3>

                <p class="faah-card-desc">
                    From biryani to burgers, discover something
                    delicious for every craving.
                </p>

            </article>

        </div>

    </div>

</section>


    <!-- =====================================================
         FOOTER
    ====================================================== -->

    <!-- =========================================================
     PART 6 — FOOTER
     ========================================================= -->

<footer class="faah-footer">

    <div class="faah-footer-container">

        <!-- TOP FOOTER -->
        <div class="faah-footer-top">

            <!-- BRAND -->
            <div class="faah-footer-brand">

                <a href="<%= request.getContextPath() %>/restaurant"
                   class="faah-footer-logo">
                    Faah!! <span>FOOD</span>
                </a>

                <p class="faah-footer-tagline">
                    Good food. Great mood.
                </p>

            </div>


            <!-- QUICK LINKS -->
            <div class="faah-footer-column">

                <h3>Quick Links</h3>

                <a href="<%= request.getContextPath() %>/restaurant">
                    Home
                </a>

                <a href="<%= request.getContextPath() %>/restaurant">
                    Restaurants
                </a>

                <a href="#">
                    Orders
                </a>

                <a href="#">
                    About Us
                </a>

            </div>


            <!-- SUPPORT -->
            <div class="faah-footer-column">

                <h3>Support</h3>

                <a href="#">
                    Help Centre
                </a>

                <a href="#">
                    Contact Us
                </a>

                <a href="#">
                    Privacy Policy
                </a>

                <a href="#">
                    Terms &amp; Conditions
                </a>

            </div>


            <!-- SOCIAL -->
            <div class="faah-footer-column faah-footer-social-column">

                <h3>Follow Us</h3>

                <div class="faah-social-links">

                    <a href="#"
                       class="faah-social-link"
                       aria-label="Facebook">
                        Fb
                    </a>

                    <a href="#"
                       class="faah-social-link"
                       aria-label="Instagram">
                        Ig
                    </a>

                    <a href="#"
                       class="faah-social-link"
                       aria-label="X">
                        X
                    </a>

                    <a href="#"
                       class="faah-social-link"
                       aria-label="LinkedIn">
                        In
                    </a>

                </div>

            </div>

        </div>


        <!-- DIVIDER -->
        <div class="faah-footer-divider"></div>


        <!-- BOTTOM FOOTER -->
        <div class="faah-footer-bottom">

            <div class="faah-made-in-india">
                Made in India
                <span aria-label="India flag">🇮🇳</span>
            </div>

            <p>
                &copy; 2026 Faah!! Food. All rights reserved.
            </p>

        </div>

    </div>

</footer>



    <!-- JAVASCRIPT -->

    <script
        src="<%= request.getContextPath() %>/js/app.js">
    </script>


</body>

</html>