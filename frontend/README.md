# FAah!! FOOD — React frontend

The new UI for FAah!! FOOD. It talks to the Java backend through the JSON API in
`src/main/java/com/food/api/`.

## Run locally

1. Start the Java app in Eclipse on Tomcat (http://localhost:8080/Faahfoodweb).
2. In this folder:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

Vite forwards `/api` and `/images` to Tomcat, so login and cart sessions work
as normal. If Tomcat runs somewhere else, create `frontend/.env.local`:

```text
BACKEND_URL=http://localhost:8080/Faahfoodweb
```

## Scripts

| Command           | What it does                    |
|-------------------|---------------------------------|
| `npm run dev`     | Dev server with hot reload      |
| `npm run build`   | Production build into `dist/`   |
| `npm run preview` | Serve the production build      |
| `npm run lint`    | Lint with oxlint                |

## Folder structure

```text
src/
├── app/            App shell: providers and routes
├── api/            fetch wrapper + one function per backend endpoint
├── hooks/          Data hooks (TanStack Query)
├── pages/          One file per route
├── sections/       Large page sections (e.g. sections/home/Hero.jsx)
├── components/
│   ├── layout/     Navbar, footer, page shell
│   └── ui/         Buttons, cards, inputs
├── three/          3D scenes and models (React Three Fiber)
├── animations/     Smooth scroll and GSAP helpers
├── styles/         Global CSS and design tokens
└── assets/         Images and fonts imported from code
public/
└── models/         .glb 3D model files
```
