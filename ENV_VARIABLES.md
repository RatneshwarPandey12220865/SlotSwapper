# Environment Variables Configuration

## Backend Environment Variables

Create a file named `.env` in the `backend/` directory with the following content:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slotswapper
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
```

**Note:** If you prefer an example file, create `backend/.env.example` with the values above and copy it to `.env`:
```bash
cd backend
# Create example file (optional)
# then copy to .env and edit with your actual values
```

### Explanation:
- **PORT**: The port number for the backend server (default: 5000)
- **DB_HOST**: PostgreSQL host (usually 'localhost' for local development)
- **DB_PORT**: PostgreSQL port (default: 5432)
- **DB_NAME**: Name of your PostgreSQL database
- **DB_USER**: PostgreSQL username (usually 'postgres')
- **DB_PASSWORD**: Your PostgreSQL password
- **JWT_SECRET**: Secret key for signing JWT tokens (use a long, random string in production)

## Frontend Environment Variables (Optional)

If you need to change the backend API URL, create a file named `.env` in the `frontend/` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### Explanation:
- **VITE_API_URL**: The base URL for the backend API (defaults to `http://localhost:5000/api` if not set)

## Quick Setup Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create .env file:**
   ```bash
   # On Windows (PowerShell)
   New-Item .env
   
   # On Linux/Mac
   touch .env
   ```

3. **Copy the backend environment variables above into the `.env` file**

4. **Update the values:**
   - Replace `your_postgres_password_here` with your actual PostgreSQL password
   - Replace `your-secret-key-change-in-production-make-it-long-and-random` with a secure random string

5. **For frontend (optional):**
   ```bash
   cd ../frontend
   # Create .env file if you need to customize the API URL
   ```

## Security Notes

⚠️ **Important**: 
- Never commit `.env` files to version control (they're already in `.gitignore`)
- Use strong, unique passwords for production
- Generate a secure JWT_SECRET (you can use: `openssl rand -base64 32`)
- Never use the example values in production

## Example Production .env

```env
PORT=5000
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=slotswapper_prod
DB_USER=slotswapper_user
DB_PASSWORD=super_secure_password_here
JWT_SECRET=generate-this-with-openssl-rand-base64-32-or-similar
```
