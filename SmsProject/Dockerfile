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

# Expose port (Render sets PORT env, but we'll expose 80 by default)
EXPOSE 80

ENTRYPOINT ["dotnet", "SmsProject.dll"]
