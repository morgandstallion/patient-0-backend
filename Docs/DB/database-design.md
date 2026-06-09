# Database Design (Version 1)

## Overview

Version 1 focuses on product browsing, shopping carts, checkout, and order management.

The database is designed around the following core entities:

- Users
- Products
- Carts
- Cart Items
- Orders
- Order Items

Future features such as pickup scheduling, QR verification, OTP verification, inventory auditing, and delivery management are intentionally excluded from Version 1.

---

# Users

Represents registered customers and administrators.

Fields:

- id
- first_name
- last_name
- email
- password_hash
- role
- created_at
- updated_at

Notes:

- Email must be unique.
- Role can be CUSTOMER or ADMIN.

---

# Products

Represents items available for purchase.

Fields:

- id
- name
- description
- price
- stock_quantity
- image_url
- is_active
- created_at
- updated_at

Notes:

- Products with zero stock cannot be purchased.
- Inactive products should not appear in the storefront.

---

# Carts

Represents a customer's active shopping cart.

Fields:

- id
- user_id
- created_at
- updated_at

Relationships:

- One User has one active Cart.
- One Cart belongs to one User.

---

# Cart Items

Represents products added to a cart.

Fields:

- id
- cart_id
- product_id
- quantity
- created_at

Relationships:

- One Cart contains many Cart Items.
- One Product can appear in many Cart Items.

---

# Orders

Represents completed purchases.

Fields:

- id
- user_id
- total_amount
- status
- created_at
- updated_at

Order Status Values:

- PENDING
- PROCESSING
- READY
- COMPLETED
- CANCELLED

Relationships:

- One User can have many Orders.

---

# Order Items

Represents a snapshot of purchased products.

Fields:

- id
- order_id
- product_id
- product_name
- product_price
- quantity

Notes:

Order Items store a copy of product information at purchase time.

Example:

If a product price changes from $20 to $25 later, historical orders must still show the original purchase price.

---

# Relationships

User
│
├── Cart
│ └── Cart Items
│
└── Orders
└── Order Items

Products are referenced by:

- Cart Items
- Order Items

---

# Future Tables (Not Version 1)

These tables will be introduced later:

- pickup_locations
- pickup_slots
- pickup_reservations
- qr_tokens
- otp_challenges
- deliveries
- delivery_events
- inventory_transactions

These are intentionally postponed until the core ordering system works.
