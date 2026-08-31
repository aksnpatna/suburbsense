# Agent Rules

## Deployment
- **Frontend Deployment**: The frontend is served via a Cloudflare Tunnel connected directly to the local build output. To deploy frontend changes, simply run `npm run build` in the `frontend` directory. There is no external deployment pipeline; building the static assets locally pushes them live.
- **Backend Deployment**: The backend API runs locally and is exposed via Cloudflare Tunnel. Restarting the backend service applies changes instantly.
