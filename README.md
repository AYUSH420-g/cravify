<div align="center">
  <h1>🍔 Cravify</h1>
  <p><em>A Production-Ready, Event-Driven Food Delivery Platform</em></p>

  <h3>🌍 <a href="https://cravify-peach.vercel.app/" target="_blank">Live Demo: Cravify Website</a></h3>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  </p>
</div>

---

## 📖 1. Introduction

**Cravify** is a comprehensive, production-grade food delivery ecosystem inspired by industry leaders like Swiggy and Zomato. Built as a multi-role web application, it provides a seamless and responsive experience for Customers, Vendors, Riders, and Administrators. With a focus on real-time interactions, rigorous security, and architectural robustness, Cravify serves as a complete demonstration of modern full-stack engineering practices.

---

## 🚀 2. Project Overview

Cravify goes beyond standard CRUD operations by integrating an **Event-Driven Socket.io Architecture** for real-time GPS tracking, dedicated **OSRM Routing** with in-memory caching, and a robust **Quality Assurance Framework** encompassing over 35+ automated end-to-end tests. The platform is designed with a unified backend architecture to enforce strict schema consistency, centralized role-based authentication, and state-of-the-art security measures.

---

## ✨ 3. Key Features

### 🛒 Customer Experience
- **Smart Discovery:** Browse restaurants and menus with dynamic filtering and search.
- **Dynamic Cart & Checkout:** Intuitive order customization and dynamic user data prefilling.
- **Real-Time Tracking:** Live GPS tracking of riders on an interactive map.

### 🏪 Vendor Management
- **Menu Management:** Seamlessly add, update, and categorize menu items.
- **Order Processing:** Real-time push notifications for new orders and status updates.

### 🛵 Rider Operations
- **Delivery Workflow:** Accept or reject incoming delivery pings instantly.
- **Optimized Routing:** Dedicated backend OSRM routing system calculates the fastest paths.

### 🛡️ Admin Panel
- **Verification Workflow:** Integrated with ImageKit for secure Vendor and Rider document verification.
- **Platform Analytics:** Centralized dashboard to oversee platform health and operational metrics.

---

## 💻 4. Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Real-Time & Routing** | Socket.io, OSRM (Open Source Routing Machine) |
| **File Storage** | ImageKit (Admin Document Verification) |
| **Authentication** | JWT (JSON Web Tokens), bcrypt.js |
| **Testing / QA** | Selenium WebDriver (Python), PyTest |
| **Tools & Misc** | Git, Postman, dotenv |

---

## 🏗️ 5. System Architecture / Workflow

Cravify follows a scalable **Client-Server Architecture** augmented with **Event-Driven WebSockets**.

1. **Client Layer:** The Vite-React frontend consumes RESTful APIs for standard data fetching (Authentication, Menu, Profile).
2. **WebSocket Layer:** Socket.io establishes a persistent bidirectional connection for real-time order tracking, delivery pings, and status synchronizations.
3. **Application Layer:** A unified Express.js Node backend handles business logic, enforcing centralized Role-Based Access Control (RBAC).
4. **Data Layer:** MongoDB handles structured storage, while transient routing cache is managed in-memory to optimize OSRM API calls.
5. **External Services:** ImageKit securely handles multi-part file uploads (magic-byte validated).

---

## 📁 6. Folder Structure

```text
cravify/
├── backend/               # Express.js REST API & Socket.io server
│   ├── controllers/       # Business logic handlers
│   ├── middleware/        # JWT auth, File validation (Magic Bytes), RBAC
│   ├── models/            # Mongoose Schemas (Unified User Model)
│   ├── routes/            # API endpoint definitions
│   └── utils/             # OSRM caching, ImageKit integration
├── frontend/              # React.js SPA (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components (Tailwind CSS)
│   │   ├── pages/         # Role-based views (Admin, Vendor, Rider, Customer)
│   │   └── context/       # State management
├── qa_automation/         # Selenium Production-Grade Testing Framework
│   ├── tests/             # Smoke, Functional, Security, Regression modules
│   └── reports/           # Automated test execution reports
└── README.md              # Project documentation
```

---

## 🛠️ 7. Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- [Python 3.8+](https://www.python.org/) (for QA Automation)

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cravify.git
   cd cravify
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🔐 8. Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories.

**`backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cravify
JWT_SECRET=your_super_secret_jwt_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
OSRM_BASE_URL=http://router.project-osrm.org
```

**`frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏃‍♂️ 9. How to Run Locally

To spin up the entire application locally:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🔗 10. API Endpoints (Core)

| HTTP Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user (Customer, Vendor, Rider) | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | Public |
| `GET` | `/api/users/profile` | Get current user details | Authenticated |
| `POST` | `/api/orders/checkout` | Initialize mock payment & place order | Customer |
| `PUT` | `/api/orders/:id/status`| Update order status via WebSockets | Vendor / Rider |
| `POST` | `/api/admin/verify` | Approve/Reject vendor documents | Admin |

---

## 🧩 11. Modules / Functionalities

1. **Authentication & Authorization Module:** Centralized login with JWT. Secure logging practices implemented to prevent token leakage.
2. **Real-Time Engine:** Socket.io module handling robust reconnections and data synchronization across devices.
3. **Routing Engine:** Interacts with external OSRM APIs, utilizing an optimized in-memory caching mechanism to prevent rate-limiting.
4. **Payment Module:** Mock payment fallback strategy implemented specifically for end-to-end testing without real financial transactions.

---

## 🛡️ 12. Security Features Implemented

- **Magic Byte Validation:** Strict file upload security. Verifies the actual hex signature of files (not just the extension) before passing them to ImageKit.
- **Robust Authentication:** HTTP-only cookies / secure headers for JWT token transmission.
- **Constant Variable Enforcement:** Fixed constant variable reassignment vulnerabilities in the payment flow.
- **Role-Based Access Control (RBAC):** Backend route guarding ensures Users cannot access Admin/Vendor endpoints.

---

## 🧪 13. Testing Details

Cravify emphasizes extreme reliability through a **Professional Selenium Testing Framework**.
- **Scope:** 35+ automated test cases.
- **Modules Covered:** Smoke Testing, Functional Testing, Security Testing, and Regression testing.
- **Improvements:** Removed all implicit sleeps in favor of explicit `WebDriverWait` for zero-flake execution. Solved critical authentication failures in CI/CD pipelines.

---

---

## 🚧 14. Known Issues / Limitations

- **OSRM Public API Limits:** Heavy concurrent routing requests may get rate-limited by the public OSRM server, mitigated currently via in-memory caching.
- **Mock Payments:** Real payment gateways (Razorpay/Stripe) are mocked out for academic demonstration.

---

## 📫 15. Contact / Author

**Nevil Nandasana**  

- **GitHub:** [@nevilnandasana](https://github.com/nevilnandasana)
- **LinkedIn:** [Nevil Nandasana](https://www.linkedin.com/in/nevil-n-80b086317/)

**Parin Makwana**

- **GitHub:** [@parinbajayebin](https://github.com/parinbajayebin)
- **LinkedIn:** [Parin Makwana](https://www.linkedin.com/in/parin-makwana-b614a6333/)

**Ayush Soni**

- **GitHub:** [@AYUSH420-g](https://github.com/AYUSH420-g)
- **LinkedIn:** [Ayush Soni](https://www.linkedin.com/in/ayush-soni123/)

**Hitarth Shah**

- **GitHub:** [@hitarth3](https://github.com/hitarth30)
- **LinkedIn:** [Hitarth Shah](https://www.linkedin.com/in/hitarthshah3/)

---