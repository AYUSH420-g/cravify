-- ==========================================
-- Cravify Database Schema (SQL Equivalent)
-- Original: MongoDB with Mongoose ODM
-- This SQL representation is for documentation/sharing purposes
-- ==========================================

-- ==========================================
-- 1. USERS TABLE
-- Stores all platform users (customers, vendors, riders, admins)
-- ==========================================
CREATE TABLE users (
    id              CHAR(24) PRIMARY KEY,          -- MongoDB ObjectId
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,          -- bcrypt hashed
    phone           VARCHAR(20),
    role            ENUM('customer', 'restaurant_partner', 'delivery_partner', 'admin') DEFAULT 'customer',
    status          ENUM('active', 'blocked') DEFAULT 'active',
    is_verified     BOOLEAN DEFAULT FALSE,
    application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Addresses (1-to-Many: One user has many addresses)
CREATE TABLE user_addresses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         CHAR(24) NOT NULL,
    street          VARCHAR(255),
    city            VARCHAR(100),
    zip             VARCHAR(20),
    type            ENUM('Home', 'Work', 'Other') DEFAULT 'Home',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 2. RESTAURANTS TABLE
-- Stores restaurant profiles created by vendor users
-- ==========================================
CREATE TABLE restaurants (
    id              CHAR(24) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    image           VARCHAR(500) NOT NULL,
    owner           CHAR(24),                       -- FK to users (restaurant_partner)
    rating          DECIMAL(2,1) DEFAULT 0,
    delivery_time   VARCHAR(50),
    price_for_two   VARCHAR(50),
    offer           VARCHAR(255),
    address         VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner) REFERENCES users(id) ON DELETE SET NULL
);

-- Restaurant Cuisines (Many-to-Many simplified as 1-to-Many)
CREATE TABLE restaurant_cuisines (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id   CHAR(24) NOT NULL,
    cuisine         VARCHAR(100) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. MENU ITEMS TABLE
-- Each restaurant has many menu items (1-to-Many)
-- In MongoDB this is embedded; in SQL it's a separate table
-- ==========================================
CREATE TABLE menu_items (
    id              CHAR(24) PRIMARY KEY,
    restaurant_id   CHAR(24) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    image           VARCHAR(500),
    is_veg          BOOLEAN DEFAULT TRUE,
    category        VARCHAR(100),
    is_bestseller   BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. ORDERS TABLE
-- Customer orders linked to a user and a restaurant
-- ==========================================
CREATE TABLE orders (
    id              CHAR(24) PRIMARY KEY,
    user_id         CHAR(24) NOT NULL,              -- FK to users (customer)
    restaurant_id   CHAR(24) NOT NULL,              -- FK to restaurants
    total_amount    DECIMAL(10,2) NOT NULL,
    status          ENUM('Placed', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled') DEFAULT 'Placed',
    payment_method  ENUM('Card', 'UPI', 'COD') DEFAULT 'Card',
    delivery_street VARCHAR(255),
    delivery_city   VARCHAR(100),
    delivery_zip    VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Order Items (1-to-Many: Each order has multiple items)
CREATE TABLE order_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        CHAR(24) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    price           DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. DELIVERY PROFILES TABLE
-- Extended profile for delivery partners (1-to-1 with users)
-- ==========================================
CREATE TABLE delivery_profiles (
    id              CHAR(24) PRIMARY KEY,
    user_id         CHAR(24) NOT NULL UNIQUE,       -- FK to users (delivery_partner)
    is_online       BOOLEAN DEFAULT FALSE,
    current_lat     DECIMAL(10,7) DEFAULT 23.0225,
    current_lng     DECIMAL(10,7) DEFAULT 72.5714,
    total_earnings  DECIMAL(10,2) DEFAULT 0,
    total_deliveries INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. DELIVERY TASKS TABLE
-- Tracks delivery assignments for orders
-- ==========================================
CREATE TABLE delivery_tasks (
    id              CHAR(24) PRIMARY KEY,
    order_id        CHAR(24) NOT NULL UNIQUE,       -- FK to orders (1-to-1)
    delivery_partner_id CHAR(24),                   -- FK to users (delivery_partner)
    status          ENUM('pending', 'accepted', 'arrived_at_restaurant', 'picked_up', 'arrived_at_customer', 'delivered', 'cancelled') DEFAULT 'pending',
    earnings        DECIMAL(10,2) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_partner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- 7. PROMOS TABLE
-- Promotional discount codes managed by admin
-- ==========================================
CREATE TABLE promos (
    id              CHAR(24) PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    description     VARCHAR(255) NOT NULL,
    discount_type   ENUM('percentage', 'fixed') DEFAULT 'percentage',
    discount_value  DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_discount_value DECIMAL(10,2) DEFAULT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    expiry_date     DATE NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. SETTINGS TABLE (Singleton)
-- Platform-wide configuration managed by admin
-- ==========================================
CREATE TABLE settings (
    id              CHAR(24) PRIMARY KEY,
    singleton_id    VARCHAR(50) DEFAULT 'admin_config' UNIQUE,
    platform_fee    DECIMAL(5,2) DEFAULT 5,
    referral_bonus  DECIMAL(10,2) DEFAULT 10,
    support_email   VARCHAR(255) DEFAULT 'support@cravify.com',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    auto_approve_restaurants BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- RELATIONSHIP SUMMARY
-- ==========================================
-- users           1 ──── * user_addresses         (One user has many addresses)
-- users           1 ──── 1 restaurants             (One vendor owns one restaurant)
-- restaurants     1 ──── * menu_items              (One restaurant has many menu items)
-- restaurants     1 ──── * restaurant_cuisines     (One restaurant has many cuisines)
-- users           1 ──── * orders                  (One customer has many orders)
-- restaurants     1 ──── * orders                  (One restaurant has many orders)
-- orders          1 ──── * order_items             (One order has many items)
-- users           1 ──── 1 delivery_profiles       (One rider has one profile)
-- orders          1 ──── 1 delivery_tasks          (One order has one delivery task)
-- users           1 ──── * delivery_tasks          (One rider handles many tasks)
