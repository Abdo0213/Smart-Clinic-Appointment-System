# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj and restore
COPY AdminService/Admin.Api/Admin.Api.csproj AdminService/Admin.Api/
COPY AdminService/Admin.Application/Admin.Application.csproj AdminService/Admin.Application/
COPY AdminService/Admin.Domain/Admin.Domain.csproj AdminService/Admin.Domain/
COPY AdminService/Admin.Infrastructure/Admin.Infrastructure.csproj AdminService/Admin.Infrastructure/
RUN dotnet restore AdminService/Admin.Api/Admin.Api.csproj

# Copy everything else and build
COPY AdminService/ AdminService/
RUN dotnet publish AdminService/Admin.Api/Admin.Api.csproj -c Release -o out

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .
COPY AdminService/Admin.Api/.env .env
EXPOSE 8088
ENTRYPOINT ["dotnet", "Admin.Api.dll"]
