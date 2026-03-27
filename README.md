# Extensible Checklist

A checklist app with reusable templates, built with ASP.NET Core, Entity Framework Core (SQLite), and Razor Pages.

## Features

- **Template System**: Create reusable checklist templates
- **Merge & Deduplicate**: Create checklists from multiple templates with deduplication
- **Interactive Editing**: Inline text editing, reordering, completion tracking
- **Bulk Edit**: Markdown-style bulk editing of checklist items
- **Grouped Items**: Items grouped by source template, collapsible
- **Hide Completed**: Toggle visibility of completed items
- **Print-Optimized**: Clean print layout
- **Dark/Light Mode**: Respects system preference
- **Export**: Export templates as Markdown
- **SSO Authentication**: OpenID Connect via MathAuth

## Tech Stack

- **ASP.NET Core 10** with Razor Pages
- **Entity Framework Core** with SQLite
- **OpenID Connect** authentication
- **Vanilla JavaScript** for interactive features
- **Docker** for containerized deployment

## Local Development

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://docs.docker.com/get-docker/) (for the auth server)

### Quick Start

1. Start the MathAuth identity server:

   ```bash
   docker compose up mathauth -d
   ```

2. Run the app:

   ```bash
   cd src/ExtensibleChecklist
   dotnet run
   ```

3. Open the URL printed by `dotnet run` (typically http://localhost:5174) and log in with:
   - Username: `admin`
   - Password: `Admin!123`

The SQLite database is created automatically on first run. Migrations are applied at startup.

### Docker Compose (full stack)

Run everything in containers:

```bash
docker compose up --build
```

- App: http://localhost:3000
- MathAuth: http://localhost:5001

### Configuration

Dev settings are in `src/ExtensibleChecklist/appsettings.Development.json`:

| Setting | Default | Description |
|---|---|---|
| `OIDC_ISSUER` | `http://localhost:5001/` | MathAuth public URL |
| `OIDC_CLIENT_ID` | `extensible-checklist` | OIDC client ID |
| `OIDC_CLIENT_SECRET` | `extensible-checklist-secret` | OIDC client secret |
| `ConnectionStrings:Default` | `Data Source=../../data/checklist.db` | SQLite path |

### EF Core Migrations

```bash
cd src/ExtensibleChecklist
dotnet ef migrations add <MigrationName>
```

Migrations are applied automatically on startup.

### OIDC Client Registration

The file `auth-config/oidc-clients.json` registers the app with the local MathAuth instance:

| Setting | Value |
|---|---|
| Client ID | `extensible-checklist` |
| Redirect URI | `http://localhost:3000/signin-oidc` |
| Post-logout URI | `http://localhost:3000` |

## Project Structure

```
ExtensibleChecklist.sln
Dockerfile
docker-compose.yml
auth-config/oidc-clients.json
src/ExtensibleChecklist/
├── Program.cs                  # App config, auth, middleware, API endpoints
├── Data/AppDbContext.cs         # EF Core context
├── Models/                     # Template, Checklist entities
├── Migrations/                 # EF Core migrations
├── Pages/
│   ├── _Layout.cshtml          # Shared layout with nav
│   ├── Index.cshtml            # Dashboard
│   ├── Templates/              # Template CRUD
│   └── Checklists/             # Create + interactive detail
├── wwwroot/css/site.css        # Dark/light theme
├── appsettings.json
└── appsettings.Development.json
```
