# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Testing

Run the test suite with `bun run test`, or run it once with V8 coverage using `bun run test:coverage`. Coverage is provided by `@vitest/coverage-v8`.

## Deployment

Set `VITE_DELCOM_BASEURL` to the backend API URL in the deployment environment before building. `APP_HOST` and `APP_PORT` configure the local Vite development server; they do not assign a public website domain. Configure `ifs24014-pabwe2026-reactjs.s1if.cloud` as the site's domain in the hosting platform and point its DNS to that platform. `APP_URL` and `ASSET_URL` from a backend environment are not needed by this Vite frontend.
