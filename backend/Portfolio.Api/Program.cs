using MongoDB.Driver;
using Portfolio.Api.Models;

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
            var client = new MongoClient(mongoUri);
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

// Visit count - demonstrates write to NoSQL (increments a counter in MongoDB)
app.MapGet("/api/visit", async () =>
{
    if (string.IsNullOrWhiteSpace(mongoUri))
        return Results.Json(new { count = (long?)null, message = "Database not configured." });
    try
    {
        var client = new MongoClient(mongoUri);
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
