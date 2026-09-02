# Extensible Checklist

A checklist app with reusable templates, built with ASP.NET Core, Entity Framework Core (SQLite), and Razor Pages.

## Features

- **Template System**: Create reusable checklist templates
- **Merge Templates**: Create checklists from multiple templates, keeping every item (duplicates preserved)
- **Share Checklists**: Share a checklist with any other user in the system; both can edit it, only the owner can delete it
- **Interactive Editing**: Inline text editing, reordering, completion tracking
- **Grouped Items**: Items grouped by source template, collapsible
- **Hide Completed**: Toggle visibility of completed items
- **Print-Optimized**: Clean print layout
- **Dark/Light Mode**: Respects system preference
- **Export**: Export templates as Markdown
- **SSO Authentication**: OpenID Connect via MathAuth

## Sharing

Checklists (not templates) can be shared with other users:

- Open a checklist you own and press **Share** to pick from every other user in the system.
- Everyone the checklist is shared with can edit it — items, groups, name, and view options — and it
  shows up under **Shared With You** on their dashboard.
- Only the owner can delete the checklist or change who it is shared with. Deleting it removes it for
  everyone. A user it was shared with can press **Leave** to drop their own access; the owner keeps
  the checklist.

Users become available in the share picker once they have signed in at least once (they are recorded
in the `Users` table on sign-in). Anyone who already owns a checklist or template is backfilled by
the `AddChecklistSharing` migration.

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
   dotnet watch run
   ```

3. Open http://localhost:3000 and log in with:
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

## Azure Deployment

The app deploys as a Docker container to Azure App Service via GitHub Actions (`.github/workflows/`).

### App Service Configuration

Set these in **Azure Portal > App Service > Configuration > Application settings**:

| Setting | Value | Description |
|---|---|---|
| `ConnectionStrings__Default` | `Data Source=/app/data/checklist.db` | SQLite path (mount Azure Files at `/app/data`) |
| `OIDC_ISSUER` | `https://your-mathauth.example.com/` | MathAuth public URL (what the browser sees) |
| `OIDC_ISSUER_INTERNAL` | Same as `OIDC_ISSUER`, or internal URL | Server-to-server URL (if different from public) |
| `OIDC_CLIENT_ID` | Your client ID | Registered in MathAuth |
| `OIDC_CLIENT_SECRET` | Your client secret | Registered in MathAuth |

Register the app in MathAuth with:
- **Redirect URI**: `https://your-app.azurewebsites.net/signin-oidc`
- **Post-logout URI**: `https://your-app.azurewebsites.net`

### SQLite Persistence

Mount an **Azure Files** share at `/app/data` so the database survives container restarts.

## Project Structure

```
ExtensibleChecklist.sln
Dockerfile
docker-compose.yml
auth-config/oidc-clients.json
src/ExtensibleChecklist/
├── Program.cs                  # App config, auth, middleware, API endpoints
├── Auth/                       # Claims helpers (username, display name)
├── Data/AppDbContext.cs         # EF Core context
├── Data/ChecklistAccess.cs      # Owner/shared-user access rules
├── Models/                     # Template, Checklist, ChecklistShare, AppUser entities
├── Services/UserDirectory.cs    # Users available to share with
├── Migrations/                 # EF Core migrations
├── Pages/
│   ├── _Layout.cshtml          # Shared layout with nav
│   ├── Index.cshtml            # Dashboard (owned + shared with you)
│   ├── Shared/                 # Razor partials
│   ├── Templates/              # Template CRUD
│   └── Checklists/             # Create + interactive detail with share panel
├── wwwroot/css/site.css        # Dark/light theme
├── appsettings.json
└── appsettings.Development.json
```
