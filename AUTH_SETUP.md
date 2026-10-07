# Authentication and password reset

The application now uses an Express server for sign-in, recovery, and self-registration. Passwords are stored as salted scrypt hashes in SQLite. Password reset links are random, single-use tokens that expire after 30 minutes; only a hash of each token is stored. Public account creation is limited to Student and Parent roles; staff accounts are created by an administrator with the CLI. Student and Parent sign-in currently returns to the public home page because dedicated student/parent portals are not implemented yet.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and enter your SMTP provider's host, port, sender address, username, and app password. Keep `.env` private and do not commit it.
3. Install dependencies and start the server:

   ```powershell
   npm install
   npm start
   ```

4. In a terminal, create staff accounts as needed. The password is entered without being echoed:

   ```powershell
   npm run create-user
   ```

5. Open `http://localhost:3000/login.html`. Students and parents can register from the login page. Create staff accounts with the CLI, then sign in with the account's username, password, and role.

The SQLite database is created under `data/` on first run. It is excluded from Git. Back it up securely; it contains password hashes and account information.

Do not open `login.html` from the filesystem or with a static Live Server extension: those methods do not run the `/api/auth/*` Express routes and produce HTML 404 responses instead of JSON. The login page now reports this configuration issue directly.

## Production requirements

- Set `NODE_ENV=production` and `PUBLIC_BASE_URL` to the site's HTTPS origin.
- Use valid SMTP credentials and a sender address authorized by the mail provider.
- Serve the application only over HTTPS in production. The authentication cookie is marked `Secure` in production.
- Back up the SQLite database securely and restrict server/database filesystem access.
- This starter protects all `/admin` pages behind sign-in, but it does not yet enforce different permissions for each user role. Add role-based authorization before exposing role-specific administrative features.
