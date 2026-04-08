# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /app

# Copy csproj and restore
COPY SmsProject/*.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY SmsProject ./
RUN dotnet publish -c Release -o out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build-env /app/out .

# Render sets the PORT environment variable. We should not hardcode it.
# ASP.NET Core will automatically pick up the PORT env var if we set it as below.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SmsProject.dll"]
