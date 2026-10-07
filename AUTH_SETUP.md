# Authentication and password reset

The application now uses an Express server for sign-in and recovery. Passwords are stored as salted scrypt hashes in SQLite. Password reset links are random, single-use tokens that expire after 30 minutes; only a hash of each token is stored.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and enter your SMTP provider's host, port, sender address, username, and app password. Keep `.env` private and do not commit it.
3. Install dependencies and start the server:

   ```powershell
   npm install
   npm start
   ```

4. In a terminal, create an account. The password is entered without being echoed:

   ```powershell
   npm run create-user
   ```

5. Open `http://localhost:3000/login.html` and sign in with the account's username, password, and role.

The SQLite database is created under `data/` on first run. It is excluded from Git. Back it up securely; it contains password hashes and account information.

## Production requirements

- Set `NODE_ENV=production` and `PUBLIC_BASE_URL` to the site's HTTPS origin.
- Use valid SMTP credentials and a sender address authorized by the mail provider.
- Serve the application only over HTTPS in production. The authentication cookie is marked `Secure` in production.
- Back up the SQLite database securely and restrict server/database filesystem access.
- This starter protects all `/admin` pages behind sign-in, but it does not yet enforce different permissions for each user role. Add role-based authorization before exposing role-specific administrative features.
