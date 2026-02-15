# Antigravity Frontend

Frontend app for Antigravity, an AI-powered sustainability copilot.

## Primary MCP Platform

- **AI Platform:** Archestra (primary MCP client)
- **MCP Flow:** Archestra -> MCP Server -> Antigravity Backend

## Team

- **Aditya** - Solo builder (Product, Design, Frontend, Backend, MCP, Infrastructure)

## Local Development

```bash
npm install
npm run dev
```

## Production Environment

Do not commit `.env` files. Set variables in deployment dashboard:

- `VITE_API_URL=https://<your-backend>.up.railway.app`

## Build

```bash
npm run build
```
