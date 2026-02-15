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

// "Current focus" - content driven by the backend (editable in appsettings)
app.MapGet("/api/focus", (IConfiguration config) =>
{
    var focus = config["Focus:Current"] ?? "Building reliable full-stack applications with React and .NET 8.";
    var updated = config["Focus:Updated"] ?? DateTime.UtcNow.ToString("O");
    return new { focus, updated };
})
.WithName("GetFocus")
.WithTags("Content");

// Lightweight "tech stack" endpoint - showcases API design
app.MapGet("/api/stack", () => new
{
    backend = new[] { "ASP.NET Core 8", "Minimal APIs", "C# 12" },
    deployment = new[] { "Azure App Service / Functions", "Docker (optional)" }
})
.WithName("GetStack")
.WithTags("Status");

app.Run();
