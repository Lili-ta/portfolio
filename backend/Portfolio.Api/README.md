# Portfolio API (.NET 8)

Minimal API that powers the **Live from .NET** section on the portfolio. Demonstrates full-stack React + C#.

## Run locally

```bash
dotnet run
```

- API: http://localhost:5050  
- Try: http://localhost:5050/api/status  

## Endpoints

| Method | Path         | Description                          |
|--------|--------------|--------------------------------------|
| GET    | /api/status  | Service name, version, .NET runtime, uptime |
| GET    | /api/focus   | Current focus message (from appsettings)    |
| GET    | /api/stack   | Backend tech stack                        |

## Configuration

Edit `appsettings.json` → `Focus:Current` to change the message shown in the portfolio.

## Deploy (Azure, Railway, etc.)

- **Azure App Service**: Create a Web App (Linux, .NET 8), deploy this folder. Set the portfolio's `VITE_API_URL` to the app URL.
- **Railway**: See the "Deploy to Railway" section in the root README. Set root to `backend/Portfolio.Api`, then set `VITE_API_URL` in Vercel to the Railway URL.
- **Fly.io**: Connect the repo, set root to `backend/Portfolio.Api`, build and run. Set `VITE_API_URL` in Vercel to the deployed URL.

CORS is enabled for any origin. The app reads the `PORT` environment variable so it works on Railway and similar hosts.
