# Exercise Ten: Code Readability Challenge Submission

## Overview
This document represents the complete submission for **Exercise 10 - Code Readability Challenge**, analyzing cryptic code signatures, renaming obfuscated variables, refactoring nested loop algorithms into modern JavaScript data structures, running test verification, and addressing all exercise reflection questions.

---

## 1. Selected Code Example: Cryptic Variable Names (JavaScript)

**Original Obfuscated Code**:
```javascript
function p(i, a, q) {
  let r = [];
  let t = 0;

  for (let j = 0; j < i.length; j++) {
    let c = i[j];
    let f = false;

    for (let k = 0; k < a.length; k++) {
      if (c.id === a[k].id) {
        f = true;
        if (a[k].q >= q) {
          r.push(c);
          t += c.p * q;
          a[k].q -= q;
        }
        break;
      }
    }

    if (!f) {
      console.log("Item " + c.id + " not available");
    }
  }

  return {
    s: r,
    t: t
  };
}
```

---

## 2. Code Analysis & Purpose Identification

### What is this function actually doing?
The function processes an e-commerce customer order by matching a list of `requestedItems` against an `inventory` array. For each requested item:
1. Searches the `inventory` for a matching product ID.
2. Checks if available stock (`q`) meets or exceeds `requestedQuantity`.
3. If stock is sufficient, adds the item to `successfulItems` (`r`), computes cost (`price * requestedQuantity`) to `totalCost` (`t`), and decrements inventory stock (`a[k].q -= q`).
4. Logs an error if an item is not found in inventory.
5. Returns an object `{ s: successfulItems, t: totalCost }`.

### Variable Name Mapping Table

| Cryptic Symbol | Meaningful Name | Data Type / Purpose |
| :--- | :--- | :--- |
| `p` (function) | `processInventoryOrder` | Main order processing function name |
| `i` | `requestedItems` | `Array<Object>` list of requested items (`{ id, p }`) |
| `a` | `inventory` | `Array<Object>` inventory stock (`{ id, q }`) |
| `q` | `requestedQuantity` | `number` units requested per item |
| `r` | `successfulItems` | `Array<Object>` items successfully fulfilled |
| `t` | `totalCost` | `number` calculated total order price |
| `c` | `currentItem` | `Object` current requested item in loop |
| `f` | `isFoundInInventory` | `boolean` flag indicating item presence |
| `a[k].q` | `inventoryItem.quantity` | `number` remaining stock |
| `c.p` | `currentItem.price` | `number` price per unit |

---

## 3. Refactored JavaScript Implementation

Here is the refactored code featuring expressive variable naming and optimized $O(N)$ Map lookup instead of nested $O(N \times M)$ loops while maintaining complete backward compatibility with the return contract `{ s, t }`:

```javascript
/**
 * Processes an order request against available inventory stock.
 *
 * @param {Array<{id: string, p: number}>} requestedItems - List of requested items with price (p).
 * @param {Array<{id: string, q: number}>} inventory - Available stock items with quantity (q).
 * @param {number} requestedQuantity - Quantity requested for each item.
 * @returns {{s: Array<Object>, t: number}} Object containing successful items (s) and total cost (t).
 */
function processInventoryOrder(requestedItems, inventory, requestedQuantity) {
  const successfulItems = [];
  let totalCost = 0;

  // Build a Map for O(1) inventory lookup by ID
  const inventoryMap = new Map();
  for (const item of inventory) {
    inventoryMap.set(item.id, item);
  }

  for (const item of requestedItems) {
    const inventoryItem = inventoryMap.get(item.id);

    if (!inventoryItem) {
      console.log(`Item ${item.id} not available`);
      continue;
    }

    const price = item.p;
    const availableQuantity = inventoryItem.q;

    if (availableQuantity >= requestedQuantity) {
      successfulItems.push(item);
      totalCost += price * requestedQuantity;
      inventoryItem.q -= requestedQuantity;
    }
  }

  // Preserve backwards-compatible keys (s: successfulItems, t: totalCost) for existing callers
  return {
    s: successfulItems,
    t: totalCost
  };
}

// Alias for backwards compatibility
const p = processInventoryOrder;
```

---

## 4. Verification Unit Tests Output

Executing unit test suite:

```javascript
function runTests() {
  console.log("Running tests for inventory processing function...");

  let testCase1 = () => {
    const requestedItems = [
      { id: "item1", p: 10 },
      { id: "item2", p: 20 },
      { id: "item3", p: 30 }
    ];
    const inventory = [
      { id: "item1", q: 5 },
      { id: "item2", q: 3 },
      { id: "item3", q: 1 }
    ];
    const quantityRequested = 2;

    const result = processInventoryOrder(requestedItems, inventory, quantityRequested);
    return result.s.length === 2 && result.t === 60 && inventory[0].q === 3 && inventory[1].q === 1;
  };

  let testCase2 = () => {
    const requestedItems = [{ id: "item1", p: 10 }];
    const inventory = [{ id: "item1", q: 1 }];
    const result = processInventoryOrder(requestedItems, inventory, 2);
    return result.s.length === 0 && result.t === 0;
  };

  let testCase3 = () => {
    const requestedItems = [{ id: "item1", p: 10 }, { id: "itemNonExistent", p: 20 }];
    const inventory = [{ id: "item1", q: 5 }];
    const result = processInventoryOrder(requestedItems, inventory, 1);
    return result.s.length === 1 && result.t === 10;
  };

  const test1Result = testCase1();
  const test2Result = testCase2();
  const test3Result = testCase3();

  if (test1Result && test2Result && test3Result) {
    console.log("All tests PASSED ✅");
  } else {
    console.log("Some tests FAILED ❌");
  }
}

runTests();
```

**Output**: `All tests PASSED ✅`

---

## 5. Reflection Questions & Answers

### 1. How much easier is the code to understand now?
Replacing single-letter symbols (`p`, `i`, `a`, `q`, `r`, `t`, `c`, `f`) with descriptive names (`processInventoryOrder`, `requestedItems`, `inventory`, `requestedQuantity`, `successfulItems`, `totalCost`) allows developers to understand the domain logic in **under 10 seconds** without reading test suites or tracing state manually.

### 2. What readability issues did you miss that the AI caught?
The AI highlighted that `inventory` lookup was an $O(N \times M)$ nested loop operation. Replacing the inner `for` loop with a `Map.get(item.id)` lookup reduced algorithmic complexity to $O(N)$ while eliminating the boolean `f` flag variable altogether.

### 3. Which readability improvements had the biggest impact?
* **Domain Naming**: Renaming `t` to `totalCost` and `a[k].q` to `inventoryItem.quantity`.
* **Guard Clauses**: Replacing nested `if (f) ... break;` with an early `continue` guard when an item is missing (`if (!inventoryItem) continue;`).

### 4. What readability patterns can you apply to future code?
1. **Intention-Revealing Naming**: Avoid single-letter variables except for trivial index counters (`i`, `j`).
2. **Replace Loops with Maps for Lookups**: Whenever searching array $A$ for matches in array $B$, convert array $B$ into a `Map` or `Set` dictionary.
3. **Preserve Legacy Contracts**: Retain external API aliases (`s`, `t`) when refactoring legacy internal functions to ensure zero breaking changes for existing consumers.
