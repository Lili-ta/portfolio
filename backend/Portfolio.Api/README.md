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
| GET    | /api/focus   | Current focus (from MongoDB if `MONGODB_URI` set, else appsettings) |
| GET    | /api/db      | Database info (MongoDB/NoSQL when connected) |
| GET    | /api/visit   | Increments visit count in MongoDB (demonstrates NoSQL write) |
| GET    | /api/stack   | Backend tech stack (includes DB when configured) |

## MongoDB (NoSQL)

When `MONGODB_URI` is set, the API uses **MongoDB** for:

- **Focus** – Stored in `portfolio.settings`; the "Current focus" in the Live from .NET section is read from the database.
- **Visit count** – Stored in `portfolio.stats`; each call to `/api/visit` increments a counter (demonstrates read/write with NoSQL).

**Setup (free tier):**

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) (free M0).
2. Create a database user and get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/`).
3. **Locally:** set `MONGODB_URI` in environment or `appsettings.Development.json`.
4. **Railway:** Project → your API service → Variables → add `MONGODB_URI` = your Atlas connection string.

The portfolio "Live from .NET" section will then show a **Database: MongoDB (NoSQL)** card and optional visit count.

**If you get SSL handshake errors** (e.g. in Docker/Railway):

1. **Try Stable API:** The app now sets `ServerApi = ServerApiVersion.V1` (Atlas-recommended). Redeploy and test `/api/db/test`.
2. **Try standard URI instead of SRV:** Some environments fail with `mongodb+srv://`. Use a **standard** URI with the same hosts. From your cluster the hosts are in the error (e.g. `ac-5mfdkur-shard-00-00.xwownux.mongodb.net:27017`). Set `MONGODB_URI` to:
   `mongodb://USERNAME:PASSWORD@ac-5mfdkur-shard-00-00.xwownux.mongodb.net:27017,ac-5mfdkur-shard-00-01.xwownux.mongodb.net:27017,ac-5mfdkur-shard-00-02.xwownux.mongodb.net:27017/?tls=true&authSource=admin`
   Replace `USERNAME` and `PASSWORD` with your Atlas DB user; URL-encode the password if it has special characters.
3. **Relax TLS (if still failing):** On Railway add **`MONGODB_INSECURE_TLS`** = **`true`**, then redeploy.
4. **Test:** Open `https://YOUR-API-URL/api/db/test` to confirm connectivity.

## Configuration

- **Without MongoDB:** Edit `appsettings.json` → `Focus:Current` to change the focus message.
- **With MongoDB:** Focus is stored in the database; you can update it by inserting/updating the document in `portfolio.settings` (e.g. via Atlas UI or a small admin endpoint).

## Deploy (Azure, Railway, etc.)

- **Azure App Service**: Create a Web App (Linux, .NET 8), deploy this folder. Set the portfolio's `VITE_API_URL` to the app URL.
- **Railway**: See the "Deploy to Railway" section in the root README. Set root to `backend/Portfolio.Api`, then set `VITE_API_URL` in Vercel to the Railway URL.
- **Fly.io**: Connect the repo, set root to `backend/Portfolio.Api`, build and run. Set `VITE_API_URL` in Vercel to the deployed URL.

CORS is enabled for any origin. The app reads the `PORT` environment variable so it works on Railway and similar hosts.
