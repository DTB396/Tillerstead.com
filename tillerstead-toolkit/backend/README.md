# Quick Start: Deploy to Railway

This README provides quick instructions for deploying the Tillerstead Toolkit API to Railway.

## Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub account with this repository

## Deployment Steps

### 1. Create Railway Project
```bash
# Option A: Deploy via Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

### 2. Or Deploy via Dashboard
1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose this repository
4. Set **Root Directory** to: `tillerstead-toolkit/backend`
5. Railway auto-detects Python and uses `railway.json` config

### 3. Configure Environment Variables
Add these in Railway Dashboard → Variables:

**Required:**
```
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
```

**Optional (for PostgreSQL):**
```
DATABASE_URL=postgresql://user:pass@host:port/db
```
Or add PostgreSQL via Railway: New → Database → PostgreSQL

**Optional (for Redis):**
```
REDIS_URL=redis://default:password@host:port
```
Or add Redis via Railway: New → Database → Redis

**For Production CORS:**
```
ALLOWED_ORIGINS=https://tillerstead.com,https://www.tillerstead.com
```

### 4. Deploy
Railway deploys automatically on push to `main` branch.

**Your API will be live at:**
```
https://<your-project>.up.railway.app
```

### 5. Test Deployment
```bash
curl https://<your-project>.up.railway.app/health
# Should return: {"status":"healthy"}
```

### 6. Add Custom Domain (Optional)
1. Railway Dashboard → Settings → Domains
2. Add custom domain: `api.tillerstead.com`
3. Update DNS:
   ```
   CNAME  api  <your-project>.up.railway.app
   ```

## Local Development

### 1. Install Dependencies
```bash
cd tillerstead-toolkit/backend
pip install -r requirements.txt
```

### 2. Create .env file
```bash
cp .env.example .env
# Edit .env with your local settings
```

### 3. Run Locally
```bash
uvicorn app.main:app --reload --port 8000
```

API available at: http://localhost:8000

### 4. View API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure
```
tillerstead-toolkit/backend/
├── app/
│   ├── api/          # API endpoints
│   ├── calculators/  # Business logic
│   ├── core/         # Config & utilities
│   ├── db/           # Database models
│   └── main.py       # FastAPI app
├── requirements.txt  # Python dependencies
├── railway.json      # Railway config
├── railway.toml      # Alternative Railway config
└── Procfile          # Process definition
```

## API Endpoints
- `GET  /` - API info
- `GET  /health` - Health check
- `GET  /docs` - Swagger documentation
- `POST /api/calculators/*` - Calculator endpoints
- `GET  /api/products/*` - Product catalog
- `GET  /api/jobs/*` - Job management

## Monitoring
- **Railway Dashboard**: View logs, metrics, and deployments
- **Health Check**: Automatic at `/health` endpoint
- **Logs**: `railway logs` (CLI) or Dashboard → Deployments → View Logs

## Troubleshooting

### Build Fails
- Check Python version (should be 3.11+)
- Verify `requirements.txt` is valid
- Check Railway logs for specific errors

### Runtime Errors
- Verify environment variables are set
- Check database connection (if using PostgreSQL)
- Review logs: `railway logs`

### CORS Issues
- Add your frontend domain to `ALLOWED_ORIGINS`
- Update `app/main.py` CORS middleware if needed

## Costs
- **Free Tier**: $5 credit/month
- Typical API usage: $3-5/month
- Add PostgreSQL: Included in free tier (shared)
- Monitor usage: Railway Dashboard → Usage

## Support
- Railway Docs: https://docs.railway.app
- FastAPI Docs: https://fastapi.tiangolo.com
- Project Issues: GitHub Issues tab

## Next Steps
1. Set up monitoring/alerts in Railway
2. Configure custom domain
3. Set up CI/CD with GitHub Actions (already auto-deploys)
4. Add database backups
5. Update frontend to use Railway API URL
