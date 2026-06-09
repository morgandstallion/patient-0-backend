# API Design (Version 1)

## Overview

Version 1 focuses on product browsing, shopping carts, checkout, and order management.

The API follows RESTful conventions and uses JSON for request and response bodies.

---

## Base URL & Conventions

| Item            | Convention                                             |
| --------------- | ------------------------------------------------------ |
| Base URL        | `/api/v1`                                              |
| Request Format  | `application/json`                                     |
| Response Format | `application/json`                                     |
| Authentication  | Bearer token via `Authorization` header                |
| Pagination      | Query params: `page` (default 1), `limit` (default 20) |

### Standard Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of the error."
  }
}
```

Common HTTP status codes used:

| Status | Meaning               |
| ------ | --------------------- |
| 200    | Success               |
| 201    | Created               |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 409    | Conflict              |
| 422    | Unprocessable Entity  |
| 500    | Internal Server Error |

---

## Authentication Endpoints

### POST /api/v1/auth/register

Register a new customer account.

**Authentication:** None

**Request Body:**

| Field      | Type   | Required | Constraints                           |
| ---------- | ------ | -------- | ------------------------------------- |
| first_name | string | Yes      | 1-100 characters                      |
| last_name  | string | Yes      | 1-100 characters                      |
| email      | string | Yes      | Must be a valid email; must be unique |
| password   | string | Yes      | Minimum 8 characters                  |

**Success Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "created_at": "2026-06-09T18:00:00Z"
  },
  "token": "jwt.token.here"
}
```

**Error Responses:**

| Status | Code             | Scenario                  |
| ------ | ---------------- | ------------------------- |
| 409    | EMAIL_TAKEN      | Email already registered  |
| 422    | VALIDATION_ERROR | Missing or invalid fields |

---

### POST /api/v1/auth/login

Authenticate and receive a JWT token.

**Authentication:** None

**Request Body:**

| Field    | Type   | Required | Constraints            |
| -------- | ------ | -------- | ---------------------- |
| email    | string | Yes      | Must be a valid email  |
| password | string | Yes      | Must match stored hash |

**Success Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "created_at": "2026-06-09T18:00:00Z"
  },
  "token": "jwt.token.here"
}
```

**Error Responses:**

| Status | Code                | Scenario                              |
| ------ | ------------------- | ------------------------------------- |
| 401    | INVALID_CREDENTIALS | Email not found or password incorrect |

---

### GET /api/v1/auth/me

Get the currently authenticated user's profile.

**Authentication:** Required (Customer, Admin)

**Success Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "created_at": "2026-06-09T18:00:00Z",
    "updated_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code         | Scenario                 |
| ------ | ------------ | ------------------------ |
| 401    | UNAUTHORIZED | Missing or invalid token |

---

## Product Endpoints

### GET /api/v1/products

List active products available for purchase.

**Authentication:** None

**Query Parameters:**

| Parameter | Type    | Default | Description              |
| --------- | ------- | ------- | ------------------------ |
| page      | integer | 1       | Page number              |
| limit     | integer | 20      | Items per page (max 100) |
| search    | string  | —       | Search by product name   |
| min_price | number  | —       | Minimum price filter     |
| max_price | number  | —       | Maximum price filter     |

**Notes:**

- Only returns products where `is_active = true` and `stock_quantity > 0`.
- Inactive products and products with zero stock are hidden from the storefront.

**Success Response (200):**

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Wireless Headphones",
      "description": "High-quality Bluetooth headphones.",
      "price": 49.99,
      "stock_quantity": 25,
      "image_url": "https://example.com/images/headphones.jpg",
      "created_at": "2026-06-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 42,
    "total_pages": 3
  }
}
```

**Error Responses:**

| Status | Code           | Scenario                    |
| ------ | -------------- | --------------------------- |
| 400    | INVALID_PARAMS | Invalid page or limit value |

---

### GET /api/v1/products/:id

Get a single product by ID.

**Authentication:** None

**Success Response (200):**

```json
{
  "product": {
    "id": "uuid",
    "name": "Wireless Headphones",
    "description": "High-quality Bluetooth headphones.",
    "price": 49.99,
    "stock_quantity": 25,
    "image_url": "https://example.com/images/headphones.jpg",
    "is_active": true,
    "created_at": "2026-06-01T12:00:00Z",
    "updated_at": "2026-06-01T12:00:00Z"
  }
}
```

**Notes:**

- Returns the product regardless of `is_active` status (admins may need to view inactive products).

**Error Responses:**

| Status | Code      | Scenario                  |
| ------ | --------- | ------------------------- |
| 404    | NOT_FOUND | Product ID does not exist |

---

### POST /api/v1/products

Create a new product.

**Authentication:** Required (Admin only)

**Request Body:**

| Field          | Type    | Required | Constraints       |
| -------------- | ------- | -------- | ----------------- |
| name           | string  | Yes      | 1-255 characters  |
| description    | string  | Yes      | 1-5000 characters |
| price          | number  | Yes      | Must be >= 0      |
| stock_quantity | integer | Yes      | Must be >= 0      |
| image_url      | string  | No       | Valid URL         |
| is_active      | boolean | No       | Defaults to true  |

**Success Response (201):**

```json
{
  "product": {
    "id": "uuid",
    "name": "Wireless Headphones",
    "description": "High-quality Bluetooth headphones.",
    "price": 49.99,
    "stock_quantity": 25,
    "image_url": "https://example.com/images/headphones.jpg",
    "is_active": true,
    "created_at": "2026-06-09T18:00:00Z",
    "updated_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code             | Scenario                           |
| ------ | ---------------- | ---------------------------------- |
| 401    | UNAUTHORIZED     | Not authenticated                  |
| 403    | FORBIDDEN        | Authenticated user is not an Admin |
| 422    | VALIDATION_ERROR | Missing or invalid fields          |

---

### PUT /api/v1/products/:id

Update an existing product.

**Authentication:** Required (Admin only)

**Request Body:**

| Field          | Type    | Required | Constraints       |
| -------------- | ------- | -------- | ----------------- |
| name           | string  | No       | 1-255 characters  |
| description    | string  | No       | 1-5000 characters |
| price          | number  | No       | Must be >= 0      |
| stock_quantity | integer | No       | Must be >= 0      |
| image_url      | string  | No       | Valid URL         |
| is_active      | boolean | No       | —                 |

Only provided fields will be updated.

**Success Response (200):**

```json
{
  "product": {
    "id": "uuid",
    "name": "Wireless Headphones Pro",
    "description": "High-quality Bluetooth headphones.",
    "price": 59.99,
    "stock_quantity": 25,
    "image_url": "https://example.com/images/headphones.jpg",
    "is_active": true,
    "created_at": "2026-06-01T12:00:00Z",
    "updated_at": "2026-06-09T18:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code             | Scenario                           |
| ------ | ---------------- | ---------------------------------- |
| 401    | UNAUTHORIZED     | Not authenticated                  |
| 403    | FORBIDDEN        | Authenticated user is not an Admin |
| 404    | NOT_FOUND        | Product ID does not exist          |
| 422    | VALIDATION_ERROR | Invalid field values               |

---

### DELETE /api/v1/products/:id

Delete a product.

**Authentication:** Required (Admin only)

**Notes:**

- This performs a hard delete. Alternatively, the admin can set `is_active = false` via PUT to soft-hide the product.
- Deleting a product may affect existing order items (which store a snapshot), but will break references in cart items. Consider checking for active cart items before deletion.

**Success Response (200):**

```json
{
  "message": "Product deleted successfully."
}
```

**Error Responses:**

| Status | Code         | Scenario                                |
| ------ | ------------ | --------------------------------------- |
| 401    | UNAUTHORIZED | Not authenticated                       |
| 403    | FORBIDDEN    | Authenticated user is not an Admin      |
| 404    | NOT_FOUND    | Product ID does not exist               |
| 409    | CONFLICT     | Product referenced in active cart items |

---

## Cart Endpoints

All cart endpoints require authentication and operate on the authenticated user's cart.

---

### GET /api/v1/cart

Get the current user's cart with all items.

**Authentication:** Required (Customer)

**Notes:**

- If the user has no cart, an empty cart object is returned (the cart is created lazily on first item addition).

**Success Response (200):**

```json
{
  "cart": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Wireless Headphones",
        "product_price": 49.99,
        "quantity": 2,
        "subtotal": 99.98,
        "created_at": "2026-06-09T18:00:00Z"
      }
    ],
    "total_items": 2,
    "total_amount": 99.98,
    "created_at": "2026-06-09T18:00:00Z",
    "updated_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code         | Scenario               |
| ------ | ------------ | ---------------------- |
| 401    | UNAUTHORIZED | Not authenticated      |
| 403    | FORBIDDEN    | User is not a Customer |

---

### POST /api/v1/cart/items

Add a product to the cart.

**Authentication:** Required (Customer)

**Request Body:**

| Field      | Type    | Required | Constraints                               |
| ---------- | ------- | -------- | ----------------------------------------- |
| product_id | string  | Yes      | Must reference an existing active product |
| quantity   | integer | Yes      | Must be >= 1                              |

**Notes:**

- If the product is already in the cart, the quantity is incremented instead of creating a duplicate entry.
- The product must be active and have sufficient stock.

**Success Response (201):**

```json
{
  "cart_item": {
    "id": "uuid",
    "product_id": "uuid",
    "product_name": "Wireless Headphones",
    "product_price": 49.99,
    "quantity": 2,
    "subtotal": 99.98,
    "created_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code               | Scenario                                         |
| ------ | ------------------ | ------------------------------------------------ |
| 400    | INSUFFICIENT_STOCK | Requested quantity exceeds available stock       |
| 401    | UNAUTHORIZED       | Not authenticated                                |
| 403    | FORBIDDEN          | User is not a Customer                           |
| 404    | PRODUCT_NOT_FOUND  | Product ID does not exist or product is inactive |
| 422    | VALIDATION_ERROR   | Missing or invalid fields                        |

---

### PUT /api/v1/cart/items/:itemId

Update the quantity of a cart item.

**Authentication:** Required (Customer)

**Request Body:**

| Field    | Type    | Required | Constraints                                  |
| -------- | ------- | -------- | -------------------------------------------- |
| quantity | integer | Yes      | Must be >= 0. Setting to 0 removes the item. |

**Notes:**

- If quantity exceeds available stock, the request is rejected.
- Setting quantity to 0 is equivalent to removing the item.

**Success Response (200):**

```json
{
  "cart_item": {
    "id": "uuid",
    "product_id": "uuid",
    "product_name": "Wireless Headphones",
    "product_price": 49.99,
    "quantity": 3,
    "subtotal": 149.97,
    "created_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code               | Scenario                                   |
| ------ | ------------------ | ------------------------------------------ |
| 400    | INSUFFICIENT_STOCK | Requested quantity exceeds available stock |
| 401    | UNAUTHORIZED       | Not authenticated                          |
| 403    | FORBIDDEN          | Not the owner of this cart item            |
| 404    | NOT_FOUND          | Cart item ID does not exist                |
| 422    | VALIDATION_ERROR   | Invalid quantity value                     |

---

### DELETE /api/v1/cart/items/:itemId

Remove a cart item from the cart.

**Authentication:** Required (Customer)

**Success Response (200):**

```json
{
  "message": "Cart item removed successfully."
}
```

**Error Responses:**

| Status | Code         | Scenario                        |
| ------ | ------------ | ------------------------------- |
| 401    | UNAUTHORIZED | Not authenticated               |
| 403    | FORBIDDEN    | Not the owner of this cart item |
| 404    | NOT_FOUND    | Cart item ID does not exist     |

---

### DELETE /api/v1/cart

Clear all items from the current user's cart.

**Authentication:** Required (Customer)

**Success Response (200):**

```json
{
  "message": "Cart cleared successfully.",
  "cart": {
    "id": "uuid",
    "items": [],
    "total_items": 0,
    "total_amount": 0,
    "created_at": "2026-06-09T18:00:00Z",
    "updated_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code         | Scenario               |
| ------ | ------------ | ---------------------- |
| 401    | UNAUTHORIZED | Not authenticated      |
| 403    | FORBIDDEN    | User is not a Customer |

---

## Order Endpoints

### POST /api/v1/orders

Create an order from the current user's cart (checkout).

**Authentication:** Required (Customer)

**Request Body:**

```json
{}
```

No request body is needed. The order is created from the authenticated user's cart contents.

**Business Logic Notes:**

1. The cart must contain at least one item.
2. Each product in the cart is validated for stock availability.
3. Stock quantities are decremented for each product.
4. An Order is created with status `PENDING`.
5. Order Items are created as snapshots of each cart item (product name and price at time of purchase).
6. The cart is cleared after successful order creation.
7. If any product has insufficient stock, the entire transaction is rolled back.

**Success Response (201):**

```json
{
  "order": {
    "id": "uuid",
    "user_id": "uuid",
    "total_amount": 149.97,
    "status": "PENDING",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Wireless Headphones",
        "product_price": 49.99,
        "quantity": 3
      }
    ],
    "created_at": "2026-06-09T18:00:00Z",
    "updated_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code               | Scenario                                     |
| ------ | ------------------ | -------------------------------------------- |
| 400    | EMPTY_CART         | Cart has no items                            |
| 400    | INSUFFICIENT_STOCK | One or more products have insufficient stock |
| 401    | UNAUTHORIZED       | Not authenticated                            |
| 403    | FORBIDDEN          | User is not a Customer                       |

---

### GET /api/v1/orders

List the authenticated customer's orders.

**Authentication:** Required (Customer)

**Query Parameters:**

| Parameter | Type    | Default | Description              |
| --------- | ------- | ------- | ------------------------ |
| page      | integer | 1       | Page number              |
| limit     | integer | 20      | Items per page (max 100) |
| status    | string  | —       | Filter by order status   |

**Order Status Values:** PENDING, PROCESSING, READY, COMPLETED, CANCELLED

**Success Response (200):**

```json
{
  "orders": [
    {
      "id": "uuid",
      "total_amount": 149.97,
      "status": "PENDING",
      "item_count": 3,
      "created_at": "2026-06-09T18:00:00Z",
      "updated_at": "2026-06-09T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 5,
    "total_pages": 1
  }
}
```

**Error Responses:**

| Status | Code         | Scenario          |
| ------ | ------------ | ----------------- |
| 401    | UNAUTHORIZED | Not authenticated |

---

### GET /api/v1/orders/:id

Get a single order with all items.

**Authentication:** Required (Customer, Admin)

**Notes:**

- Customers can only view their own orders.
- Admins can view any order.

**Success Response (200):**

```json
{
  "order": {
    "id": "uuid",
    "user_id": "uuid",
    "total_amount": 149.97,
    "status": "PENDING",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Wireless Headphones",
        "product_price": 49.99,
        "quantity": 3
      }
    ],
    "created_at": "2026-06-09T18:00:00Z",
    "updated_at": "2026-06-09T18:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code         | Scenario                                       |
| ------ | ------------ | ---------------------------------------------- |
| 401    | UNAUTHORIZED | Not authenticated                              |
| 403    | FORBIDDEN    | Customer trying to access another user's order |
| 404    | NOT_FOUND    | Order ID does not exist                        |

---

### PATCH /api/v1/orders/:id/status

Update the status of an order.

**Authentication:** Required (Admin only)

**Request Body:**

| Field  | Type   | Required | Constraints                        |
| ------ | ------ | -------- | ---------------------------------- |
| status | string | Yes      | Must be a valid order status value |

**Valid Transitions:**

| From       | To         |
| ---------- | ---------- |
| PENDING    | PROCESSING |
| PENDING    | CANCELLED  |
| PROCESSING | READY      |
| PROCESSING | CANCELLED  |
| READY      | COMPLETED  |
| READY      | CANCELLED  |

**Notes:**

- Orders cannot transition to a previous status.
- COMPLETED and CANCELLED are terminal states.

**Success Response (200):**

```json
{
  "order": {
    "id": "uuid",
    "user_id": "uuid",
    "total_amount": 149.97,
    "status": "PROCESSING",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Wireless Headphones",
        "product_price": 49.99,
        "quantity": 3
      }
    ],
    "created_at": "2026-06-09T18:00:00Z",
    "updated_at": "2026-06-09T18:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code               | Scenario                           |
| ------ | ------------------ | ---------------------------------- |
| 400    | INVALID_TRANSITION | Status transition is not allowed   |
| 401    | UNAUTHORIZED       | Not authenticated                  |
| 403    | FORBIDDEN          | Authenticated user is not an Admin |
| 404    | NOT_FOUND          | Order ID does not exist            |
| 422    | VALIDATION_ERROR   | Invalid status value               |

---

### GET /api/v1/admin/orders

List all orders (Admin view).

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type    | Default | Description                |
| --------- | ------- | ------- | -------------------------- |
| page      | integer | 1       | Page number                |
| limit     | integer | 20      | Items per page (max 100)   |
| status    | string  | —       | Filter by order status     |
| user_id   | string  | —       | Filter by customer user ID |

**Success Response (200):**

```json
{
  "orders": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "total_amount": 149.97,
      "status": "PENDING",
      "item_count": 3,
      "created_at": "2026-06-09T18:00:00Z",
      "updated_at": "2026-06-09T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 25,
    "total_pages": 2
  }
}
```

**Error Responses:**

| Status | Code         | Scenario                           |
| ------ | ------------ | ---------------------------------- |
| 401    | UNAUTHORIZED | Not authenticated                  |
| 403    | FORBIDDEN    | Authenticated user is not an Admin |

---

## Endpoint Summary

| Method | Path                       | Auth | Role            | Description               |
| ------ | -------------------------- | ---- | --------------- | ------------------------- |
| POST   | /api/v1/auth/register      | No   | —               | Register a new account    |
| POST   | /api/v1/auth/login         | No   | —               | Log in                    |
| GET    | /api/v1/auth/me            | Yes  | Any             | Get current user          |
| GET    | /api/v1/products           | No   | —               | List active products      |
| GET    | /api/v1/products/:id       | No   | —               | Get product details       |
| POST   | /api/v1/products           | Yes  | Admin           | Create a product          |
| PUT    | /api/v1/products/:id       | Yes  | Admin           | Update a product          |
| DELETE | /api/v1/products/:id       | Yes  | Admin           | Delete a product          |
| GET    | /api/v1/cart               | Yes  | Customer        | Get current cart          |
| POST   | /api/v1/cart/items         | Yes  | Customer        | Add item to cart          |
| PUT    | /api/v1/cart/items/:itemId | Yes  | Customer        | Update cart item quantity |
| DELETE | /api/v1/cart/items/:itemId | Yes  | Customer        | Remove cart item          |
| DELETE | /api/v1/cart               | Yes  | Customer        | Clear cart                |
| POST   | /api/v1/orders             | Yes  | Customer        | Create order from cart    |
| GET    | /api/v1/orders             | Yes  | Customer        | List own orders           |
| GET    | /api/v1/orders/:id         | Yes  | Customer, Admin | Get order details         |
| PATCH  | /api/v1/orders/:id/status  | Yes  | Admin           | Update order status       |
| GET    | /api/v1/admin/orders       | Yes  | Admin           | List all orders           |
