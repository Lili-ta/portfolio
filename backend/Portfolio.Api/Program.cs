using System.Net.Security;
using System.Security.Authentication;
using MongoDB.Driver;
using Portfolio.Api.Models;

// Prefer TLS 1.2+ for outbound connections (helps MongoDB Atlas SSL handshake in some environments)
System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12 | System.Net.SecurityProtocolType.Tls13;

var builder = WebApplication.CreateBuilder(args);

// Railway (and similar hosts) inject PORT; use it so the app listens on the right port
if (Environment.GetEnvironmentVariable("PORT") is { } port)
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

var startTime = DateTime.UtcNow;
var mongoUri = Environment.GetEnvironmentVariable("MONGODB_URI");

// Shared MongoDB client with explicit TLS and shorter timeout (avoids 30s hang; helps with Atlas SSL)
MongoClient? CreateMongoClient()
{
    if (string.IsNullOrWhiteSpace(mongoUri)) return null;
    var settings = MongoClientSettings.FromConnectionString(mongoUri);
    settings.ServerSelectionTimeout = TimeSpan.FromSeconds(15);
    settings.ConnectTimeout = TimeSpan.FromSeconds(10);
    if (!settings.UseTls) settings.UseTls = true;
    // Force TLS 1.2/1.3 only — avoids handshake failures with Atlas in some Docker/OpenSSL environments
    settings.SslSettings ??= new SslSettings();
    settings.SslSettings.EnabledSslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13;
    // Optional: relax TLS cert validation (set MONGODB_INSECURE_TLS=true only if SSL still fails)
    if (string.Equals(Environment.GetEnvironmentVariable("MONGODB_INSECURE_TLS"), "true", StringComparison.OrdinalIgnoreCase))
    {
        settings.AllowInsecureTls = true;
        settings.SslSettings.CheckCertificateRevocation = false; // must be false when AllowInsecureTls is true
    }
    return new MongoClient(settings);
}
Lazy<MongoClient?> lazyMongo = new Lazy<MongoClient?>(CreateMongoClient);
MongoClient? Mongo() => lazyMongo.Value;

// Health & status - proves the API is live and shows .NET stack
app.MapGet("/api/status", () => new
{
    service = "Portfolio API",
    version = "1.0",
    runtime = $".NET {Environment.Version}",
    environment = app.Environment.EnvironmentName,
    uptimeSeconds = (int)(DateTime.UtcNow - startTime).TotalSeconds,
    timestamp = DateTime.UtcNow
})
.WithName("GetStatus")
.WithTags("Status");

// "Current focus" - from MongoDB (NoSQL) when MONGODB_URI is set, else appsettings
app.MapGet("/api/focus", async (IConfiguration config) =>
{
    if (!string.IsNullOrWhiteSpace(mongoUri))
    {
        try
        {
            var client = Mongo();
            if (client == null) throw new InvalidOperationException("Mongo client not configured");
            var db = client.GetDatabase("portfolio");
            var collection = db.GetCollection<FocusDocument>("settings");
            var doc = await collection.Find(d => d.Id == "focus").FirstOrDefaultAsync();
            if (doc != null)
                return new { focus = doc.Text, updated = doc.Updated.ToString("O") };
            // Seed default focus on first run
            var defaultText = config["Focus:Current"] ?? "Building reliable full-stack applications with React and .NET 8.";
            var newDoc = new FocusDocument { Id = "focus", Text = defaultText, Updated = DateTime.UtcNow };
            await collection.InsertOneAsync(newDoc);
            return new { focus = newDoc.Text, updated = newDoc.Updated.ToString("O") };
        }
        catch
        {
            // Fall through to config
        }
    }
    var focus = config["Focus:Current"] ?? "Building reliable full-stack applications with React and .NET 8.";
    var updated = config["Focus:Updated"] ?? DateTime.UtcNow.ToString("O");
    return new { focus, updated };
})
.WithName("GetFocus")
.WithTags("Content");

// Database info - shows when MongoDB (NoSQL) is connected (for portfolio "database" section)
app.MapGet("/api/db", () => Results.Ok(string.IsNullOrWhiteSpace(mongoUri)
    ? new { database = (string?)null, status = "none", message = "Set MONGODB_URI to use MongoDB (NoSQL)." }
    : new { database = "MongoDB", status = "connected", type = "NoSQL" }))
.WithName("GetDb")
.WithTags("Status");

// Test actual MongoDB connectivity (use this to see why live data might not show)
app.MapGet("/api/db/test", async () =>
{
    if (string.IsNullOrWhiteSpace(mongoUri))
        return Results.Json(new { ok = false, error = "MONGODB_URI is not set on the server (e.g. Railway). Add it in your project Variables." });
    try
    {
        var client = Mongo();
        if (client == null) return Results.Json(new { ok = false, error = "Mongo client not configured." });
        await client.ListDatabaseNamesAsync();
        return Results.Json(new { ok = true, message = "MongoDB cluster is reachable." });
    }
    catch (Exception ex)
    {
        return Results.Json(new { ok = false, error = ex.Message });
    }
})
.WithName("GetDbTest")
.WithTags("Status");

// Visit count - demonstrates write to NoSQL (increments a counter in MongoDB)
app.MapGet("/api/visit", async () =>
{
    if (string.IsNullOrWhiteSpace(mongoUri))
        return Results.Json(new { count = (long?)null, message = "Database not configured." });
    try
    {
        var client = Mongo();
        if (client == null) return Results.Json(new { count = (long?)null, message = "Database not configured." });
        var db = client.GetDatabase("portfolio");
        var collection = db.GetCollection<VisitCountDocument>("stats");
        var filter = Builders<VisitCountDocument>.Filter.Eq(d => d.Id, "site");
        var update = Builders<VisitCountDocument>.Update
            .Inc(d => d.Count, 1)
            .Set(d => d.LastUpdated, DateTime.UtcNow);
        var doc = await collection.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<VisitCountDocument, VisitCountDocument>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            });
        return Results.Json(new { count = doc.Count, database = "MongoDB" });
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = ex.Message }, statusCode: 500);
    }
})
.WithName("GetVisit")
.WithTags("Content");

// Highlights (achievements / key points) - stored in MongoDB for a dynamic, impressive portfolio section
app.MapGet("/api/highlights", async () =>
{
    if (string.IsNullOrWhiteSpace(mongoUri))
        return Results.Json(new { highlights = (object?)null, message = "Database not configured." });
    try
    {
        var client = Mongo();
        if (client == null) return Results.Json(new { highlights = (object?)null, message = "Database not configured." });
        var db = client.GetDatabase("portfolio");
        var collection = db.GetCollection<HighlightsDocument>("content");
        var doc = await collection.Find(d => d.Id == "highlights").FirstOrDefaultAsync();
        if (doc == null || doc.Items == null || doc.Items.Count == 0)
        {
            var defaultHighlights = new HighlightsDocument
            {
                Id = "highlights",
                Items = new List<HighlightItem>
                {
                    new() { Order = 1, Title = "Engineering leadership", Text = "Led engineering teams at PwC and CoinFlip; managed 3 teams and delivery across products." },
                    new() { Order = 2, Title = "Quality & scale", Text = "Drove 85%+ test coverage and CI/CD at CoinFlip; built reliable systems at JPMorgan." },
                    new() { Order = 3, Title = "Full-stack", Text = "React, TypeScript, .NET 8, MongoDB — this portfolio is a live example (API on Railway, DB in Atlas)." },
                    new() { Order = 4, Title = "Finance & compliance", Text = "Experience in fintech and regulated environments (PwC, CoinFlip, JPMorgan)." }
                }
            };
            await collection.InsertOneAsync(defaultHighlights);
            doc = defaultHighlights;
        }
        var list = doc.Items.OrderBy(x => x.Order).Select(x => new { x.Title, x.Text }).ToList();
        return Results.Json(new { highlights = list, source = "MongoDB" });
    }
    catch (Exception ex)
    {
        return Results.Json(new { highlights = (object?)null, error = ex.Message }, statusCode: 500);
    }
})
.WithName("GetHighlights")
.WithTags("Content");

// Lightweight "tech stack" endpoint - showcases API design
app.MapGet("/api/stack", () => new
{
    backend = new[] { "ASP.NET Core 8", "Minimal APIs", "C# 12" },
    database = string.IsNullOrWhiteSpace(mongoUri) ? null : "MongoDB (NoSQL)",
    deployment = new[] { "Railway", "Azure App Service / Functions", "Docker (optional)" }
})
.WithName("GetStack")
.WithTags("Status");

app.Run();
