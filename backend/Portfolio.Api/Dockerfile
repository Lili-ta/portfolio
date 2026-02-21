# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Run on Ubuntu 24 (noble) for up-to-date OpenSSL/TLS — fixes MongoDB Atlas SSL handshake in containers
FROM mcr.microsoft.com/dotnet/aspnet:8.0-noble AS runtime
WORKDIR /app

# Ensure CA certs are current for TLS to MongoDB Atlas
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && update-ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish ./
# PORT is set by Railway at runtime; Program.cs uses it for UseUrls
ENTRYPOINT ["dotnet", "Portfolio.Api.dll"]
