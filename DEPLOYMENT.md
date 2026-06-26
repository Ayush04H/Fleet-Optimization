# Master 100% Free Cloud Deployment Blueprint

This document contains the exact step-by-step instructions to deploy FleetOps to production for **$0.00 cost**, complete with database persistence, backend containerization, CDN frontend delivery, and custom CNAME domain routing (`fleet-optimization.ayushpersonal.space`).

---

## Part 1: Database Setup (Neon.tech Serverless PostgreSQL)

1. Go to [https://neon.tech/](https://neon.tech/) and sign in with your GitHub account.
2. Click **Create Project**.
   - **Name:** `fleet-optimization`
   - **Postgres Version:** 16 / 17
   - **Region:** Choose the region closest to you (e.g., Frankfurt / N. Virginia / Singapore).
3. Once created, copy the **Connection String** provided on the dashboard:
   `postgresql://neondb_owner:npg_VecwGk8K2qgx@ep-young-sea-abfnmy7t.eu-west-2.aws.neon.tech/neondb?sslmode=require`
4. Convert this into standard JDBC format for Spring Boot:
   `jdbc:postgresql://ep-young-sea-abfnmy7t.eu-west-2.aws.neon.tech/neondb?sslmode=require`

---

## Part 2: Backend Setup (Render.com Free Docker Service)

1. Go to [https://render.com/](https://render.com/) and sign in with GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your repository: `Fleet-Management`.
4. Configure the service settings:
   - **Name:** `fleet-optimization-backend`
   - **Root Directory:** `fleet-optimization`
   - **Runtime:** **Docker** *(Render will automatically detect the production `Dockerfile` we prepared).*
   - **Instance Type:** **Free** ($0/month).
5. Scroll down to **Environment Variables** and add these exact three variables:
   - `DATABASE_URL` = *(Your JDBC URL from Step 4 of Part 1)*
   - `DATABASE_USERNAME` = *(The username from your Neon connection string)*
   - `DATABASE_PASSWORD` = *(The password from your Neon connection string)*
6. Click **Create Web Service**.
7. Wait ~3-5 minutes for Docker to build. Once deployed, Render will give you a live cloud URL:
   `https://fleet-optimization-backend.onrender.com`

> [!WARNING]
> **Free Tier Inactivity:** Render free services spin down after 15 minutes of zero traffic. The very first request after inactivity will take **30 to 50 seconds** to wake up the Java server. Subsequent requests will be instant.

---

## Part 3: Frontend Setup (Vercel CDN - Foolproof Scratch Deploy)

If your Vercel project is misconfigured or blank, delete it (Settings > Advanced > Delete) and recreate cleanly:

1. Go to [https://vercel.com/](https://vercel.com/) and sign in with GitHub.
2. Click **Add New... > Project** and import `Ayush04H/Fleet-Optimization`.
3. **Configure Project Settings (CRITICAL MONOREPO STEP):**
   - **Project Name:** `fleet-optimization`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit -> select **`fleet-frontend`** -> click Continue.
4. Open **Environment Variables** and add these two:
   - `VITE_API_URL` = `https://fleet-optimization.onrender.com/api`
   - `VITE_WS_URL` = `https://fleet-optimization.onrender.com/ws-fleet`
   *(Note: Our Javascript code also hardwires these endpoints as smart fallbacks automatically!)*
5. Click **Deploy**! Vercel will bundle the optimized chunks (`vendor`, `maps`, `icons`) in roughly 15 seconds.

---

## Part 4: Custom Domain Routing (CNAME Setup)

You want your live Vercel app to open at `fleet-optimization.ayushpersonal.space`.

1. Go to your **Vercel Project > Settings > Domains**.
2. Type `fleet-optimization.ayushpersonal.space` and click **Add**.
3. Vercel will display a DNS configuration window stating:
   - **Type:** `CNAME`
   - **Name:** `fleet-optimization`
   - **Value:** `cname.vercel-dns.com`
4. Open a new tab and go to your **Domain Registrar** (GoDaddy, Hostinger, Namecheap, Cloudflare, etc.) where you manage `ayushpersonal.space`.
5. Go to **DNS Management / Zone Editor** and click **Add Record**:
   - **Record Type:** `CNAME`
   - **Host / Name / Subdomain:** `fleet-optimization`
   - **Points to / Target / Value:** `cname.vercel-dns.com`
   - **TTL:** Automatic / 3600
6. Save the record.

### Verification
Wait roughly 5 to 15 minutes for global DNS propagation. Vercel will automatically provision a Let's Encrypt SSL HTTPS certificate. 

Open `https://fleet-optimization.ayushpersonal.space` in your browser. Your enterprise telematics platform is live to the world for **$0.00**!
