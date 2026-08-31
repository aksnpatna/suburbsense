# Deployment Guide

This project is configured to serve production traffic directly from the local machine via a **Cloudflare Tunnel**.

Because of this architecture, "deploying" changes to production simply means building the code locally so that the server running behind the tunnel picks up the latest assets.

## Deploying Frontend Changes

1. Open a terminal and navigate to the `frontend` directory.
2. Run the build command:
   ```bash
   npm run build
   ```
3. That's it! The build output in the `frontend/dist` directory is immediately served through the Cloudflare Tunnel, so your changes are now live on the domain.

## Deploying Backend Changes

If you make changes to the backend (FastAPI/Python), they should be automatically picked up if the server is running in reload mode. Otherwise, simply restart the backend service.

## Important Note for AI Agents
Any AI assistant or agent working in this repository has been configured (via `.agents/AGENTS.md`) to understand that running `npm run build` is equivalent to deploying the frontend. Do not look for Vercel, Netlify, or GitHub Actions for deployment in this project.
