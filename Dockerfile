FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/ExtensibleChecklist/ExtensibleChecklist.csproj src/ExtensibleChecklist/
COPY shared/matha-ui/src/MathaUI/MathaUI.csproj shared/matha-ui/src/MathaUI/
RUN dotnet restore src/ExtensibleChecklist/ExtensibleChecklist.csproj
COPY src/ExtensibleChecklist/ src/ExtensibleChecklist/
COPY shared/matha-ui/src/MathaUI/ shared/matha-ui/src/MathaUI/
WORKDIR /src/src/ExtensibleChecklist
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
RUN mkdir -p /app/data && chown $APP_UID /app/data
USER $APP_UID
ENTRYPOINT ["dotnet", "ExtensibleChecklist.dll"]
