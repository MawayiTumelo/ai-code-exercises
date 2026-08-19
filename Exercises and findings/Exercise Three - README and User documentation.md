# Exercise Three: README and User Documentation Submission

## Overview
This document represents the complete submission for **Exercise 3 - README and User Guide Documentation**, demonstrating the application of AI prompting strategies (Prompt 1: Project README Generation, Prompt 2: Step-by-Step Feature Guide Creation, and Prompt 3: FAQ Document Generation) for the JavaScript/Node.js **TaskManager CLI** system.

---

## 1. Selected Project Information

* **Project Name**: TaskManager CLI
* **Description**: A developer-focused command-line interface for managing tasks, supporting natural language text parsing, automatic priority calculation, tag management, status updates, and JSON persistence.
* **Key Features**:
  * Free-form text parser for inline metadata extraction (`!priority`, `@tag`, `#date`).
  * Automated priority scoring based on due date proximity and priority weight.
  * Task creation, filtering (by status, priority, overdue state), tag manipulation, and progress statistics.
  * Local JSON storage persistence (`tasks.json`).
  * Comprehensive Jest test suite.
* **Technologies Used**: Node.js, Commander.js, UUID, Jest.
* **Project Structure**:
  ```
  /TaskManager
  ├── cli.js                  # CLI command definitions & entry point
  ├── app.js                  # TaskManager application controller
  ├── models.js               # Task model & TaskPriority/TaskStatus enums
  ├── storage.js              # TaskStorage JSON read/write persistence
  ├── task_parser.js          # Free-form text parsing algorithm
  ├── task_priority.js        # Dynamic score & priority calculation
  ├── task_list_merge.js      # List merging & deduplication utility
  ├── package.json            # Project dependencies & scripts
  └── /tests                  # Unit & integration Jest test suites
  ```

---

## 2. Comprehensive Project README (Prompt 1 Output)

```markdown
# TaskManager CLI

A command-line task management utility for developers who want fast, terminal-native task creation, priority scoring, tag management, and due date tracking.

---

## Key Features

- **Natural Language Parsing**: Create tasks from single free-form text strings using inline flags (`!urgent`, `@work`, `#tomorrow`).
- **Dynamic Priority Scoring**: Automatically calculates task urgency scores based on base priority weights and due date proximity.
- **Task Filtering & Organization**: Filter tasks by status (`todo`, `in_progress`, `review`, `done`), priority (`1-4`), or overdue status.
- **Tag Management**: Add or remove custom tags on existing tasks.
- **Task Statistics**: View complete task metrics, breakdown by status/priority, and 7-day completion velocity.
- **File-Based Persistence**: Saves all task data cleanly in a local `tasks.json` file.

---

## Installation

### Prerequisites
- Node.js (v14.0 or higher recommended)
- npm (comes bundled with Node.js)

### Setup Instructions

1. Clone or download the repository:
   ```bash
   git clone https://github.com/example/task-manager.git
   cd task-manager/javascript/TaskManager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Make `cli.js` executable globally on Unix systems:
   ```bash
   chmod +x cli.js
   npm link
   ```

---

## Basic Usage

Run commands directly via `node cli.js` (or `taskmanager` if linked):

### Create a Task

```bash
# Standard task creation
node cli.js create "Complete project proposal" -d "Write final draft" -p 3 -u 2026-12-31 -t "work,coding"

# Quick creation using natural text parsing
node cli.js parse "Implement user auth @backend !urgent #friday"
```

### List & Filter Tasks

```bash
# List all tasks
node cli.js list

# Filter by status (todo, in_progress, review, done)
node cli.js list -s in_progress

# Filter by high priority (1=Low, 2=Medium, 3=High, 4=Urgent)
node cli.js list -p 3

# Show overdue tasks
node cli.js list -o
```

### Update & Delete Tasks

```bash
# Change task status
node cli.js status <task_id> in_progress

# Change priority
node cli.js priority <task_id> 4

# Add or remove tags
node cli.js tag <task_id> urgent
node cli.js untag <task_id> urgent

# Delete a task
node cli.js delete <task_id>
```

### View Task Statistics

```bash
node cli.js stats
```

---

## Configuration Options

TaskManager CLI uses environment variables and default file configurations:

| Configuration | Flag / Setting | Default Value | Description |
| :--- | :--- | :--- | :--- |
| Storage File | `STORAGE_PATH` | `tasks.json` | Path to JSON file where tasks are saved. |
| Default Priority | `-p, --priority` | `2` (MEDIUM) | Default priority assigned when omitted. |
| Date Format | `-u, --due` | `YYYY-MM-DD` | Input format for task due dates. |

---

## Code Structure Overview

* **`cli.js`**: Commander.js CLI entry point mapping terminal inputs to application handlers.
* **`app.js`**: Core controller managing business operations, Task creation, and storage interactions.
* **`models.js`**: Data models for `Task`, `TaskStatus`, and `TaskPriority` enumerations.
* **`storage.js`**: File storage wrapper handling JSON reading, writing, and atomic updates to `tasks.json`.
* **`task_parser.js`**: Text parser extracting `@tag`, `!priority`, and `#date` markers from input strings.
* **`task_priority.js`**: Priority scoring algorithm ranking tasks based on due date urgency.

---

## Troubleshooting

### Common Issues

#### 1. `'jest' is not recognized` when running `npm test`
* **Cause**: Node dependencies are not installed in the workspace.
* **Fix**: Run `npm install` inside the project folder before running tests.

#### 2. `Invalid date format. Use YYYY-MM-DD`
* **Cause**: Due date string passed via `-u` or `#date` could not be parsed.
* **Fix**: Ensure dates follow `YYYY-MM-DD` or use supported relative terms (`#today`, `#tomorrow`).

---

## Contributing

1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/new-parser`).
3. Run tests before committing (`npm test`).
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Open a Pull Request.

---

## License

Distributed under the MIT License.
```

---

## 3. Step-by-Step Feature Guide (Prompt 2 Output)

# How to Parse Free-Form Text Input in TaskManager CLI

**Target Audience**: Developers & CLI Users  
**Skill Level**: Beginner to Intermediate  
**Goal**: Learn how to create tasks using single-line free-form text strings with inline priority (`!`), tag (`@`), and date (`#`) markers.

---

### Prerequisites
* TaskManager CLI installed and configured.
* Access to a terminal shell.

---

### Step 1: Understand Inline Marker Syntax

TaskManager CLI parses inline markers embedded anywhere inside your task text string:

| Marker Type | Syntax | Example | Result |
| :--- | :--- | :--- | :--- |
| **Priority** | `!1` to `!4` or `!low`..`!urgent` | `!urgent` | Sets priority to `4` (URGENT). |
| **Tags** | `@tagname` | `@frontend` `@css` | Adds `"frontend"` and `"css"` to tags array. |
| **Due Date** | `#today`, `#tomorrow`, `#friday`, `#YYYY-MM-DD` | `#tomorrow` | Calculates and sets `dueDate` object. |

> [!IMPORTANT]
> Always ensure a space precedes inline markers (e.g., `Buy milk @shopping` not `Buy milk@shopping`).

---

### Step 2: Run the Text Parser Command

Open your terminal and run `node cli.js parse` followed by your free-form task string enclosed in quotes:

```bash
node cli.js parse "Review pull request for auth module @code-review !high #tomorrow"
```

---

### Step 3: Verify Parsed Task Output

The CLI will parse the input string and return the structured task confirmation:

```
Task created successfully!
ID:          e4b2a1c0-891a-4f32
Title:       Review pull request for auth module
Priority:    HIGH (3)
Due Date:    2026-07-24 (Tomorrow)
Tags:        code-review
Status:      TODO
```

Notice that `@code-review`, `!high`, and `#tomorrow` were extracted and stripped, leaving a clean task title `"Review pull request for auth module"`.

---

### Step 4: Verify Task Score & Priority Ranking

Inspect the task in your task list to verify its calculated score:

```bash
node cli.js list -p 3
```

The algorithm evaluates the task score:
$$\text{Score} = (\text{Priority Weight} \times 10) + \text{Due Date Bonus}$$
For a `HIGH` priority task (`30` pts) due tomorrow (`15` pts bonus), the calculated urgency score is **45**.

---

### Step-by-Step Troubleshooting

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Tag included in task title | Missing space before `@` (e.g., `item@work`) | Add space before `@` flag (`item @work`). |
| Priority set to default `MEDIUM` | Typo in priority flag (e.g. `!urgnt`) | Use valid names (`!low`, `!medium`, `!high`, `!urgent`) or numbers (`!1` to `!4`). |
| Due date not recognized | Unsupported date format | Use ISO `YYYY-MM-DD` or standard relative terms (`today`, `tomorrow`, `friday`). |

---

## 4. FAQ Document (Prompt 3 Output)

# TaskManager CLI - Frequently Asked Questions (FAQ)

### Getting Started

#### Q1: What is TaskManager CLI?
TaskManager CLI is a developer-focused terminal tool for creating, organizing, tracking, and prioritizing tasks without leaving your terminal environment.

#### Q2: How do I install TaskManager CLI?
Install dependencies with `npm install` inside the project folder. You can link the binary globally by running `npm link` inside the project root.

---

### Features & Functionality

#### Q3: Where are my tasks stored?
Tasks are stored locally in `tasks.json` in the root of the TaskManager project directory.

#### Q4: How does automatic priority scoring work?
TaskManager CLI calculates an internal urgency score for each task based on:
1. **Base Priority**: LOW (10 pts), MEDIUM (20 pts), HIGH (30 pts), URGENT (40 pts).
2. **Due Date Proximity**: Overdue (+30 pts), Due Today (+20 pts), Due within 2 Days (+15 pts), Due within 7 Days (+10 pts).

#### Q5: Can I assign multiple tags to a single task?
Yes! When using `node cli.js create`, pass comma-separated tags (`-t "work,urgent,bug"`). When using `node cli.js parse`, include multiple `@` markers (e.g., `@work @bug`).

---

### Troubleshooting & Common Errors

#### Q6: I edited `tasks.json` manually and now the CLI crashes. How do I fix it?
If `tasks.json` contains invalid JSON syntax, backup the corrupted file and delete it or run:
```bash
echo "[]" > tasks.json
```
The CLI will automatically re-initialize a clean task array on the next command.

#### Q7: Why are my overdue tasks not showing up?
Ensure your task due date was entered in `YYYY-MM-DD` format and that the status is not `done`. Run `node cli.js list -o` to view only pending overdue tasks.

---

## 5. Reflections & Key Learnings

1. **Which aspects of the project were most challenging to document?**
   * **CLI Command Syntax vs. Free-Form Text Parsing**: Clarifying the distinction between explicit flags (`node cli.js create -p 3 -u 2026-12-31`) and natural language parsing (`node cli.js parse "Task !3 #2026-12-31"`) required explicit comparative tables in the README and feature guide.
   * **Score Calculation Formula**: Documenting how `task_priority.js` combines base weights and relative day offsets required clear mathematical definitions.

2. **How prompts were adjusted for better results?**
   * **Prompt 1 (README)**: Adjusted to explicitly require prerequisite node version checks and troubleshooting sections for NPM global linking.
   * **Prompt 2 (Step-by-Step Guide)**: Configured with clear step boundaries (Prerequisites $\rightarrow$ Marker Syntax $\rightarrow$ CLI Command $\rightarrow$ Output Verification $\rightarrow$ Troubleshooting).

3. **What was learned about document structure and organization?**
   * Keeping code blocks copy-pasteable and organizing CLI options into markdown tables significantly improves document readability for developers.

4. **Workflow Integration Plan**:
   * Maintain a `docs/` folder in git repositories containing READMEs, Step-by-Step guides, and FAQs, updating them alongside feature pull requests.
