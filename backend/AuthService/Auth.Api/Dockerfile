# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY AuthService/Auth.Api/Auth.Api.csproj AuthService/Auth.Api/
COPY AuthService/Auth.Application/Auth.Application.csproj AuthService/Auth.Application/
COPY AuthService/Auth.Domain/Auth.Domain.csproj AuthService/Auth.Domain/
COPY AuthService/Auth.Infrastructure/Auth.Infrastructure.csproj AuthService/Auth.Infrastructure/
RUN dotnet restore AuthService/Auth.Api/Auth.Api.csproj

# Copy everything else and build
COPY AuthService/ AuthService/
RUN dotnet publish AuthService/Auth.Api/Auth.Api.csproj -c Release -o out

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .
COPY AuthService/Auth.Api/.env .env
EXPOSE 5005
ENTRYPOINT ["dotnet", "Auth.Api.dll"]