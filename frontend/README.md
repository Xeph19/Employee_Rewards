# BrightThanks React client

This is the standalone React 19 client for the Laravel `/api/v1` REST API. It does not use Inertia.

## Development

Make sure Herd is serving Laravel at `http://employee_rewards.test`, then run:

```bash
npm install
npm run dev
```

Vite proxies `/api` and `/sanctum` to the Herd site during development. Override `VITE_PROXY_TARGET` when the local Herd URL differs. For a separately hosted API, set `VITE_API_URL`.

Authentication uses Laravel Sanctum stateful cookies. The client requests `/sanctum/csrf-cookie` before login and sends credentials with every API request.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
