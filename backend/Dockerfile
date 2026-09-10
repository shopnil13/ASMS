FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY AssignmentManagement.sln ./
COPY src/Assignment.Api/Assignment.Api.csproj src/Assignment.Api/
COPY src/Assignment.Application/Assignment.Application.csproj src/Assignment.Application/
COPY src/Assignment.Domain/Assignment.Domain.csproj src/Assignment.Domain/
COPY src/Assignment.Infrastructure/Assignment.Infrastructure.csproj src/Assignment.Infrastructure/

RUN dotnet restore AssignmentManagement.sln

COPY . .
RUN dotnet publish src/Assignment.Api/Assignment.Api.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Assignment.Api.dll"]
