# FleetOps - Enterprise Fleet Management Engine

Welcome to the FleetOps project. This is a full-stack, real-time logistics optimization platform built with Spring Boot 3, PostgreSQL, WebSockets, and React.

## Prerequisites
- **Java JDK 26** (or standard JDK 17+ if retrofitting)
- **Node.js & npm** (for the frontend)
- **PostgreSQL** running locally on port `5432` with username `postgres` and password `123`.

---

## 🚀 How to Start the Application

You will need to open **two separate terminal windows**—one for the backend server and one for the frontend UI.

### 1. Start the Backend (Spring Boot)
Open your first terminal and run:
```bash
cd D:\Personal\Project\Fleet-Management\fleet-optimization
mvn spring-boot:run
```
*The backend will boot up on `http://localhost:8080`.*

### 2. Start the Frontend (React + Vite)
Open a new, second terminal and run:
```bash
cd D:\Personal\Project\Fleet-Management\fleet-frontend
npm run dev
```
*The frontend will boot up and provide a local network URL (typically `http://localhost:5173`). Open that URL in your browser.*

---

## Testing the System
1. Open the UI in your browser.
2. Navigate to **Vehicles** to see the fleet.
3. Navigate to **Assignments** and try to dispatch a truck.
4. If you break a business rule (e.g., driver double-booking or overloading capacity), watch the elegant custom Toast notifications slide in!
5. Navigate to the **Dashboard** to watch the WebSocket feed stream real-time events.
