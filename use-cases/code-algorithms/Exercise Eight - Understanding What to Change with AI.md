# Exercise Eight: Understanding What to Change with AI Submission

## Overview
This document represents the complete submission for **Exercise 8 - Understanding What to Change with AI**, analyzing code readability, function refactoring, and code duplication detection across Java (`UserMgr`), Python (`process_orders`), and JavaScript (`calculateUserStatistics`), accompanied by comprehensive reflection insights.

---

## Exercise 1: Code Readability & Security Improvement (Java)

### 1. Original Cryptic Code (`UserMgr`)
```java
class UserMgr {
    private List<U> u_list;
    private DBConn db;

    public UserMgr(DBConn d) {
        db = d;
        u_list = new ArrayList<>();
    }

    public boolean a(String un, String pw, String em) {
        if (un.length() < 3 || pw.length() < 8 || !em.contains("@")) {
            return false;
        }

        for (U user : u_list) {
            if (user.getUn().equals(un)) {
                return false;
            }
        }

        U nu = new U(un, pw, em);
        u_list.add(nu);
        boolean res = db.execute("INSERT INTO users VALUES ('" + un + "', '" + pw + "', '" + em + "')");
        return res;
    }

    public U f(String un) {
        for (U user : u_list) {
            if (user.getUn().equals(un)) {
                return user;
            }
        }
        return null;
    }
}
```

---

### 2. Readability & Code Smell Audit
1. **Cryptic Naming**: `UserMgr` $\rightarrow$ `UserManager`, `U` $\rightarrow$ `User`, `u_list` $\rightarrow$ `userList`, method `a` $\rightarrow$ `registerUser`, `f` $\rightarrow$ `findUserByUsername`.
2. **Critical Security Vulnerability (SQL Injection)**: String concatenation `"INSERT INTO users VALUES ('" + un + ..."` allows SQL injection attacks. Must use `PreparedStatement` with parameterized placeholders.
3. **Data Encapsulation**: Plaintext password storage in `User` class; needs password hashing (`BCrypt` / `Argon2`).

---

### 3. Refactored Java Implementation

```java
package com.example.users;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Manages user registration, lookup, and database persistence.
 */
public class UserManager {
    private final List<User> userCache;
    private final DatabaseConnection databaseConnection;

    public UserManager(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        this.userCache = new ArrayList<>();
    }

    /**
     * Registers a new user after validating inputs and checking for existing usernames.
     */
    public boolean registerUser(String username, String password, String email) {
        if (!isValidUserCredentials(username, password, email)) {
            return false;
        }

        if (findUserByUsername(username).isPresent()) {
            return false; // Username already taken
        }

        User newUser = new User(username, password, email);
        userCache.add(newUser);

        // Security fix: Use parameterized query to prevent SQL Injection
        String sql = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        return databaseConnection.executeUpdate(sql, username, password, email);
    }

    /**
     * Finds a user by username from the internal cache.
     */
    public Optional<User> findUserByUsername(String username) {
        return userCache.stream()
                .filter(user -> user.getUsername().equalsIgnoreCase(username))
                .findFirst();
    }

    private boolean isValidUserCredentials(String username, String password, String email) {
        return username != null && username.length() >= 3
            && password != null && password.length() >= 8
            && email != null && email.contains("@");
    }
}

/**
 * Immutable User domain model.
 */
class User {
    private final String username;
    private final String passwordHash;
    private final String email;

    public User(String username, String passwordHash, String email) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
    }

    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getEmail() { return email; }
}
```

---

## Exercise 2: Function Refactoring (Python)

### 1. Original Monolithic Function (`process_orders`)
```python
def process_orders(orders, inventory, customer_data):
    results = []
    total_revenue = 0
    error_orders = []

    for order in orders:
        item_id = order['item_id']
        quantity = order['quantity']
        customer_id = order['customer_id']

        if item_id not in inventory:
            error_orders.append({'order_id': order['order_id'], 'error': 'Item not in inventory'})
            continue

        if inventory[item_id]['quantity'] < quantity:
            error_orders.append({'order_id': order['order_id'], 'error': 'Insufficient quantity'})
            continue

        if customer_id not in customer_data:
            error_orders.append({'order_id': order['order_id'], 'error': 'Customer not found'})
            continue

        price = inventory[item_id]['price'] * quantity
        if customer_data[customer_id]['premium']:
            price = price * 0.9

        inventory[item_id]['quantity'] -= quantity

        shipping = 0
        if customer_data[customer_id]['location'] == 'domestic':
            if price < 50:
                shipping = 5.99
        else:
            shipping = 15.99

        tax = price * 0.08
        final_price = price + shipping + tax
        total_revenue += final_price

        results.append({
            'order_id': order['order_id'],
            'item_id': item_id,
            'quantity': quantity,
            'customer_id': customer_id,
            'price': price,
            'shipping': shipping,
            'tax': tax,
            'final_price': final_price
        })

    return {
        'processed_orders': results,
        'error_orders': error_orders,
        'total_revenue': total_revenue
    }
```

---

### 2. Refactoring Analysis
The original function violated the **Single Responsibility Principle (SRP)** by combining validation, inventory mutation, shipping calculations, tax math, and revenue tracking into a single 60-line loop.

#### Decomposed Modular Helpers:
1. `validate_order(order, inventory, customer_data)`: Returns error message or `None`.
2. `calculate_order_pricing(order, inventory, customer_data)`: Returns calculated pricing structure (`price`, `shipping`, `tax`, `final_price`).
3. `process_single_order(...)`: Handles single order pipeline execution.

---

### 3. Refactored Python Implementation

```python
from typing import Dict, List, Tuple, Optional

TAX_RATE = 0.08
PREMIUM_DISCOUNT = 0.90
DOMESTIC_SHIPPING_FEE = 5.99
INTERNATIONAL_SHIPPING_FEE = 15.99
FREE_SHIPPING_THRESHOLD = 50.00


def validate_order(order: Dict, inventory: Dict, customer_data: Dict) -> Optional[str]:
    """Validates order items against inventory and customer existence."""
    item_id = order.get('item_id')
    customer_id = order.get('customer_id')

    if item_id not in inventory:
        return 'Item not in inventory'
    if inventory[item_id]['quantity'] < order.get('quantity', 0):
        return 'Insufficient quantity'
    if customer_id not in customer_data:
        return 'Customer not found'

    return None


def calculate_shipping(price: float, location: str) -> float:
    """Calculates shipping cost based on price threshold and location."""
    if location == 'domestic':
        return 0.0 if price >= FREE_SHIPPING_THRESHOLD else DOMESTIC_SHIPPING_FEE
    return INTERNATIONAL_SHIPPING_FEE


def calculate_order_pricing(order: Dict, inventory: Dict, customer: Dict) -> Dict[str, float]:
    """Calculates base price, discounts, shipping, tax, and final total."""
    quantity = order['quantity']
    base_price = inventory[order['item_id']]['price'] * quantity

    # Premium customer discount
    discounted_price = base_price * PREMIUM_DISCOUNT if customer.get('premium') else base_price

    shipping = calculate_shipping(discounted_price, customer.get('location', 'domestic'))
    tax = discounted_price * TAX_RATE
    final_price = discounted_price + shipping + tax

    return {
        'price': discounted_price,
        'shipping': shipping,
        'tax': tax,
        'final_price': round(final_price, 2)
    }


def process_orders(orders: List[Dict], inventory: Dict, customer_data: Dict) -> Dict:
    """Processes a batch of orders, updating inventory and tracking revenue."""
    processed_orders = []
    error_orders = []
    total_revenue = 0.0

    for order in orders:
        error_msg = validate_order(order, inventory, customer_data)
        if error_msg:
            error_orders.append({'order_id': order['order_id'], 'error': error_msg})
            continue

        customer = customer_data[order['customer_id']]
        item_id = order['item_id']

        # Calculate pricing
        pricing = calculate_order_pricing(order, inventory, customer)

        # Mutate inventory
        inventory[item_id]['quantity'] -= order['quantity']

        # Update revenue tracker
        total_revenue += pricing['final_price']

        processed_orders.append({
            'order_id': order['order_id'],
            'item_id': item_id,
            'quantity': order['quantity'],
            'customer_id': order['customer_id'],
            **pricing
        })

    return {
        'processed_orders': processed_orders,
        'error_orders': error_orders,
        'total_revenue': round(total_revenue, 2)
    }
```

---

## Exercise 3: Code Duplication Detection (JavaScript)

### 1. Original Duplicate Code (`calculateUserStatistics`)
```javascript
function calculateUserStatistics(userData) {
  let totalAge = 0;
  for (let i = 0; i < userData.length; i++) { totalAge += userData[i].age; }
  const averageAge = totalAge / userData.length;

  let totalIncome = 0;
  for (let i = 0; i < userData.length; i++) { totalIncome += userData[i].income; }
  const averageIncome = totalIncome / userData.length;

  let totalScore = 0;
  for (let i = 0; i < userData.length; i++) { totalScore += userData[i].score; }
  const averageScore = totalScore / userData.length;

  let highestAge = userData[0].age;
  for (let i = 1; i < userData.length; i++) {
    if (userData[i].age > highestAge) highestAge = userData[i].age;
  }

  let highestIncome = userData[0].income;
  for (let i = 1; i < userData.length; i++) {
    if (userData[i].income > highestIncome) highestIncome = userData[i].income;
  }

  let highestScore = userData[0].score;
  for (let i = 1; i < userData.length; i++) {
    if (userData[i].score > highestScore) highestScore = userData[i].score;
  }

  return {
    age: { average: averageAge, highest: highestAge },
    income: { average: averageIncome, highest: highestIncome },
    score: { average: averageScore, highest: highestScore }
  };
}
```

---

### 2. Duplication & Pattern Analysis
The function contains **6 separate manual `for` loops** doing identical mathematical reductions (3 loops calculating sums for average, 3 loops finding maximums).

#### Refactoring Options:
1. **Generic Helper Function**: A reusable `getFieldStats(data, property)` helper.
2. **Single-Pass Array Reduction**: Iterate `userData` once with `Array.prototype.reduce()`.

---

### 3. Refactored JavaScript Implementation

```javascript
/**
 * Calculates average and maximum statistics for numeric user fields.
 *
 * @param {Array<Object>} userData - List of user objects containing age, income, and score.
 * @returns {Object} Metric summary containing age, income, and score statistics.
 */
function calculateUserStatistics(userData) {
  if (!Array.isArray(userData) || userData.length === 0) {
    return {
      age: { average: 0, highest: 0 },
      income: { average: 0, highest: 0 },
      score: { average: 0, highest: 0 }
    };
  }

  /**
   * Helper to compute average and maximum for any numeric property in an array of objects
   */
  const computeFieldStats = (dataset, key) => {
    const values = dataset.map(item => Number(item[key]) || 0);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const highest = Math.max(...values);

    return {
      average: Number((sum / dataset.length).toFixed(2)),
      highest
    };
  };

  return {
    age: computeFieldStats(userData, 'age'),
    income: computeFieldStats(userData, 'income'),
    score: computeFieldStats(userData, 'score')
  };
}
```

---

## Reflection Questions & Answers

### 1. Which prompting strategy did you find most useful? Why?
**Code Duplication Detection (Exercise 3)** was most impactful. Showing an AI repetitive loops instantly prompts it to suggest functional abstractions (`Array.map`, `reduce`, `Math.max`), cutting boilerplate code by over 70%.

### 2. What kinds of improvements did the AI suggest that you might not have thought of?
In Java (Exercise 1), the AI highlighted **SQL Injection vulnerabilities** (`INSERT INTO users VALUES ('" + un + ...'`) and `Optional<User>` return types rather than merely renaming obscure single-letter variables (`a`, `f`, `u_list`).

### 3. Were there any suggestions the AI made that you disagreed with? Why?
Yes. In Python (Exercise 2), some AI prompts suggested over-abstracting simple shipping calculations into an abstract factory/strategy pattern. For a simple 3-tier shipping function, adding multi-class inheritance adds unnecessary complexity for junior developers. A clean helper function (`calculate_shipping`) is much clearer.

### 4. How might you adapt these prompts for your specific codebase or tech stack?
* Include project linting rules and framework conventions in the prompt (e.g. *"Follow Airbnb JavaScript Style Guide"* or *"Use Java 17 records & Optional"*).
* Specify strict error-handling requirements for database or network calls.

### 5. What safeguards would you put in place before applying AI-suggested refactoring to production code?
1. **Automated Unit & Integration Test Suite**: Never apply refactoring without passing pre-existing test suites.
2. **Peer Code Review**: Human verification of security and domain logic.
3. **Static Analysis & Linters**: Run `ESLint`, `SonarQube`, or `Pylint` to catch regressions.
