# Exercise Fourteen: Getting Started with FastAPI Submission

## Overview
This document represents the complete submission for **Exercise 14 - Getting Started with FastAPI**, covering FastAPI fundamentals, comparison against Flask/Django, Pydantic schema validation, modular project structuring, custom exception handlers, interactive OpenAPI documentation, and a full To-Do List Management API implementation.

---

## Part 1: FastAPI Fundamentals & Glossary

### 1. What is FastAPI and how does it compare to Flask and Django?

| Feature | Flask | Django | FastAPI |
| :--- | :--- | :--- | :--- |
| **Framework Type** | Micro-framework | Full-stack Batteries-Included | High-performance Async Micro-framework |
| **Concurrency Model** | Synchronous (WSGI) | Sync (WSGI) / Async support | Asynchronous Native (ASGI via Starlette) |
| **Data Validation** | Manual / Marshmallow | Django ORM / Forms | Automated via Pydantic & Type Hints |
| **API Documentation** | Manual (Flasgger) | Manual (DRF OpenAPI) | **Automatic Interactive Docs** (`/docs` & `/redoc`) |
| **Performance** | Moderate | Moderate | **Ultra-Fast** (on par with NodeJS & Go) |

---

### 2. Core Concepts & Essential Glossary

* **ASGI (Asynchronous Server Gateway Interface)**: The spiritual successor to WSGI, enabling asynchronous Python web applications to handle WebSockets and HTTP/2 concurrently.
* **Pydantic**: Data validation and settings management library using Python type annotations. Enforces data constraints at runtime and generates OpenAPI schemas automatically.
* **Path Operations**: HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) combined with URL routes (e.g. `@app.get("/items/{item_id}")`).
* **Dependency Injection (`Depends`)**: Built-in system for modularly injecting database sessions, authentication context, and request options into route handlers.
* **OpenAPI & Swagger UI**: Standardized API specifications generated dynamically by FastAPI, hosted interactively at `/docs`.

---

## Part 2: Basic API Implementation (`main.py`)

```python
from fastapi import FastAPI
from typing import Optional

# Create FastAPI application instance
app = FastAPI(
    title="My First FastAPI App",
    description="A simple API built with FastAPI",
    version="0.1.0"
)

@app.get("/", tags=["root"])
async def root():
    """Root endpoint returning a simple JSON greeting."""
    return {"message": "Hello World from FastAPI!"}

@app.get("/items/{item_id}", tags=["items"])
async def read_item(item_id: int):
    """Retrieves an item by numeric path parameter."""
    return {"item_id": item_id, "message": f"You requested item {item_id}"}

@app.get("/search/", tags=["search"])
async def search_items(q: Optional[str] = None, skip: int = 0, limit: int = 10):
    """Searches for items using optional query parameters."""
    return {
        "query": q,
        "skip": skip,
        "limit": limit,
        "message": f"Searching for '{q}' (skipping {skip}, limiting to {limit})"
    }
```

### Running & Testing Instructions
```bash
pip install fastapi uvicorn
uvicorn main:app --reload
```
* **Root Endpoint**: `http://127.0.0.1:8000/`
* **Item Path Parameter**: `http://127.0.0.1:8000/items/42`
* **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`

---

## Part 3: Enhancing FastAPI with Modular Architecture & Pydantic

### 1. Recommended Production Directory Structure

```
my_fastapi_app/
├── app/
│   ├── __init__.py
│   ├── main.py          # Application creation & router registration
│   ├── models/          # Pydantic schemas
│   │   ├── __init__.py
│   │   └── item.py
│   ├── routes/          # API route handlers
│   │   ├── __init__.py
│   │   └── items.py
│   └── utils/           # Custom exception handlers & helpers
│       ├── __init__.py
│       └── exceptions.py
└── requirements.txt
```

---

### 2. Pydantic Models & Exception Handlers

#### `app/models/item.py`
```python
from pydantic import BaseModel, Field
from typing import Optional, List

class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of item")
    description: Optional[str] = Field(None, max_length=1000)
    price: float = Field(..., gt=0, description="Price must be positive")
    tags: List[str] = Field(default=[], description="List of tags")

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
```

#### `app/utils/exceptions.py`
```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

class ItemNotFoundError(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id
        self.message = f"Item with ID {item_id} not found"
        super().__init__(self.message)

def add_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ItemNotFoundError)
    async def item_not_found_handler(request: Request, exc: ItemNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": exc.message}
        )
```

---

## Part 4: Complete Challenge - To-Do List Management API

Here is the complete production implementation of a To-Do List Manager API featuring full CRUD operations, Pydantic schemas, completion state filtering, and custom exception handling:

```python
"""
FastAPI To-Do List Manager Application
"""

from enum import Enum
from datetime import date
from typing import Optional, List, Dict
from fastapi import FastAPI, APIRouter, Path, Query, status, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ==========================================
# 1. PYDANTIC SCHEMAS & ENUMS
# ==========================================

class TodoStatusFilter(str, Enum):
    ALL = "all"
    COMPLETED = "completed"
    PENDING = "pending"

class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120, description="To-Do title")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed description")
    due_date: Optional[date] = Field(None, description="Due date for the task")

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    due_date: Optional[date] = None
    completed: Optional[bool] = None

class TodoResponse(TodoBase):
    id: int
    completed: boolean = False

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "title": "Complete FastAPI Exercise",
                "description": "Build CRUD endpoints with Pydantic validation",
                "due_date": "2026-08-01",
                "completed": False
            }
        }

# ==========================================
# 2. CUSTOM EXCEPTIONS & HANDLERS
# ==========================================

class TodoNotFoundError(Exception):
    def __init__(self, todo_id: int):
        self.todo_id = todo_id
        self.message = f"To-Do item with ID {todo_id} does not exist."
        super().__init__(self.message)

def configure_exception_handlers(app: FastAPI):
    @app.exception_handler(TodoNotFoundError)
    async def todo_not_found_handler(request: Request, exc: TodoNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": exc.message}
        )

# ==========================================
# 3. ROUTE HANDLERS & IN-MEMORY STORE
# ==========================================

router = APIRouter(prefix="/todos", tags=["todos"])

# In-memory database simulation
todo_db: Dict[int, Dict] = {}
todo_counter: int = 0


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(todo: TodoCreate):
    """Create a new To-Do item."""
    global todo_counter
    todo_counter += 1

    new_todo = {
        "id": todo_counter,
        **todo.dict(),
        "completed": False
    }
    todo_db[todo_counter] = new_todo
    return new_todo


@router.get("/", response_model=List[TodoResponse])
async def list_todos(
    status_filter: TodoStatusFilter = Query(TodoStatusFilter.ALL, description="Filter by completion status"),
    skip: int = Query(0, ge=0, description="Items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max items per page")
):
    """List all To-Do items with optional status filtering and pagination."""
    items = list(todo_db.values())

    if status_filter == TodoStatusFilter.COMPLETED:
        items = [item for item in items if item["completed"] is True]
    elif status_filter == TodoStatusFilter.PENDING:
        items = [item for item in items if item["completed"] is False]

    return items[skip:skip + limit]


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int = Path(..., gt=0, description="To-Do item ID")):
    """Retrieve a single To-Do item by ID."""
    if todo_id not in todo_db:
        raise TodoNotFoundError(todo_id)
    return todo_db[todo_id]


@router.patch("/{todo_id}/complete", response_model=TodoResponse)
async def mark_todo_completed(todo_id: int = Path(..., gt=0)):
    """Mark a To-Do item as completed."""
    if todo_id not in todo_db:
        raise TodoNotFoundError(todo_id)

    todo_db[todo_id]["completed"] = True
    return todo_db[todo_id]


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int = Path(..., gt=0)):
    """Delete a To-Do item."""
    if todo_id not in todo_db:
        raise TodoNotFoundError(todo_id)

    del todo_db[todo_id]
    return None

# ==========================================
# 4. MAIN APP CREATION
# ==========================================

app = FastAPI(
    title="To-Do List Management API",
    description="Full-featured FastAPI application for managing tasks",
    version="1.0.0"
)

app.include_router(router)
configure_exception_handlers(app)

@app.get("/", tags=["root"])
async def root():
    return {"message": "Welcome to the To-Do List API", "docs": "/docs"}
```

---

## Reflection & Key Learnings

1. **Automatic Documentation**: FastAPI's instant `/docs` Swagger UI removes the need to write manual API docs or postman collections.
2. **Type Safety & Runtime Validation**: Pydantic models automatically reject invalid JSON payloads (e.g. invalid date strings or negative IDs) with detailed 422 HTTP responses.
3. **Clean Modular Organization**: Splitting schemas (`models`), endpoints (`routes`), and custom exceptions (`utils`) keeps codebase scalable and maintainable.
