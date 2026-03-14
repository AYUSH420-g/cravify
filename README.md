# Cravify 🍕

A production-ready food delivery platform clone inspired by Swiggy and Zomato.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, MongoDB
- **Mobile**: React Native (Planned)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1.  **Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

2.  **Backend**
    ```bash
    cd backend
    npm install
    node index.js
    ```

### Installation & Running (One-Click)

We provide handy scripts to install all dependencies and run all 8 services concurrently.

**For Windows:**
Simply double-click `run_all.bat` or run it from your terminal:
```bat
call run_all.bat
```

**For Linux / Mac:**
Make the script executable and run it:
```bash
chmod +x run_all.sh
./run_all.sh
```
### Running Manually (Without Scripts)

If you prefer to run services individually without the batch or bash scripts above (or to avoid crowding a single terminal if you don't care to use `concurrently`), you can start them normally in separate terminal tabs/windows:

1. Open 8 separate terminal windows (or tabs).
2. For each module (`admin`, `customer`, `delivery`, `restaurant`), navigate to both their `frontend` and `backend` directories.
3. Install dependencies per directory:
   ```bash
   npm install
   ```
4. Start the development server per directory:
   ```bash
   npm run dev
   ```
   
**Example for Admin:**
- *Terminal 1:* `cd frontend/admin && npm install && npm run dev`
- *Terminal 2:* `cd backend/admin && npm install && npm run dev`

Repeat this pattern for the remaining modules as needed.

## 📂 Features
- **Discovery**: Search food and restaurants.
- **Ordering**: Add to cart, customize, and checkout.
- **Tracking**: Real-time order status updates.
- **Profile**: Manage orders and addresses.

## 🎨 Design System
Built with a mobile-first approach using Tailwind CSS.
- Primary: #E23744
- Secondary: #FC8019
