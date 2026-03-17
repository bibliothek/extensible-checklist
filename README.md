# Extensible Checklist

A powerful checklist management application with template-based workflow. Create reusable checklist templates, instantiate them with a single click, and track progress with an intuitive interface.

## Features

- **Template System**: Create reusable checklist templates with grouped items
- **Quick Instantiation**: Generate working checklists from templates instantly
- **Bulk Editing**: Check/uncheck all items in a group with one click
- **Print-Optimized**: Ultra-compact print layout for physical checklists
- **Hide Completed**: Toggle visibility of completed items to focus on remaining work
- **Inline Editing**: Edit checklist and item names directly in the interface
- **Dark Mode**: Modern dark UI throughout the application
- **Persistent State**: SQLite database with file-based storage
- **SSO Authentication**: OpenID Connect

## Tech Stack

- **Next.js 16** (App Router) with React 19
- **TypeScript** for type safety
- **Prisma** ORM with SQLite database
- **NextAuth.js** with OpenID Connect
- **Tailwind CSS v4** for styling
- **Docker** for containerized deployment

## Authentication

Authentication is handled externally via **OpenID Connect**.

The Docker Compose setup includes a local MathAuth instance. For production, point `OIDC_ISSUER` at your OpenId Connect deployment.

## Local Development

### Prerequisites

- Node.js 20 or higher
- A running OpenId connect instance (or use Docker Compose, see below)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd extensible-checklist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `DATABASE_URL`: SQLite file path (default: `file:./prisma/dev.db`)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: `http://localhost:3000` for local development
   - `OIDC_ISSUER`: URL of your OpenId Connect instance
   - `OIDC_CLIENT_ID`: Client ID registered in OpenId Connect
   - `OIDC_CLIENT_SECRET`: Corresponding client secret

   Register your app in OpenId Connect with:
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/mathauth`
   - **Post-logout URI**: `http://localhost:3000`

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Run database migrations
npm run db:push

# Generate Prisma client (after schema changes)
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Build for production
npm run build

# Start production server
npm start
```

## Docker Development

Run the full stack (app + auth) with Docker Compose.

### Prerequisites

- Docker Desktop
- Docker Compose

### Usage

1. **Start the application**
   ```bash
   docker compose up --build
   ```

   This will:
   - Pull the `mthaller/mathauth:latest` image from Docker Hub
   - Build the Next.js application Docker image
   - Start MathAuth on port 5001 with a pre-configured OIDC client
   - Run SQLite migrations and start the app on port 3000
   - App database persists in `./data/dev.db`, auth database in a Docker volume

2. **Access the application**
   - App: [http://localhost:3000](http://localhost:3000)
   - MathAuth: [http://localhost:5001](http://localhost:5001)

3. **Default MathAuth admin credentials**
   - Username: `admin`
   - Password: `Admin!123`

4. **View logs**
   ```bash
   docker compose logs -f
   ```

5. **Stop the application**
   ```bash
   docker compose down
   ```

6. **Reset everything** (databases + auth volume)
   ```bash
   docker compose down -v
   rm -rf ./data
   ```

### OIDC Client Configuration

The file `auth-config/oidc-clients.json` registers the checklist app with the local MathAuth instance:

| Setting | Value |
|---------|-------|
| Client ID | `extensible-checklist` |
| Client Secret | `extensible-checklist-secret` |
| Redirect URI | `http://localhost:3000/api/auth/callback/mathauth` |
| Post-logout URI | `http://localhost:3000` |

To add additional OIDC clients, edit `auth-config/oidc-clients.json` and restart MathAuth.

### Database Persistence

- **App database**: `./data/dev.db` on the host (bind mount)
- **Auth database**: `mathauth-data` Docker volume

## Production Deployment (Azure)

Deploy the application to Azure App Service with automated CI/CD via GitHub Actions.

### Prerequisites

- Azure subscription
- Azure CLI installed: `az --version`
- GitHub repository with admin access
- A MathAuth instance accessible from both the server and users' browsers

### Azure Setup

#### 1. Create Azure Container Registry (ACR)

```bash
# Set variables
RESOURCE_GROUP="extensible-checklist-rg"
LOCATION="eastus"
REGISTRY_NAME="extensiblechecklist"  # Must be globally unique, lowercase, alphanumeric only

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry (Basic tier)
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Basic \
  --admin-enabled true
```

#### 2. Get ACR Credentials

```bash
# Get login server (e.g., extensiblechecklist.azurecr.io)
az acr show --name $REGISTRY_NAME --query loginServer --output tsv

# Get admin credentials
az acr credential show --name $REGISTRY_NAME
```

Save these values - you'll need them for GitHub Secrets:
- **Login Server**: `<registry-name>.azurecr.io`
- **Username**: From `az acr credential show`
- **Password**: From `az acr credential show` (password or password2)

#### 3. Create Azure App Service

```bash
# Set variables
APP_NAME="extensible-checklist"  # Must be globally unique
PLAN_NAME="extensible-checklist-plan"

# Create App Service Plan (Linux, B1 tier)
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Create Web App (container-based)
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN_NAME \
  --name $APP_NAME \
  --deployment-container-image-name $REGISTRY_NAME.azurecr.io/extensible-checklist:latest

# Configure ACR credentials for the Web App
az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name $REGISTRY_NAME.azurecr.io/extensible-checklist:latest \
  --docker-registry-server-url https://$REGISTRY_NAME.azurecr.io \
  --docker-registry-server-user <ACR_USERNAME> \
  --docker-registry-server-password <ACR_PASSWORD>
```

#### 4. Configure App Service Environment Variables

Set these in **Azure Portal** > **App Service** > **Configuration** > **Application settings**:

| Setting | Value | Description |
|---------|-------|-------------|
| `DATABASE_URL` | `file:/app/data/dev.db` | SQLite database file path (mounted via Azure Files) |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | Secret for NextAuth.js session encryption |
| `NEXTAUTH_URL` | `https://<app-name>.azurewebsites.net` | Public URL of your application |
| `AUTH_TRUST_HOST` | `true` | Required for Auth.js v5 behind reverse proxy |
| `WEBSITES_PORT` | `3000` | Port the container listens on |
| `OIDC_ISSUER` | `https://identity.com` | MathAuth instance URL |
| `OIDC_CLIENT_ID` | Your client ID | Registered in MathAuth |
| `OIDC_CLIENT_SECRET` | Your client secret | Registered in MathAuth |

**SQLite Persistence:**

SQLite requires persistent storage to retain data across container restarts. This is achieved using **Azure Files** storage mounted to the container at `/app/data`.

For complete Azure Files setup instructions (storage account, file share, mount configuration), see **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

Click **Save** after adding settings. The app will restart automatically.

#### 5. Enable Health Check

Configure in **Azure Portal** > **App Service** > **Monitoring** > **Health check**:

- **Path**: `/api/health`
- **Interval**: 2 minutes
- Click **Save**

Azure will automatically restart the container if health checks fail.

#### 6. Download Publish Profile

In **Azure Portal** > **App Service** > **Overview**:
- Click **Get publish profile** (downloads XML file)
- Save the entire XML content - you'll need it for GitHub Secrets

#### 7. Configure GitHub Secrets

In your **GitHub repository** > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:

Add these secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `REGISTRY_LOGIN_SERVER` | `<registry-name>.azurecr.io` | From step 2 or `az acr show --query loginServer` |
| `REGISTRY_USERNAME` | ACR admin username | From step 2 or `az acr credential show` |
| `REGISTRY_PASSWORD` | ACR admin password | From step 2 or `az acr credential show` |
| `AZURE_WEBAPP_NAME` | `extensible-checklist` (your app name) | From step 3 |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Full XML content from publish profile | From step 6 |

### Deployment Process

Once Azure resources and GitHub Secrets are configured:

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **Monitor deployment**
   - Go to your GitHub repository
   - Click **Actions** tab
   - Watch "Azure Production Deployment" workflow progress

3. **Verify deployment**
   - Check workflow completes successfully (green checkmark)
   - Visit `https://<app-name>.azurewebsites.net/api/health`
   - Should return: `{"status":"healthy","database":"connected"}`
   - Visit `https://<app-name>.azurewebsites.net`
   - Application should load and function normally

### Deployment Flow

The GitHub Actions workflow (`.github/workflows/azure-deploy.yml`) automatically:

1. **Builds** Docker image with multi-stage optimization
2. **Tags** image with commit SHA and `latest`
3. **Pushes** to Azure Container Registry
4. **Deploys** to Azure App Service
5. **Verifies** health endpoint responds successfully

Database migrations run automatically when the container starts (via `scripts/migrate-and-start.sh`).

### Troubleshooting

**Deployment fails with authentication error:**
- Verify GitHub Secrets are set correctly
- Check ACR admin user is enabled: `az acr update --name $REGISTRY_NAME --admin-enabled true`

**Health check fails:**
- Check App Service logs: Azure Portal > App Service > Monitoring > Log stream
- Verify `DATABASE_URL` is set correctly in App Service Configuration
- Ensure database allows connections from Azure App Service IP
- Check container startup time - may need to increase health check start period

**Application won't load:**
- Verify `WEBSITES_PORT=3000` is set in App Service Configuration
- Check that `NEXTAUTH_URL` matches your App Service URL
- Verify `AUTH_TRUST_HOST=true` is set for Auth.js v5
- Review Application Insights or Log Analytics for errors

**OIDC login fails:**
- Verify `OIDC_ISSUER` is reachable from the App Service container
- Check the redirect URI registered in MathAuth matches `https://<app-url>/api/auth/callback/mathauth`
- Ensure `OIDC_CLIENT_ID` and `OIDC_CLIENT_SECRET` match MathAuth configuration

## Database Migrations

### Development

```bash
# Apply schema changes (development)
npm run db:push

# Create a new migration
npx prisma migrate dev --name migration-name

# View migration status
npx prisma migrate status
```

### Production

Migrations run **automatically** on container startup via `scripts/migrate-and-start.sh`:

1. Container starts
2. `prisma migrate deploy` runs (applies pending migrations)
3. Application starts

This ensures the database schema is always up-to-date with the deployed code.

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # API endpoints
│   │   ├── auth/           # NextAuth.js OIDC handler
│   │   └── health/         # Health check endpoint
│   ├── checklists/         # Checklist management pages
│   └── templates/          # Template management pages
├── auth-config/            # OIDC client config for local MathAuth
├── components/             # React components
├── lib/                    # Utility functions and shared code
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Prisma schema definition
│   └── migrations/         # Migration history
├── scripts/                # Deployment and utility scripts
├── .github/workflows/      # GitHub Actions CI/CD
├── docker-compose.yml      # Local Docker development (app + MathAuth)
├── Dockerfile              # Production container image
└── README.md               # This file
```

## License

MIT
