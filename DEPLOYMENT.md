# Deployment Guide

## GitHub Secrets Setup

Before pushing changes that trigger deployment, ensure the following secrets are configured in your GitHub repository:

### Required Secrets

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

1. **VITE_API_URL**
   - Description: Your production API URL
   - Example: `http://148.230.101.110` (IP address is fine!) or `https://api.yourdomain.com`
   - **Important**: This MUST match the URL your frontend uses to call the API
   - Using IP address is perfectly fine until you have a domain
   - This will be embedded in the frontend build

2. **VITE_ABLY_KEY**
   - Description: Your Ably public key for real-time features
   - Example: `Zk0Jpw.42-J0A:...`

3. **SSH_HOST**
   - Description: Your server hostname or IP
   - Example: `148.230.101.110` or `srv1164110.hstgr.cloud`

4. **SSH_USER**
   - Description: SSH username for deployment
   - Example: `iyan`

5. **SSH_PRIVATE_KEY**
   - Description: SSH private key for authentication
   - Generate with: `ssh-keygen -t ed25519 -C "github-actions"`
   - Copy private key content (entire file including headers)
   - Add public key to server's `~/.ssh/authorized_keys`

## Deployment Process

The deployment workflow (`.github/workflows/deploy.yml`) will:

1. SSH into your server
2. Pull latest code from master branch
3. Create `.env` file with secrets
4. Install dependencies (`npm install`)
5. Build frontend with production environment variables (`npm run build`)
6. Rebuild and restart Docker containers

## Avatar Fix

The avatar loading issue in production was caused by:
- Missing environment variables during build time
- Vite embeds `import.meta.env.*` values at build time, not runtime
- Backend returning absolute URLs with IP that caused CORS issues

The fix includes:
- `normalizeAvatarUrl()` utility to convert backend URLs to use API domain
- Proper environment variable injection during build
- Debug logging in production to trace issues

## Troubleshooting

### Avatars not loading?

1. **Check browser console for logs**:
   ```
   [Avatar Utils Init] VITE_API_URL: http://148.230.101.110
   [Avatar Utils] Input URL: http://148.230.101.110/storage/avatars/xxx.jpg
   [Avatar Utils] Normalized URL: http://148.230.101.110/storage/avatars/xxx.jpg
   ```

2. **If VITE_API_URL is undefined or empty**:
   - Verify GitHub secrets are set correctly (especially VITE_API_URL)
   - Check deployment workflow logs for "Production .env created" message
   - Ensure build runs AFTER .env creation
   - Re-run deployment after adding secrets

3. **If avatar URL is still using wrong domain**:
   - Check backend response for `avatar_url` field format
   - Verify `normalizeAvatarUrl()` is called in all components
   - Backend should return either:
     - Absolute URL: `http://148.230.101.110/storage/avatars/xxx.jpg`
     - Relative URL: `/storage/avatars/xxx.jpg`

4. **Backend configuration required**:
   
   Laravel must serve storage files publicly. Ensure:
   
   a) **Storage link created**:
   ```bash
   php artisan storage:link
   ```
   
   b) **Nginx/Apache configured to serve /storage/***:
   ```nginx
   location /storage {
       alias /path/to/your/laravel/storage/app/public;
   }
   ```
   
   c) **Test manually**:
   ```bash
   # Should return the image
   curl -I http://148.230.101.110/storage/avatars/test.jpg
   ```
   
   d) **CORS headers for images** (if needed):
   Add to Laravel's `config/cors.php`:
   ```php
   'paths' => ['api/*', 'storage/*', 'sanctum/csrf-cookie'],
   ```

5. **Network tab check**:
   - Open browser DevTools → Network tab
   - Look for avatar image requests
   - Check response status (should be 200, not 404 or 403)
   - Verify URL is using correct domain (VITE_API_URL)

### Deployment failing?

- Check GitHub Actions logs for error messages
- Verify SSH connection works manually
- Ensure server has Node.js and npm installed
- Check Docker Compose configuration
