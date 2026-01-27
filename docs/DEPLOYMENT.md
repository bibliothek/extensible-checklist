# Azure Deployment Guide

## Overview

The Extensible Checklist application runs on Azure App Service as a containerized Next.js application with SQLite database persistence.

**Architecture:**
- **Application:** Next.js 15 in standalone Docker container
- **Database:** SQLite file stored in Azure Files
- **Storage:** Azure Files share mounted at `/app/data`
- **Registry:** Azure Container Registry (ACR)
- **Compute:** Azure App Service (Linux Container)

**Key benefits:**
- No separate database service required (simplified architecture)
- Database persists across container deployments via Azure Files
- Automatic migrations on container startup
- Single-container deployment

## Prerequisites

Before starting deployment, ensure you have:

1. **Azure subscription** with ability to create resources
2. **Azure CLI installed** on your local machine ([Install guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
3. **GitHub repository** with your application code
4. **Docker installed locally** for testing (optional but recommended)
5. **Basic knowledge** of Azure Portal and command line

## Step-by-Step Deployment

### 1. Create Azure Resources

All commands below use Azure CLI. You can also create these resources via Azure Portal if preferred.

#### 1.1 Log in to Azure

```bash
az login
```

This opens a browser window for authentication. Follow the prompts to log in.

#### 1.2 Create Resource Group

```bash
az group create \
  --name checklist-rg \
  --location eastus
```

**Note:** Replace `eastus` with your preferred Azure region (e.g., `westus2`, `westeurope`).

#### 1.3 Create Azure Container Registry

```bash
az acr create \
  --resource-group checklist-rg \
  --name checklistacrXXXX \
  --sku Basic
```

**Important:** Replace `XXXX` with a unique suffix (e.g., your initials + random numbers). ACR names must be globally unique and contain only alphanumeric characters.

Enable admin user for GitHub Actions authentication:

```bash
az acr update \
  --name checklistacrXXXX \
  --admin-enabled true
```

Log in to verify:

```bash
az acr login --name checklistacrXXXX
```

#### 1.4 Create Azure Storage Account

```bash
az storage account create \
  --name checkliststorageXXXX \
  --resource-group checklist-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2
```

**Important:** Replace `XXXX` with a unique suffix. Storage account names must be globally unique, lowercase, and 3-24 characters.

**SKU options:**
- `Standard_LRS`: Locally-redundant storage (cheapest, recommended for dev/test)
- `Standard_GRS`: Geo-redundant storage (higher availability, production)

#### 1.5 Create Azure File Share

```bash
az storage share create \
  --account-name checkliststorageXXXX \
  --name checklist-data \
  --quota 5
```

**Quota:** 5 GiB is the minimum. Increase if you expect large database files.

#### 1.6 Create App Service Plan

```bash
az appservice plan create \
  --name checklist-plan \
  --resource-group checklist-rg \
  --is-linux \
  --sku B1
```

**SKU options:**
- `B1`: Basic tier, $13/month, suitable for development and small production
- `S1`: Standard tier, $70/month, better performance and features
- `P1V2`: Premium tier, $85/month, production workloads

#### 1.7 Create Web App

```bash
az webapp create \
  --resource-group checklist-rg \
  --plan checklist-plan \
  --name checklist-app-XXXX \
  --deployment-container-image-name checklistacrXXXX.azurecr.io/extensible-checklist:latest
```

**Important:** Replace `XXXX` with a unique suffix. Web app names must be globally unique.

Configure the web app to pull from your private ACR:

```bash
az webapp config container set \
  --name checklist-app-XXXX \
  --resource-group checklist-rg \
  --docker-custom-image-name checklistacrXXXX.azurecr.io/extensible-checklist:latest \
  --docker-registry-server-url https://checklistacrXXXX.azurecr.io
```

### 2. Configure Azure Files Volume Mount

Azure Files provides persistent storage for the SQLite database file across container restarts and deployments.

#### 2.1 Get Storage Account Key

```bash
STORAGE_KEY=$(az storage account keys list \
  --account-name checkliststorageXXXX \
  --resource-group checklist-rg \
  --query "[0].value" -o tsv)

echo $STORAGE_KEY
```

**Security note:** Keep this key secure. It provides full access to your storage account.

#### 2.2 Add Volume Mount to App Service

```bash
az webapp config storage-account add \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --custom-id database \
  --storage-type AzureFiles \
  --account-name checkliststorageXXXX \
  --share-name checklist-data \
  --access-key "$STORAGE_KEY" \
  --mount-path /app/data
```

**Critical:** The mount path must be `/app/data` to match the Dockerfile and DATABASE_URL configuration.

Verify the mount was added:

```bash
az webapp config storage-account list \
  --resource-group checklist-rg \
  --name checklist-app-XXXX
```

You should see output showing the `database` mount at `/app/data`.

### 3. Configure Environment Variables

The application requires specific environment variables to function correctly.

#### 3.1 Generate NextAuth Secret

```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
```

**Important:** Save this value securely. If lost, all existing user sessions will be invalidated.

#### 3.2 Set Environment Variables in App Service

```bash
az webapp config appsettings set \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --settings \
    DATABASE_URL="file:/app/data/dev.db" \
    NEXTAUTH_URL="https://checklist-app-XXXX.azurewebsites.net" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    WEBSITES_PORT=3000
```

**Replace:** `checklist-app-XXXX` with your actual App Service name in the `NEXTAUTH_URL`.

**Environment variables explained:**
- `DATABASE_URL`: Path to SQLite database file in mounted Azure Files share
- `NEXTAUTH_URL`: Public URL of your application (required for OAuth callbacks)
- `NEXTAUTH_SECRET`: Secret key for encrypting session tokens
- `WEBSITES_PORT`: Port the container listens on (Azure uses this for health checks)

Verify settings:

```bash
az webapp config appsettings list \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --query "[?name=='DATABASE_URL' || name=='NEXTAUTH_URL']"
```

### 4. Configure GitHub Secrets

GitHub Actions needs credentials to push Docker images to ACR and deploy to App Service.

#### 4.1 Get ACR Credentials

```bash
# Get ACR login server
az acr show --name checklistacrXXXX --query loginServer -o tsv

# Get ACR username
az acr credential show --name checklistacrXXXX --query username -o tsv

# Get ACR password
az acr credential show --name checklistacrXXXX --query passwords[0].value -o tsv
```

#### 4.2 Get App Service Publish Profile

```bash
az webapp deployment list-publishing-profiles \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --xml
```

Copy the entire XML output (this is a multi-line secret).

#### 4.3 Add Secrets to GitHub Repository

Navigate to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each of the following:

| Secret Name | Value | Source |
|------------|-------|--------|
| `REGISTRY_LOGIN_SERVER` | `checklistacrXXXX.azurecr.io` | Output from ACR login server command |
| `REGISTRY_USERNAME` | `checklistacrXXXX` | Output from ACR credential username command |
| `REGISTRY_PASSWORD` | `<password>` | Output from ACR credential password command |
| `AZURE_WEBAPP_NAME` | `checklist-app-XXXX` | Your App Service name |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | `<xml content>` | Output from publish profile command |

**Security:** These secrets are encrypted by GitHub and only accessible to your workflows.

### 5. Deploy Application

With all Azure resources and GitHub secrets configured, you're ready to deploy.

#### 5.1 Trigger Deployment

**Option A: Automatic deployment (recommended)**

Push to your main branch:

```bash
git push origin main
```

GitHub Actions will automatically:
1. Build Docker image
2. Push to Azure Container Registry
3. Deploy to App Service
4. Run health check verification

**Option B: Manual deployment**

Trigger the workflow manually:

1. Go to GitHub repository → **Actions** tab
2. Select **Azure Production Deployment** workflow
3. Click **Run workflow** → **Run workflow**

#### 5.2 Monitor Deployment

Watch the deployment progress:

1. GitHub → **Actions** tab → Click on the running workflow
2. Monitor build and deploy steps
3. Wait for health check to pass (takes ~2-3 minutes total)

**Expected workflow duration:** 3-5 minutes (build takes longest)

#### 5.3 Verify Deployment Success

Check the GitHub Actions workflow completed with green checkmark. The health check step should show:

```
✓ Health check passed (HTTP 200)
Response: {"status":"healthy","database":"connected","timestamp":"..."}
```

### 6. Verify Application

After successful deployment, verify the application is running correctly.

#### 6.1 Check Health Endpoint

```bash
curl https://checklist-app-XXXX.azurewebsites.net/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-27T16:30:00.000Z"
}
```

#### 6.2 Access Application

Open in browser:

```
https://checklist-app-XXXX.azurewebsites.net
```

You should see the Extensible Checklist application homepage.

#### 6.3 Test User Registration

1. Click **Sign Up** (or navigate to `/auth/signup`)
2. Create a test account with email and password
3. Verify successful account creation and login
4. Create a test checklist to verify database writes

#### 6.4 Verify Database Persistence

Test that the SQLite database persists across container restarts:

1. Create test data (user account, checklist)
2. Restart the App Service:
   ```bash
   az webapp restart --name checklist-app-XXXX --resource-group checklist-rg
   ```
3. Wait 30 seconds for container restart
4. Log in again with test account
5. Verify your checklist still exists

**If data persists:** Database is correctly configured with Azure Files ✓

**If data is lost:** Check volume mount configuration (see Troubleshooting below)

## Architecture Details

### Database Persistence

**How it works:**

1. Azure App Service starts your Docker container
2. Azure Files share (`checklist-data`) is mounted to `/app/data` inside container
3. Container runs `migrate-and-start.sh` script:
   - Executes Prisma migrations (`DATABASE_URL=file:/app/data/dev.db`)
   - If database doesn't exist, migrations create it
   - If database exists, only pending migrations are applied
4. Next.js server starts and connects to SQLite at `/app/data/dev.db`

**Storage location:**
- **In container:** `/app/data/dev.db`
- **In Azure Files:** `checklist-data` share → `dev.db` file
- **Accessible via:** Azure Portal → Storage Account → File shares → checklist-data

### Container Startup Flow

```
1. Azure pulls image from ACR
   ↓
2. Azure mounts File Share to /app/data
   ↓
3. Container starts, runs migrate-and-start.sh
   ↓
4. Prisma migrations execute (create/update schema)
   ↓
5. Next.js server starts on port 3000
   ↓
6. Health check endpoint becomes available
   ↓
7. Azure marks container as "Running"
```

**Typical startup time:** 20-30 seconds

### Cost Estimate

Based on East US region pricing (as of January 2025):

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| App Service | B1 (Basic) | $13.14 |
| Container Registry | Basic | $5.00 |
| Storage Account | LRS (5GB) | $0.25 |
| Data Transfer | First 100GB free | $0.00 |
| **Total** | | **~$18.39/month** |

**Cost optimization tips:**
- Use B1 tier for development/testing (scale up to S1/P1V2 for production)
- Delete resources when not in use: `az group delete --name checklist-rg`
- Monitor usage in Azure Portal → Cost Management

**Note:** Costs may vary by region and change over time. Check [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/) for current rates.

## Troubleshooting

### Database file not persisting

**Symptoms:** Data is lost after container restart

**Checks:**

1. Verify volume mount exists:
   ```bash
   az webapp config storage-account list \
     --resource-group checklist-rg \
     --name checklist-app-XXXX
   ```

   Should show mount at `/app/data` with type `AzureFiles`

2. Check mount path in configuration:
   ```bash
   az webapp config storage-account list \
     --resource-group checklist-rg \
     --name checklist-app-XXXX \
     --query "[].{name:name, mountPath:mountPath}"
   ```

   Should return: `mountPath: "/app/data"`

3. Verify storage account key is correct:
   ```bash
   # Get current key
   az storage account keys list \
     --account-name checkliststorageXXXX \
     --resource-group checklist-rg \
     --query "[0].value" -o tsv
   ```

   If key changed, update the mount:
   ```bash
   az webapp config storage-account delete \
     --resource-group checklist-rg \
     --name checklist-app-XXXX \
     --custom-id database

   # Re-add with new key (see Section 2.2)
   ```

4. Check database file exists in Azure Files:
   - Azure Portal → Storage Account → File shares → `checklist-data`
   - Should contain `dev.db` file (size > 0 bytes)

**Resolution:** If file doesn't exist, the mount isn't working. Verify mount path is exactly `/app/data` and App Service has restarted since mount was added.

### Migrations failing on startup

**Symptoms:** Container logs show "Migration failed" or "Prisma error"

**Checks:**

1. Check DATABASE_URL format:
   ```bash
   az webapp config appsettings list \
     --resource-group checklist-rg \
     --name checklist-app-XXXX \
     --query "[?name=='DATABASE_URL'].value" -o tsv
   ```

   Must be exactly: `file:/app/data/dev.db`

   **NOT:** `file:./data/dev.db` or `file://app/data/dev.db` (double slash)

2. Check App Service logs for detailed error:
   ```bash
   az webapp log tail \
     --resource-group checklist-rg \
     --name checklist-app-XXXX
   ```

   Look for Prisma error messages

3. Verify /app/data is writable:
   - Container runs as user `nextjs` (UID 1001)
   - Azure Files should grant write permissions automatically
   - Check logs for "EACCES: permission denied" errors

4. Test migrations locally:
   ```bash
   docker-compose up
   # Should see "All migrations have been successfully applied"
   ```

**Resolution:** Most migration issues are due to incorrect DATABASE_URL format. Ensure it matches exactly: `file:/app/data/dev.db`

### Container not starting

**Symptoms:** App Service shows "Container didn't respond" or infinite restart loop

**Checks:**

1. Verify environment variables are set:
   ```bash
   az webapp config appsettings list \
     --resource-group checklist-rg \
     --name checklist-app-XXXX
   ```

   Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `WEBSITES_PORT`

2. Check container logs:
   ```bash
   az webapp log tail \
     --resource-group checklist-rg \
     --name checklist-app-XXXX
   ```

   Look for startup errors or crash messages

3. Verify ACR credentials:
   ```bash
   az webapp config container show \
     --resource-group checklist-rg \
     --name checklist-app-XXXX
   ```

   Should show correct ACR image name

4. Test image locally:
   ```bash
   docker pull checklistacrXXXX.azurecr.io/extensible-checklist:latest
   docker run -p 3000:3000 \
     -e DATABASE_URL="file:/tmp/dev.db" \
     -e NEXTAUTH_URL="http://localhost:3000" \
     -e NEXTAUTH_SECRET="test-secret-key" \
     checklistacrXXXX.azurecr.io/extensible-checklist:latest
   ```

**Resolution:** Most startup issues are missing/incorrect environment variables. Verify all required variables are set with correct values.

### Health check failing in GitHub Actions

**Symptoms:** Workflow fails at "Verify deployment health" step

**Checks:**

1. Check if deployment actually completed:
   ```bash
   az webapp show \
     --resource-group checklist-rg \
     --name checklist-app-XXXX \
     --query state -o tsv
   ```

   Should return: `Running`

2. Manually test health endpoint:
   ```bash
   curl -v https://checklist-app-XXXX.azurewebsites.net/api/health
   ```

   Should return HTTP 200 with JSON response

3. Check if container is actually running:
   ```bash
   az webapp log tail \
     --resource-group checklist-rg \
     --name checklist-app-XXXX
   ```

   Should show "Server listening on port 3000"

4. Verify WEBSITES_PORT is set to 3000:
   ```bash
   az webapp config appsettings list \
     --resource-group checklist-rg \
     --name checklist-app-XXXX \
     --query "[?name=='WEBSITES_PORT'].value" -o tsv
   ```

**Resolution:** Health check waits 30 seconds then retries 6 times. If failing consistently, container isn't starting properly. Check logs for startup errors.

### "Error: Module not found" in container logs

**Symptoms:** Container crashes with missing module errors

**Issue:** This was fixed in Phase 9 Plan 01 by copying full `node_modules` to container

**Verification:**

1. Check Dockerfile contains:
   ```dockerfile
   COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
   ```

2. Rebuild and redeploy:
   ```bash
   git push origin main
   ```

**Resolution:** Ensure you're using the updated Dockerfile from Phase 9. The standalone Next.js build requires full node_modules for Prisma CLI.

## Maintenance

### View Application Logs

**Real-time log streaming:**

```bash
az webapp log tail \
  --resource-group checklist-rg \
  --name checklist-app-XXXX
```

Press `Ctrl+C` to stop streaming.

**Download log files:**

```bash
az webapp log download \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --log-file logs.zip
```

**View logs in Azure Portal:**

1. Navigate to App Service → Monitoring → Log stream
2. Select "Application logs" or "Web server logs"

### Restart App Service

**When to restart:**
- After changing environment variables
- After updating volume mounts
- If container is unresponsive

**Command:**

```bash
az webapp restart \
  --resource-group checklist-rg \
  --name checklist-app-XXXX
```

**Note:** Restart takes 20-30 seconds. Application will be unavailable briefly.

### Backup Database

Azure Files makes it easy to backup your SQLite database file.

**Download database to local machine:**

```bash
# Get storage account key
STORAGE_KEY=$(az storage account keys list \
  --account-name checkliststorageXXXX \
  --resource-group checklist-rg \
  --query "[0].value" -o tsv)

# Download database file
az storage file download \
  --account-name checkliststorageXXXX \
  --account-key "$STORAGE_KEY" \
  --share-name checklist-data \
  --path dev.db \
  --dest ./backup-dev-$(date +%Y%m%d).db
```

**Automated backup script:**

```bash
#!/bin/bash
# backup-database.sh

RESOURCE_GROUP="checklist-rg"
STORAGE_ACCOUNT="checkliststorageXXXX"
SHARE_NAME="checklist-data"
BACKUP_DIR="./backups"

mkdir -p "$BACKUP_DIR"

STORAGE_KEY=$(az storage account keys list \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query "[0].value" -o tsv)

BACKUP_FILE="$BACKUP_DIR/dev-$(date +%Y%m%d-%H%M%S).db"

az storage file download \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --share-name "$SHARE_NAME" \
  --path dev.db \
  --dest "$BACKUP_FILE"

echo "Database backed up to: $BACKUP_FILE"
```

**Restore database:**

```bash
az storage file upload \
  --account-name checkliststorageXXXX \
  --account-key "$STORAGE_KEY" \
  --share-name checklist-data \
  --source ./backup-dev-20260127.db \
  --path dev.db
```

**Important:** Restart App Service after restoring to reload the database.

### Update Environment Variables

**Add or modify settings:**

```bash
az webapp config appsettings set \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --settings KEY=VALUE
```

**Example: Update NEXTAUTH_SECRET:**

```bash
NEW_SECRET=$(openssl rand -base64 32)

az webapp config appsettings set \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --settings NEXTAUTH_SECRET="$NEW_SECRET"
```

**Note:** Changing NEXTAUTH_SECRET will invalidate all existing user sessions.

**Delete a setting:**

```bash
az webapp config appsettings delete \
  --resource-group checklist-rg \
  --name checklist-app-XXXX \
  --setting-names KEY_TO_DELETE
```

### Scale App Service

**Scale up (change tier):**

```bash
az appservice plan update \
  --resource-group checklist-rg \
  --name checklist-plan \
  --sku S1
```

**Scale out (add instances - Standard tier or higher):**

```bash
az appservice plan update \
  --resource-group checklist-rg \
  --name checklist-plan \
  --number-of-workers 2
```

**Note:** SQLite doesn't support multiple concurrent writers well. Avoid scaling out beyond 1 instance unless you migrate to PostgreSQL/MySQL.

### Monitor Resource Usage

**App Service metrics:**

```bash
az monitor metrics list \
  --resource "/subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/checklist-rg/providers/Microsoft.Web/sites/checklist-app-XXXX" \
  --metric "CpuPercentage" "MemoryPercentage" "HttpResponseTime" \
  --start-time $(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%S') \
  --end-time $(date -u '+%Y-%m-%dT%H:%M:%S')
```

**Storage usage:**

```bash
az storage share stats \
  --account-name checkliststorageXXXX \
  --name checklist-data
```

**View in Azure Portal:**

1. Navigate to App Service → Monitoring → Metrics
2. Select metrics: CPU Percentage, Memory Percentage, Response Time
3. Set time range and granularity

### Delete Resources

**Delete entire resource group (removes all resources):**

```bash
az group delete \
  --name checklist-rg \
  --yes \
  --no-wait
```

**Warning:** This permanently deletes the App Service, Container Registry, Storage Account, and all data. Ensure you have backups if needed.

**Delete individual resources:**

```bash
# Delete App Service only
az webapp delete \
  --resource-group checklist-rg \
  --name checklist-app-XXXX

# Delete Container Registry only
az acr delete \
  --resource-group checklist-rg \
  --name checklistacrXXXX

# Delete Storage Account only
az storage account delete \
  --resource-group checklist-rg \
  --name checkliststorageXXXX
```

## Additional Resources

- [Azure App Service documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Container Registry documentation](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Azure Files documentation](https://docs.microsoft.com/en-us/azure/storage/files/)
- [Next.js deployment documentation](https://nextjs.org/docs/deployment)
- [Prisma deployment documentation](https://www.prisma.io/docs/guides/deployment)

## Support

For issues specific to this deployment guide:
- Check the Troubleshooting section above
- Review GitHub Actions workflow logs
- Check Azure App Service logs

For Azure-specific issues:
- [Azure Support](https://azure.microsoft.com/en-us/support/)
- [Azure Community Forums](https://docs.microsoft.com/en-us/answers/products/azure)

---

**Last updated:** 2026-01-27 (Phase 9 Plan 02 - SQLite + Azure Files deployment)
