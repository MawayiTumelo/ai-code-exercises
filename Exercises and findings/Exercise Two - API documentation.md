# Exercise Two: API Documentation Submission

## Overview
This document represents the complete submission for **Exercise 2 - API Documentation**, demonstrating the application of AI prompting strategies (Prompt 1: Endpoint Documentation Generation, Prompt 2: API Reference Conversion to OpenAPI 3.0, and Prompt 3: API Usage Guide Creation) to document JavaScript / Express.js REST API endpoints.

---

## 1. Selected Original API Endpoint Code

**Language / Framework**: JavaScript / Express.js  
**Component**: `productRouter` (`GET /` and `GET /:productId`)

```javascript
/**
 * Product API endpoints
 */
const express = require('express');
const productRouter = express.Router();

// Get all products with filtering and pagination
productRouter.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
      inStock
    } = req.query;

    // Build filter
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filter.stockQuantity = { $gt: 0 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Execute query
    const products = await ProductModel.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalProducts = await ProductModel.countDocuments(filter);

    return res.status(200).json({
      products,
      pagination: {
        total: totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalProducts / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch products'
    });
  }
});

// Get product by ID
productRouter.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);

    // Check if error is invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid product ID format'
      });
    }

    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch product'
    });
  }
});

module.exports = productRouter;
```

---

## 2. Comprehensive Endpoint Documentation (Prompt 1 Output)

# Products API Specification

### Endpoint 1: List Products
* **HTTP Method**: `GET`
* **Path**: `/api/products`
* **Purpose**: Retrieves a paginated list of catalog products with optional filtering by category, price range, and stock availability, as well as customizable sorting.

#### Authentication
* **Required**: No public authentication required for GET requests.

#### Query Parameters

| Parameter | Type | Default | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `category` | `string` | — | No | Filters products by category name (e.g., `electronics`, `clothing`). |
| `minPrice` | `number` | — | No | Filters products with price $\ge$ `minPrice`. |
| `maxPrice` | `number` | — | No | Filters products with price $\le$ `maxPrice`. |
| `inStock` | `boolean` | `false` | No | When set to `'true'`, restricts results to products with `stockQuantity > 0`. |
| `sort` | `string` | `'createdAt'` | No | Field to sort by (e.g., `price`, `createdAt`, `name`). |
| `order` | `string` | `'desc'` | No | Sort direction: `'asc'` or `'desc'`. |
| `page` | `integer` | `1` | No | Page number for pagination ($\ge 1$). |
| `limit` | `integer` | `20` | No | Maximum number of products per page (Recommended max: `100`). |

#### Response Codes & Format

##### `200 OK`
Returned on successful query execution.

```json
{
  "products": [
    {
      "_id": "61fa9bcf5c130b2e6d675432",
      "name": "Wireless Noise-Canceling Headphones",
      "description": "Premium over-ear Bluetooth headphones with active noise cancellation",
      "price": 199.99,
      "category": "electronics",
      "stockQuantity": 45,
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-02-15T12:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

##### `500 Internal Server Error`
Returned when database or execution errors occur.

```json
{
  "error": "Server error",
  "message": "Failed to fetch products"
}
```

#### Example Requests & Responses

##### Example Request 1: Filter by category and stock availability
```http
GET /api/products?category=electronics&inStock=true&limit=1 HTTP/1.1
Host: api.example.com
```

**Response (`200 OK`)**:
```json
{
  "products": [
    {
      "_id": "61fa9bcf5c130b2e6d675432",
      "name": "Wireless Noise-Canceling Headphones",
      "price": 199.99,
      "category": "electronics",
      "stockQuantity": 45,
      "createdAt": "2026-01-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 14,
    "page": 1,
    "limit": 1,
    "pages": 14
  }
}
```

##### Example Request 2: Price range filter with custom ascending sort
```http
GET /api/products?minPrice=20&maxPrice=100&sort=price&order=asc&page=1&limit=2 HTTP/1.1
Host: api.example.com
```

**Response (`200 OK`)**:
```json
{
  "products": [
    {
      "_id": "61fa9bcf5c130b2e6d675440",
      "name": "Ergonomic Mousepad",
      "price": 24.99,
      "category": "accessories",
      "stockQuantity": 120
    },
    {
      "_id": "61fa9bcf5c130b2e6d675441",
      "name": "Mechanical Gaming Keyboard",
      "price": 89.99,
      "category": "electronics",
      "stockQuantity": 15
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 2,
    "pages": 4
  }
}
```

---

### Endpoint 2: Get Product by ID
* **HTTP Method**: `GET`
* **Path**: `/api/products/:productId`
* **Purpose**: Fetches detailed information for a single product specified by its unique 24-character MongoDB `ObjectId`.

#### Path Parameters
* `productId` (`string`, required): 24-character hexadecimal MongoDB `ObjectId`.

#### Response Codes & Format

##### `200 OK` (Product Found)
```json
{
  "_id": "61fa9bcf5c130b2e6d675432",
  "name": "Wireless Noise-Canceling Headphones",
  "description": "Premium over-ear Bluetooth headphones",
  "price": 199.99,
  "category": "electronics",
  "stockQuantity": 45,
  "createdAt": "2026-01-10T10:00:00.000Z",
  "updatedAt": "2026-02-15T12:30:00.000Z"
}
```

##### `400 Bad Request` (Invalid ID Format)
```json
{
  "error": "Invalid ID",
  "message": "Invalid product ID format"
}
```

##### `404 Not Found` (Product Does Not Exist)
```json
{
  "error": "Not found",
  "message": "Product not found"
}
```

##### `500 Internal Server Error`
```json
{
  "error": "Server error",
  "message": "Failed to fetch product"
}
```

---

## 3. Converted OpenAPI 3.0 Specification (Prompt 2 Output)

```yaml
openapi: 3.0.0
info:
  title: Products REST API
  description: Public API for managing catalog products, filtering, and retrieval.
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
    description: Production Server
paths:
  /api/products:
    get:
      summary: List Products
      description: Get a paginated list of catalog products with optional filtering and sorting.
      operationId: listProducts
      parameters:
        - in: query
          name: category
          schema:
            type: string
          description: Filter products by category string.
        - in: query
          name: minPrice
          schema:
            type: number
          description: Minimum product price filter ($gte).
        - in: query
          name: maxPrice
          schema:
            type: number
          description: Maximum product price filter ($lte).
        - in: query
          name: sort
          schema:
            type: string
            default: createdAt
          description: Field to sort by.
        - in: query
          name: order
          schema:
            type: string
            enum: [asc, desc]
            default: desc
          description: Sort direction.
        - in: query
          name: page
          schema:
            type: integer
            minimum: 1
            default: 1
          description: Page number for pagination.
        - in: query
          name: limit
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: Items per page limit.
        - in: query
          name: inStock
          schema:
            type: boolean
          description: When true, returns only products with stockQuantity > 0.
      responses:
        '200':
          description: Successful product retrieval.
          content:
            application/json:
              schema:
                type: object
                properties:
                  products:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '500':
          description: Internal Server Error.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /api/products/{productId}:
    get:
      summary: Get Product by ID
      description: Retrieve details for a single product by MongoDB ObjectId.
      operationId: getProductById
      parameters:
        - in: path
          name: productId
          required: true
          schema:
            type: string
          description: 24-character MongoDB ObjectId string.
      responses:
        '200':
          description: Product found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          description: Invalid Product ID format.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Product not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Server Error.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    Product:
      type: object
      required:
        - _id
        - name
        - price
        - category
        - stockQuantity
      properties:
        _id:
          type: string
          example: "61fa9bcf5c130b2e6d675432"
        name:
          type: string
          example: "Wireless Headphones"
        description:
          type: string
          example: "High-quality wireless headphones with noise cancellation"
        price:
          type: number
          format: float
          example: 89.99
        category:
          type: string
          example: "electronics"
        stockQuantity:
          type: integer
          example: 45
        createdAt:
          type: string
          format: date-time
          example: "2026-01-10T10:00:00.000Z"
        updatedAt:
          type: string
          format: date-time
          example: "2026-02-15T12:30:00.000Z"
    Pagination:
      type: object
      properties:
        total:
          type: integer
          example: 42
        page:
          type: integer
          example: 1
        limit:
          type: integer
          example: 20
        pages:
          type: integer
          example: 3
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
          example: "Not found"
        message:
          type: string
          example: "Product not found"
```

---

## 4. Developer Usage Guide (Prompt 3 Output)

# Quickstart Developer Guide: Integrating Products API

**Target Audience**: Frontend & Full-Stack Developers  
**Tone**: Technical, clear, and actionable

---

### 1. Base URL & Authentication
* **Base URL**: `https://api.example.com/v1`
* **Authentication**: Read endpoints (`GET /api/products` and `GET /api/products/:productId`) are public and do not require API keys or Bearer Tokens.

---

### 2. Making Requests in JavaScript

#### Option A: Using `fetch` (Browser / Node 18+)

```javascript
/**
 * Fetch catalog products with pagination and category filtering
 */
async function fetchProducts({ category, minPrice, maxPrice, page = 1, limit = 20 } = {}) {
  const baseUrl = 'https://api.example.com/v1/api/products';
  
  // Construct query parameters cleanly
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (minPrice !== undefined) params.append('minPrice', minPrice);
  if (maxPrice !== undefined) params.append('maxPrice', maxPrice);
  params.append('page', page);
  params.append('limit', limit);

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error [${response.status}]: ${errorData.message}`);
    }

    const { products, pagination } = await response.json();
    console.log(`Fetched ${products.length} products (Page ${pagination.page}/${pagination.pages})`);
    return { products, pagination };
  } catch (err) {
    console.error("Failed to load products:", err.message);
    throw err;
  }
}

// Example invocation
fetchProducts({ category: 'electronics', minPrice: 50, maxPrice: 300 });
```

#### Option B: Fetching a single Product by ID

```javascript
/**
 * Fetch single product details with error handling
 */
async function getProductById(productId) {
  try {
    const response = await fetch(`https://api.example.com/v1/api/products/${productId}`);
    
    if (response.status === 400) {
      throw new Error("Invalid product ID format. ID must be a 24-character hex string.");
    }
    if (response.status === 404) {
      throw new Error("Product does not exist in catalog.");
    }
    if (!response.ok) {
      throw new Error("Server error occurred while retrieving product.");
    }

    const product = await response.json();
    return product;
  } catch (error) {
    console.error("getProductById failed:", error.message);
    return null;
  }
}
```

---

### 3. Error Code Handling Reference

| Status Code | Error Message | Cause | Resolution |
| :--- | :--- | :--- | :--- |
| `400 Bad Request` | `"Invalid product ID format"` | `productId` is not a 24-character hexadecimal MongoDB `ObjectId`. | Validate ID format on frontend before sending request. |
| `404 Not Found` | `"Product not found"` | No product matches the given `productId`. | Check ID validity or display "Item unavailable" state. |
| `500 Server Error` | `"Failed to fetch products"` | Unhandled database error or service disruption. | Implement exponential backoff retry. |

---

## 5. Reflections & Key Learnings

1. **Which parts of the API were most challenging to document?**
   * **Implicit Casting & Query Types**: Query string parameters in Express (`req.query`) arrive as strings. Documenting that `inStock === 'true'` requires strict string comparison and that `minPrice`/`maxPrice` undergo `parseFloat()` required line-by-line inspection of backend casting logic.
   * **CastError Differentiation**: Distinguishing a `400 Bad Request` (malformed Mongo ID format causing Mongoose `CastError`) vs a `404 Not Found` (valid 24-hex ID format, but document doesn't exist in DB) is critical for client error handling.

2. **How prompts were adjusted for better results?**
   * Prompt 1 was enhanced by instructing the AI to explicit check Mongoose catch blocks to detect hidden `CastError` status code mappings (`400` vs `500`).
   * Prompt 2 required explicit OpenAPI 3.0.0 component ref templates (`$ref: '#/components/schemas/Product'`) to make schema outputs clean and modular.

3. **Which documentation format was most effective?**
   * **Markdown**: Best for human developers reading GitHub / Wiki docs.
   * **OpenAPI 3.0**: Best for automated toolchains (Swagger UI, Postman collection generation, client SDK generators).

4. **Workflow Integration Plan**:
   * Integrate Swagger/OpenAPI doc generation into CI/CD build pipelines using JSDoc tags or automated route scanners to keep API specs up-to-date with code changes.
