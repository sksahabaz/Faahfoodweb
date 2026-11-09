# 🍔 FAah!! FOOD

> A full-stack food ordering web application: a React (Vite) frontend on a Java backend (Jakarta Servlets, JSON API, JDBC, MySQL), deployed with Docker and Render.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-FAah%21%21%20FOOD-1f6feb?style=for-the-badge)](https://faahfoodweb.onrender.com)
[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square)](https://www.oracle.com/java/)
[![Tomcat](https://img.shields.io/badge/Apache%20Tomcat-10.1-f8dc75?style=flat-square)](https://tomcat.apache.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=flat-square)](https://www.mysql.com/)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square)](https://render.com/)

## 🚀 Live Demo

**[Open FAah!! FOOD](https://faahfoodweb.onrender.com)**

> The live application is hosted on Render. The free instance may take some time to wake up after a period of inactivity.

---

## 📖 About

**FAah!! FOOD** is a full-stack food ordering web application: a React single-page frontend (Vite, Tailwind, React Three Fiber) served by Tomcat, talking to a Java backend built with Jakarta Servlets, a JSON API, JDBC, DAO layers and MySQL. Every page, login and signup included, is part of the React app; there are no JSP pages.

Users can create an account, log in, browse restaurants and menus, manage a restaurant-specific cart, proceed through checkout, place orders and view their order history.

The application is deployed as a Dockerized Tomcat application on Render and uses a managed MySQL database in production.

---

## ✨ Features

- User registration and login
- BCrypt-based password hashing in the application authentication flow
- Session-based user authentication
- Restaurant listing
- Restaurant-specific menu browsing
- Add items to cart
- Increase/decrease cart quantities
- Remove items and clear cart
- Restaurant-aware cart handling
- Checkout and delivery details
- Order placement
- Order confirmation
- My Orders / order history
- MySQL persistence through JDBC
- Production database connectivity through environment variables
- Docker-based deployment
- Automatic deployment from the `main` branch through Render

---

## 🛠️ Tech Stack

### Frontend

- React 19 + Vite (single-page app, React Router)
- Tailwind CSS 4
- TanStack Query (server state)
- React Three Fiber / three.js (3D burger)

### Backend

- Java 21
- Jakarta Servlets
- JDBC
- DAO / DAO Implementation pattern
- Service-layer package
- Session-based authentication

### Database

- MySQL
- MySQL Connector/J 9.7.0

### Server & Deployment

- Apache Tomcat 10.1
- Docker
- Render

### Production Database

- Aiven MySQL

---

## 🏗️ System Architecture

FAah!! FOOD follows a layered Java web architecture:

```text
┌──────────────────────────────┐
│          Browser             │
│       HTML / CSS / JS        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  React app (Vite build)      │
│  every page, incl. login     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        Controllers           │
│     Jakarta Servlets        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          Services            │
│      Business Logic          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            DAO               │
│     Database Operations      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            JDBC              │
│      MySQL Connectivity      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       MySQL Database         │
│  Local MySQL / Aiven MySQL   │
└──────────────────────────────┘
```

### Production Architecture

```text
Developer
   │
   │ git push
   ▼
GitHub (main)
   │
   │ automatic deployment
   ▼
Render
   │
   ▼
Docker Container
   │
   ▼
Apache Tomcat 10.1
   │
   ▼
FAah!! FOOD Application
   │
   │ JDBC + SSL
   ▼
Aiven MySQL
```

---

## 🗄️ Database Architecture

FAah!! FOOD uses five relational tables:

- `users`
- `restaurants`
- `menu`
- `orders`
- `order_items`

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    RESTAURANTS ||--o{ MENU : offers
    RESTAURANTS ||--o{ ORDERS : receives
    ORDERS ||--o{ ORDER_ITEMS : contains
    MENU ||--o{ ORDER_ITEMS : included_in

    USERS {
        int user_id PK
        varchar name
        varchar email UK
        varchar password
        varchar phone
        varchar address
        varchar role
        timestamp created_date
        timestamp last_login_date
    }

    RESTAURANTS {
        int restaurant_id PK
        varchar name
        varchar description
        varchar address
        varchar phone
        decimal rating
        int delivery_time
        timestamp created_date
        varchar image_url
    }

    MENU {
        int menu_id PK
        int restaurant_id FK
        varchar item_name
        varchar description
        decimal price
        varchar category
        varchar image_url
        boolean is_available
        timestamp created_date
    }

    ORDERS {
        int order_id PK
        int user_id FK
        int restaurant_id FK
        timestamp order_date
        decimal total_amount
        varchar status
        varchar payment_method
        varchar payment_status
        varchar delivery_address
    }

    ORDER_ITEMS {
        int order_item_id PK
        int order_id FK
        int menu_id FK
        int quantity
        decimal price
        decimal subtotal
    }
```

### Relationships

| Relationship | Description |
|---|---|
| `users → orders` | One user can place many orders |
| `restaurants → menu` | One restaurant can offer many menu items |
| `restaurants → orders` | One restaurant can receive many orders |
| `orders → order_items` | One order can contain multiple order items |
| `menu → order_items` | One menu item can appear in multiple order items |

### Database Schema

A clean, data-free schema is available at:

```text
database/schema.sql
```

The schema file is intended for local setup and documentation. It does **not** contain production user records, passwords, addresses or order data.

---

## 📁 Project Structure

```text
Faahfoodweb/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/food/
│       │       ├── controller/
│       │       │   ├── AccountCheckController.java
│       │       │   ├── CartController.java
│       │       │   ├── CheckoutController.java
│       │       │   ├── LoginController.java
│       │       │   ├── LogoutController.java
│       │       │   ├── MenuController.java
│       │       │   ├── MyOrdersController.java
│       │       │   ├── OrderConfirmationController.java
│       │       │   ├── PaymentController.java
│       │       │   ├── RestaurantController.java
│       │       │   └── SignupController.java
│       │       │
│       │       ├── dao/
│       │       │   ├── MenuDAO.java
│       │       │   ├── OrderDAO.java
│       │       │   ├── OrderItemDAO.java
│       │       │   ├── RestaurantDAO.java
│       │       │   └── UserDAO.java
│       │       │
│       │       ├── daoimpl/
│       │       │   ├── MenuDAOImpl.java
│       │       │   ├── OrderDAOImpl.java
│       │       │   ├── OrderItemDAOImpl.java
│       │       │   ├── RestaurantDAOImpl.java
│       │       │   └── UserDAOImpl.java
│       │       │
│       │       ├── model/
│       │       │   ├── Cart.java
│       │       │   ├── CartItem.java
│       │       │   ├── Menu.java
│       │       │   ├── Order.java
│       │       │   ├── OrderItem.java
│       │       │   ├── Restaurant.java
│       │       │   └── User.java
│       │       │
│       │       ├── service/
│       │       └── util/
│       │           └── DBConnection.java
│       │
│       └── webapp/
│           ├── META-INF/context.xml  HTTPS behind Render's proxy, SameSite cookie
│           └── WEB-INF/
│               ├── lib/              MySQL connector, Gson, BCrypt
│               └── web.xml           (no JSP pages: every page is the React app)
│           (the React build is copied in here: by the Dockerfile, or locally by
│            `npm run build:webapp`; those generated files are git-ignored)
│
├── frontend/                         React app (see frontend/README.md)
│
├── database/
│   └── schema.sql
│
├── Dockerfile
├── .gitignore
└── README.md
```

---

## 🔄 Application Flows

### Authentication

```text
Signup
  ↓
SignupController
  ↓
UserDAO / UserDAOImpl
  ↓
JDBC
  ↓
users table
```

```text
Login
  ↓
LoginController
  ↓
UserDAO / UserDAOImpl
  ↓
BCrypt password verification
  ↓
Session
```

### Restaurant & Menu Browsing

```text
Restaurants Page
  ↓
RestaurantController
  ↓
RestaurantDAO
  ↓
restaurants table
```

```text
Menu Page
  ↓
MenuController
  ↓
MenuDAO
  ↓
menu table
```

### Cart & Checkout

```text
Menu
  ↓
CartController
  ↓
Session Cart
  ↓
CheckoutController
  ↓
Checkout Page
  ↓
PaymentController
```

### Order Placement

```text
PaymentController
       │
       ├── OrderDAO
       │      ↓
       │   orders
       │
       └── OrderItemDAO
              ↓
          order_items
              │
              ▼
     Order Confirmation
              │
              ▼
          My Orders
```

---

## 🌐 Servlet Endpoints

| Endpoint | Controller | Purpose |
|---|---|---|
| `/` | `HomeController` | React app: homepage |
| `/restaurants/{id}` | `HomeController` | React app: restaurant menu |
| `/cart` | `CartController` | React app: cart (a POST, from the removed JSP form, changes nothing and goes to `/cart`) |
| `/checkout` | `CheckoutController` | React app: checkout; guests go to `/login` first |
| `/order-confirmation/{id}` | `OrderConfirmationController` | React app: order confirmation (`/order-confirmation` alone → the session's last order) |
| `/my-orders` | `MyOrdersController` | React app: order history; guests go to `/login` first |
| `/login` | `LoginController` | React app: login, through `POST /api/auth/login`; then the page the user was going to (e.g. `/checkout`), else the homepage |
| `/signup` | `SignupController` | React app: signup, through `POST /api/auth/signup`; then `/login` (signing up doesn't log in) |
| `/api/auth/me`, `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout` | `AuthApi` | Session user; login (BCrypt check, new session id); signup (validated, BCrypt-hashed); logout |
| `/logout` | `LogoutController` | End the session, go to the homepage (the React app uses `POST /api/auth/logout`) |
| `/restaurant`, `/menu?restaurantId={id}`, `/payment`, `/account-check` | legacy controllers | Old JSP URLs: redirect to `/`, `/restaurants/{id}`, `/checkout`, `/login` |
| any other page | `NotFoundController` | React app's "page not found" screen (status 404) |
| `/profile`, `/profile/addresses` | `ProfileController` | My Profile and Saved Addresses (React only; guests go to `/login` first) |
| `/api/profile`, `/api/profile/avatar` | `ProfileApi` | Edit name/phone/address; upload, show or remove the profile picture (own account only) |

---

## ⚙️ Local Setup

### Prerequisites

Install:

- Java 21 or later
- Eclipse IDE with Dynamic Web Project support
- Apache Tomcat 10.1
- MySQL 8.0+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sksahabaz/Faahfoodweb.git
cd Faahfoodweb
```

### 2. Import into Eclipse

Import the project as an existing Eclipse project / Dynamic Web Project.

Configure Apache Tomcat 10.1 as the server runtime.

### 3. Create the local database

Open MySQL Workbench and run:

```sql
SOURCE database/schema.sql;
```

Or open `database/schema.sql` and execute it manually.

### 4. Create the application database user

For local development, create a dedicated MySQL application user and grant it access only to the application database.

Example:

```sql
CREATE USER 'faah_app'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON faahfood.* TO 'faah_app'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Configure environment variables

The application reads database credentials from environment variables.

```text
DB_URL=jdbc:mysql://localhost:3306/faahfood
DB_USER=faah_app
DB_PASSWORD=your_password
```

Do not commit real credentials to GitHub.

Profile pictures are saved as files (one per user, never in MySQL), in
`FAAH_UPLOAD_DIR/avatars` when that variable is set, otherwise in
`{tomcat}/faah-data/avatars`. On Render the container's disk is reset on every deploy,
so add a persistent disk and set `FAAH_UPLOAD_DIR` to its mount path (e.g. `/var/data`),
or uploaded pictures disappear after each deploy.

### 6. Run the application

Start the project using Apache Tomcat 10.1 from Eclipse.

Every page URL is served the React app by its controller (see `controller/ReactPages.java`),
so build the frontend into the webapp first:
`cd frontend && npm ci && npm run build:webapp` (the copied files are git-ignored), then
start Tomcat. For frontend development,
`npm run dev` in `frontend/` (see `frontend/README.md`). The Docker image builds and
includes the React app automatically.

The old JSP storefront and the `FAAH_HOME=react|jsp` switch were removed from the
application in the Stage 1 cleanup, and the login and signup JSP pages after that (now
React pages with the same design). They are kept outside the project in
`../FAah-Food-Legacy-Backup/` (with restore steps) and in Git history (commit `c1c11ea`).
`FAAH_HOME` is no longer read.

---

## 🔐 Configuration & Security

Database credentials are intentionally not hardcoded in the application.

`DBConnection.java` reads:

```text
DB_URL
DB_USER
DB_PASSWORD
```

Production values are configured through Render environment variables.

Never commit:

- Database passwords
- `.env` files
- Production credentials
- Private database dumps
- Real user data

---

## 🚀 Deployment

The production deployment uses:

```text
GitHub
   ↓
Render
   ↓
Docker
   ↓
Apache Tomcat 10.1
   ↓
FAah!! FOOD
   ↓
Aiven MySQL
```

### Automatic Deployment

The `main` branch is connected to Render.

The normal development workflow is:

```bash
git add .
git commit -m "Describe your change"
git push origin main
```

After the push:

```text
GitHub
  ↓
Render detects commit
  ↓
Docker image/build
  ↓
Tomcat application starts
  ↓
New version becomes live
```

### Production Database

The production application connects to Aiven MySQL using environment variables and an SSL-enabled JDBC connection.

---

## 🧪 Application Flow Checklist

The deployed application has been tested through the main user flow:

- [x] User registration
- [x] User login
- [x] Restaurant browsing
- [x] Menu browsing
- [x] Add to cart
- [x] Update cart quantity
- [x] Remove cart items
- [x] Checkout
- [x] Order placement
- [x] Order confirmation
- [x] My Orders
- [x] Logout
- [x] Production database persistence

---



---

## 🔮 Future Improvements

Potential future improvements include:

- Online payment gateway integration
- Restaurant/admin dashboard
- Order status tracking
- Search and filtering
- Reviews and ratings
- Email/order notifications
- Improved authorization and role-based access
- Production-ready image storage
- Additional validation and error handling

---

## 👨‍💻 Author

**Shekh Shahabaz**

- GitHub: [@sksahabaz](https://github.com/sksahabaz)

---

## 📄 License

This project is developed as a portfolio/learning project.

If you plan to distribute or reuse the project, add an appropriate open-source license to the repository.

---

## ⭐ Support

If you find the project useful or interesting, consider giving the repository a ⭐ on GitHub.
