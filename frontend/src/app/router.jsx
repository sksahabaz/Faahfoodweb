import { createBrowserRouter } from 'react-router'
import RootLayout from '@/components/layout/RootLayout'
import { ROUTER_BASENAME } from '@/lib/paths'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import MenuPage from '@/pages/MenuPage'
import MyOrdersPage from '@/pages/MyOrdersPage'
import NotFoundPage from '@/pages/NotFoundPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import ProfilePage from '@/pages/ProfilePage'
import SignupPage from '@/pages/SignupPage'

// React owns every page: the homepage, the restaurant menu page (/restaurants/:id), the cart
// (/cart), checkout (/checkout), order confirmation (/order-confirmation/:orderId), My Orders
// (/my-orders), the profile (/profile, /profile/addresses), login (/login) and signup
// (/signup). Each URL has a servlet that serves index.html (HomeController, CartController,
// CheckoutController, OrderConfirmationController, MyOrdersController, ProfileController,
// LoginController, SignupController), so opening or refreshing any of them works; any other
// URL gets the "page not found" screen (NotFoundController).
const home = { element: <HomePage />, handle: { smoothScroll: false } }

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, ...home },
        { path: 'index.html', ...home }, // the same page opened through its file name
        { path: 'restaurants/:restaurantId', element: <MenuPage /> },
        { path: 'cart', element: <CartPage /> },
        { path: 'checkout', element: <CheckoutPage />, handle: { smoothScroll: false } },
        { path: 'order-confirmation/:orderId', element: <OrderConfirmationPage /> },
        // the details panel scrolls on its own, so no smooth page scrolling here
        { path: 'my-orders', element: <MyOrdersPage />, handle: { smoothScroll: false } },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'login', element: <LoginPage />, handle: { smoothScroll: false } },
        { path: 'signup', element: <SignupPage />, handle: { smoothScroll: false } },
        { path: 'profile/addresses', element: <ProfilePage section="addresses" /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  // "/" in Docker, "/Faahfoodweb" under Eclipse's Tomcat (worked out at runtime).
  { basename: ROUTER_BASENAME },
)
