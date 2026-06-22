# WishMate — Never Miss a Special Moment 🎁

WishMate is a full-stack birthday, anniversary, wedding, festival, and custom occasion reminder platform with a gift-assistance service. Users can add important dates, receive reminder notifications, copy wish templates, request gift help, and make demo payments. Admins can manage users, reminders, gift leads, demo payments, and communication logs.

> **Important:** All SMS, WhatsApp messages, phone calls, browser notifications, and payments in this application are **DEMO SIMULATIONS ONLY**. No real messages are sent, no real calls are made, and no real money is ever charged or transferred. All such actions simply save a log/record in the database with a "Demo" status for demonstration purposes.

---

## Tech Stack

**Frontend:** HTML5, CSS3, Bootstrap 5 (CDN), Bootstrap Icons, Vanilla JavaScript
**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, dotenv, cors

---

## Folder Structure

```
wishmate/
  client/
    index.html
    login.html
    signup.html
    dashboard.html
    add-reminder.html
    calendar.html
    wish-templates.html
    gift-help.html
    payment.html
    admin.html
    css/style.css
    js/api.js
    js/auth.js
    js/app.js
    assets/
  server/
    config/db.js
    controllers/
    middleware/
    models/
    routes/
    server.js
    package.json
    .env.example
  README.md
```

---

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account and cluster
- [VS Code](https://code.visualstudio.com/) with the **Live Server** extension (for running the frontend)

### 2. MongoDB Atlas Setup
1. Create a free MongoDB Atlas account and a free shared cluster.
2. Create a database user with a username and password.
3. Whitelist your IP address (or allow access from anywhere: `0.0.0.0/0` for development).
4. Click **Connect → Connect your application**, and copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/wishmate?retryWrites=true&w=majority
   ```

### 3. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` and fill in your own values:
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/wishmate?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret
```

> ⚠️ Never commit your real `.env` file or expose your secrets publicly. `.env` should always be in `.gitignore`.

Run the backend server:
```bash
npm run dev
```
This uses `nodemon` to auto-restart on file changes. The server will run at `http://localhost:5000`.

Alternatively, for a production-style start:
```bash
npm start
```

### 4. Frontend Setup
1. Open the `client` folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.
3. The site will open at something like `http://127.0.0.1:5500/client/index.html`.

> The frontend connects to the backend API at `http://localhost:5000/api` by default. If you change the backend port, update the `API_BASE_URL` constant in `client/js/api.js`.

### 5. Creating an Admin Account
By default, signups create a `user` role account. To create an admin account for testing the Admin Panel:
- Sign up normally through `signup.html`, then manually update that user's `role` field to `"admin"` directly in your MongoDB Atlas collection (Users collection), **or**
- Use a MongoDB Atlas browser / Compass to edit the document.

Once your role is set to `admin`, log in via `login.html` and you'll be redirected to `admin.html`.

---

## Deployment

### Deploy Client (Netlify)
1. Push your project to GitHub.
2. Sign in to [Netlify](https://www.netlify.com/) and click **"Add new site → Import an existing project"**.
3. Set the **publish directory** to `client`.
4. Deploy. Update `API_BASE_URL` in `client/js/api.js` to point to your deployed backend URL before deploying.

### Deploy Server (Render)
1. Push your project to GitHub.
2. Sign in to [Render](https://render.com/) and create a **New Web Service**.
3. Connect your repository and set the **root directory** to `server`.
4. Set the build command to `npm install` and the start command to `npm start`.
5. Add your environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`) in the Render dashboard's Environment settings.
6. Deploy. Render will give you a live URL (e.g., `https://wishmate-api.onrender.com`) — use this as your `API_BASE_URL` in the frontend.

---

## API Routes Reference

### Auth
- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `GET /api/auth/profile` — Get logged-in user profile (protected)

### Reminders
- `GET /api/reminders` — Get all reminders for logged-in user
- `POST /api/reminders` — Create a new reminder
- `GET /api/reminders/:id` — Get a single reminder
- `PUT /api/reminders/:id` — Update a reminder
- `DELETE /api/reminders/:id` — Delete a reminder

### Gifts
- `GET /api/gifts` — Get gift requests
- `POST /api/gifts` — Create a gift help request
- `PUT /api/gifts/:id/status` — Update gift lead status (admin only)

### Payments
- `POST /api/payments/demo` — Create a demo payment
- `GET /api/payments` — Get payment history

### Demo Communications
- `POST /api/demo/send-sms` — Log a demo SMS
- `POST /api/demo/send-whatsapp` — Log a demo WhatsApp message
- `POST /api/demo/create-call-request` — Log a demo call request

### Admin (admin role required)
- `GET /api/admin/dashboard` — Dashboard statistics
- `GET /api/admin/users` — All users
- `GET /api/admin/reminders` — All reminders
- `GET /api/admin/gifts` — All gift leads
- `GET /api/admin/payments` — All payments
- `GET /api/admin/communications` — All communication logs

---

## Disclaimer

WishMate is built as a demonstration project. All SMS, WhatsApp messages, phone calls, browser push notifications, and payment transactions are **simulated for demo purposes only**. No third-party paid APIs, real payment gateways, or messaging services are integrated. No real money is ever processed and no real messages or calls are sent to any phone number.

---

Made with 💜 using Node.js, Express, MongoDB, and Bootstrap.
