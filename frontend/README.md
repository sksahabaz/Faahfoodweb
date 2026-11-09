# FAah!! FOOD — React frontend

The whole customer-facing site of FAah!! FOOD: every page, login and signup included.
It talks to the Java backend through the JSON API in `src/main/java/com/food/api/`;
login and cart live in the server-side Tomcat session.

## The homepage

1. Cinematic 3D burger (React Three Fiber + GSAP ScrollTrigger): hero, the burger
   comes apart, ingredient close-ups, reassembly, order scene. Drag to rotate it.
2. The burger flies into the **All** tile of the cuisine section.
3. Cuisines (counts from the real menus), top restaurants, all restaurants with
   search: `GET /api/restaurants` and `GET /api/restaurants/{id}/menu`.
4. Navigation: live cart badge (see below), account from `GET /api/auth/me`,
   Login → existing `/login` page, Logout → `POST /api/auth/logout`.

## Cart state and the navbar badge

There is one cart: the Tomcat session cart, read with `GET /api/cart` (query key
`['session', 'cart']`) and changed only through `useCartActions()` in
`src/hooks/useSession.js` (add, quantity, remove, clear, …). Every change answers with
the full updated cart, which replaces the cached one, so the navbar badge (`CartLink`),
the menu's "Your Order" panel, the cart page and the checkout summary all update the
moment the server confirms it. Changes are queued so they reach the server in order and an
older answer can never overwrite a newer one. The cart is re-read when a page mounts, when
the tab becomes visible again and after Back/Forward, so changes made elsewhere (another
tab) show up too. The badge shows `itemCount` (the sum of the quantities) and
is hidden when the cart is empty.

## The restaurant menu page (`/restaurants/:id`)

Restaurant banner, "Recommended for You" dishes with search, and a live "Your Order"
panel (a bottom drawer on smaller screens). Data: `GET /api/restaurants/{id}`,
`GET /api/restaurants/{id}/menu`, and the session cart through `/api/cart` (add,
quantity, remove; one restaurant per cart, as the backend enforces). All images are the
URLs stored in the database; missing or broken ones get a branded placeholder.
Proceed to Checkout opens `/checkout` (guests go through `/login` and come back).

## The cart page (`/cart`)

The restaurant (image, address, listed delivery time), every cart line with − / + and
remove, Continue Ordering (back to that restaurant's menu), Clear Cart (asks first), a
sticky Order Summary (item count, total payable; the backend has no delivery fee or taxes)
and "You May Also Like": available dishes from the same restaurant's menu that aren't in
the cart (`src/lib/cart.js`), each with Add. Dishes switched off or repriced since they
were added are flagged, as on checkout. Empty cart → a Browse Restaurants prompt. Phones
get a sticky bar with the total and Checkout. `CartController` serves the page
(a POST to `/cart`, which the removed JSP forms used, changes nothing and goes to the page).

## The checkout page (`/checkout`)

Delivery details, payment method and a sticky Order Summary, with Cart → Checkout →
Payment progress in the header. `CheckoutController` serves it to logged-in users;
guests are sent to `/login`, and the session remembers checkout so
`LoginController` brings them back (signup → login keeps that too).

- **Delivery:** name and phone come from `GET /api/checkout` (the account's details, or
  what was entered earlier in the session). City and pincode are joined into the single
  `delivery_address` the backend stores ("street, City - 500034"). What the user types
  is kept for the tab in `sessionStorage` until the order is placed.
- **Summary:** the session cart from `/api/cart` (images, names, quantities, prices,
  total); + / − / remove use the same endpoints as the menu page. The cart is compared
  with the restaurant's current menu: unavailable dishes must be removed and changed
  prices updated before ordering. The backend has no delivery fee or taxes.
- **Place Order:** `POST /api/checkout` (delivery details, same rules as
  `CheckoutController`), then `POST /api/orders` (the order is created from the
  session cart on the server, as `PaymentController` does), then the existing
  `/order-confirmation` page. The button is locked while the request runs.
- **Payment:** only Cash on Delivery is selectable. There's no payment gateway in the
  backend, so UPI and cards are listed as "Coming soon" (`PAYMENT_METHODS` in
  `src/lib/checkout.js`).

## Order confirmation (`/order-confirmation/:orderId`)

Checkout goes here with the id returned by `POST /api/orders`. Everything is loaded from
the backend on every visit, so a refresh shows the same order: the order from
`GET /api/orders/{id}` (only the logged-in user's own orders; anyone else gets "couldn't
find this order"), its restaurant from `GET /api/restaurants/{id}`, and the customer's name
from `GET /api/auth/me`. The green "Order Confirmed!" appears only once the order has been
returned; cancelled orders, failed payments, unknown ids and API errors get their own
states. The tracker follows the real `orders.status` (`lib/orders.js`) and re-checks every
30 s; nothing advances on its own. Only the time the order was placed is recorded, so
only that stage shows a time. No delivery estimate is shown (the backend has none).
Track Order opens My Orders with this order selected (there is no live tracking yet). The bag,
rider and storefront drawings were cut out of the approved design by
`scripts/prepare-confirmation-art.py` into `public/confirmation/` (the mock-up's lettering
removed; the real logo is placed on the bag as text).

`OrderConfirmationController` serves the page; plain
`/order-confirmation` (no id) redirects to the session's last
order.

## My Orders (`/my-orders`)

Order history on the left (filters All / Active / Delivered / Cancelled with real counts,
one card per order), the selected order on the right (restaurant, order id, placed time,
payment status, the status tracker, items with quantities and line totals, item total,
total payable or paid, delivery address). Data: `GET /api/orders` (the session user's
orders only), `GET /api/orders/{id}` (owner only, 404 otherwise) and `GET /api/restaurants`
for images and locations. Filters follow `orderGroup()` in `src/lib/orders.js`: placed /
preparing / out for delivery are Active, delivered / completed are Delivered,
cancelled / rejected are Cancelled; payment-failed and unknown statuses are only under All.
The selected order and filter live in the URL (`?order=21&filter=active`).

**Reorder** (`useReorder` in `src/hooks/useOrders.js`) reads the restaurant's menu now,
skips dishes that are gone or switched off (and says which), adds the rest through the
shared cart actions at today's prices (the cart always takes prices from the menu table),
and asks before replacing another restaurant's dishes. The navbar badge updates from the
server's answer. There is no Track Order or Invoice button: the backend has no live
tracking or invoices. `MyOrdersController` serves the page (guests go to `/login` first and
come back, `?order` kept).

## My Profile (`/profile`, `/profile/addresses`)

A sidebar (picture, name, email, My Profile / My Orders / Saved Addresses, Logout) and the
account's details (name, email, phone, member since from `users.created_date`). Edit Profile
changes name and phone; Saved Addresses shows and edits the one address the account keeps
(`users.address`, which checkout fills in). Email is the login, so it isn't editable.

**Profile picture:** the camera button opens the file picker; the browser checks the file
(JPG, PNG or WebP, at most 5 MB), crops it to a 512 × 512 square, shows a preview, and on
Save sends it to `PUT /api/profile/avatar` (`src/lib/profile.js`). The backend checks the
bytes really are that image type and stores one file per user (`AvatarStore`, folder set by
`FAAH_UPLOAD_DIR`; nothing in MySQL). `GET /api/auth/me` returns `avatarUrl` (versioned, so a
new picture is never served from cache) or null, in which case initials are shown.

**One source of truth:** the signed-in user is the `['session', 'me']` query. Every profile
change answers with the updated user, which replaces that query (`useProfileActions`), so the
navbar avatar and name change at once on every page, and survive refreshes and new logins
because they come from the server. `ProfileController` serves the page
(guests go to `/login` first and come back).

## Login and signup (`/login`, `/signup`)

The approved login and signup designs, ported from the former JSP pages with the same markup
and styles (`src/sections/auth/`: `auth.css` shared, `login.css` / `signup.css` scoped to
their page, a scoped copy of Poppins incl. 400). `LoginController` and `SignupController`
serve the page; the forms use the existing JSON auth API (`AuthApi` → `AuthService`):

- **Login** `POST /api/auth/login {email, password}`: the BCrypt hash is checked on the server,
  the session gets a new id and the user, and the answer's `redirectTo` is where the user was
  going (pages like checkout remember it in the session before sending a guest to `/login`)
  or `/`. The page then opens it with a full page load. `/api/auth/me` returns the same
  destination as `next`, so the page can say "Log in to continue to checkout".
- **Signup** `POST /api/auth/signup {name, email, phone, address, password}`: validated on the
  server too (required fields, email format, 10–14 digit phone, lengths, 72-byte password),
  duplicate emails answer 409. Signing up doesn't log in: the login page opens with the email
  filled in and a one-time "account created" notice. Address isn't in the design but the
  backend requires it. Confirm Password is checked in the browser only.
- Passwords live only in component state and the request body (never in storage or logs).
  The auth API only accepts JSON, which another site's form can't send.
- Google, GitHub and Forgot Password are visual only ("Coming soon"); "Remember me" is
  left out because the backend has no persistent login. The login artwork is
  `public/auth/meal.webp` (made by `scripts/prepare-login-art.py`).

React owns **every page**. Login and cart state are always read from the shared Tomcat
session and refreshed when you come back to the tab.

## How it is served

`HomeController` (mapped to `/` and `/restaurants/*`), `CartController` (GET `/cart`),
`CheckoutController` (GET `/checkout`), `OrderConfirmationController`
(`/order-confirmation/*`), `MyOrdersController` (GET `/my-orders`), `ProfileController`
(GET `/profile`), `LoginController` (GET `/login`) and `SignupController` (GET `/signup`) send
this app's `index.html` (through `ReactPages`, with a
`<base href>` at the context root, so nested URLs work and a refresh on any page works).
Unknown URLs get the app's "page not found" screen (`NotFoundController`, status 404).
There are no JSP pages (the old ones are kept in `../FAah-Food-Legacy-Backup/`); see the main
README.

The build uses relative URLs (`base: './'`) and works out the application's context
path at runtime (`src/lib/paths.js`), so the same build works at `/` (Docker/Render)
and at `/Faahfoodweb/` (Eclipse).

## Run locally

Development (hot reload):

1. Start the Java app in Eclipse on Tomcat (http://localhost:8080/Faahfoodweb).
2. In this folder: `npm install` then `npm run dev`
3. Open http://localhost:5173

Vite forwards `/api` and `/images` to Tomcat, so login and cart sessions work.
If Tomcat runs somewhere else, create `frontend/.env.local`:

```text
BACKEND_URL=http://localhost:8080/Faahfoodweb
```

Pages that the server must check first (checkout, My Orders, …) redirect through Tomcat,
so to try the full flow, serve the build from Tomcat: `npm run build:webapp`, then restart
Tomcat and open http://localhost:8080/Faahfoodweb/.

## Scripts

| Command                | What it does                                                     |
|------------------------|------------------------------------------------------------------|
| `npm run dev`          | Dev server with hot reload                                       |
| `npm run build`        | Production build into `dist/`                                    |
| `npm run build:webapp` | Build, then copy it into `../src/main/webapp` (git-ignored)      |
| `npm run preview`      | Serve the production build                                       |
| `npm run lint`         | Lint with oxlint                                                 |

`predev` / `prebuild` copy three.js's Draco decoder into `public/draco/` (git-ignored).

## Folder structure

```text
src/
├── app/            App shell: providers and routes (homepage only)
├── api/            fetch wrapper + one function per backend endpoint
├── hooks/          Data hooks: restaurants, cuisine index, session (auth + cart)
├── lib/            Runtime paths, model URLs, device tiers, cuisine definitions
├── pages/          HomePage
├── sections/home/  Cuisines, restaurants, static hero
│   └── story/      The scroll story: section, decor, backdrop, drag input, CSS
├── components/
│   ├── layout/     SiteNav, SiteFooter, RootLayout
│   └── ui/         RestaurantCard
├── three/          BurgerStory (3D scene + scroll timeline), StudioLights
├── animations/     Lenis smooth scroll (off on the homepage) and helpers
├── styles/         Tailwind + design tokens
└── assets/         Source images (not used by the build yet)
public/
├── models/         faah-burger.glb (Draco), from the FAah-Food-3D Blender project
├── decor/          Floating ingredient sprites
├── brand/          Fallback burger image
├── cuisines/       Cuisine illustrations (scripts/prepare-cuisines.py)
└── draco/          Draco decoder (generated)
```

The story's CSS (`sections/home/story/story.css`) is scoped under `.faah-home`.
