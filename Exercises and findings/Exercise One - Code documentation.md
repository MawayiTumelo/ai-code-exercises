# Exercise One: Code Documentation Submission

## Overview
This document represents the complete submission for **Exercise One: Code Documentation**, demonstrating the application of AI prompting strategies (Prompt 1: Comprehensive Function Documentation and Prompt 2: Intent & Logic Explanation) to document, analyze, and refine JavaScript code.

---

## 1. Selected Original Code

**Source File**: [`use-cases/code-algorithms/javascript/TaskManager/task_parser.js`](file:///c:/Users/Admin/OneDrive/Desktop/ai-code-exercises-main/use-cases/code-algorithms/javascript/TaskManager/task_parser.js#L3-L145)

```javascript
const {TaskPriority, Task} = require("./models");

function parseTaskFromText(text) {
  let title = text.trim();
  let priority = TaskPriority.MEDIUM;
  let dueDate = null;
  let tags = [];

  // Extract priority markers (!N or !name)
  const priorityMatches = title.match(/\s!([1-4]|urgent|high|medium|low)\b/i);
  if (priorityMatches) {
    const priorityText = priorityMatches[1].toLowerCase();
    title = title.replace(/\s!([1-4]|urgent|high|medium|low)\b/i, '');

    if (priorityText === '1' || priorityText === 'low') {
      priority = TaskPriority.LOW;
    } else if (priorityText === '2' || priorityText === 'medium') {
      priority = TaskPriority.MEDIUM;
    } else if (priorityText === '3' || priorityText === 'high') {
      priority = TaskPriority.HIGH;
    } else if (priorityText === '4' || priorityText === 'urgent') {
      priority = TaskPriority.URGENT;
    }
  }

  // Extract tags (@tag)
  const tagRegex = /\s@(\w+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(text)) !== null) {
    tags.push(tagMatch[1]);
  }

  title = title.replace(/\s@\w+/g, '');

  // Extract date markers (#date)
  const dateRegex = /\s#(\w+)/g;
  const dates = [];
  let dateMatch;
  while ((dateMatch = dateRegex.exec(text)) !== null) {
    dates.push(dateMatch[1]);
  }

  title = title.replace(/\s#\w+/g, '');

  // Try to parse date references
  if (dates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const lowerDateStr = dateStr.toLowerCase();

      if (lowerDateStr === 'today' || lowerDateStr === 'now') {
        dueDate = today;
        break;
      } else if (lowerDateStr === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        dueDate = tomorrow;
        break;
      } else if (lowerDateStr === 'next_week' || lowerDateStr === 'nextweek') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        dueDate = nextWeek;
        break;
      } else if (['monday', 'mon', 'tuesday', 'tue', 'wednesday', 'wed',
                  'thursday', 'thu', 'friday', 'fri', 'saturday', 'sat',
                  'sunday', 'sun'].includes(lowerDateStr)) {
        const dayMap = {
          'monday': 1, 'mon': 1,
          'tuesday': 2, 'tue': 2,
          'wednesday': 3, 'wed': 3,
          'thursday': 4, 'thu': 4,
          'friday': 5, 'fri': 5,
          'saturday': 6, 'sat': 6,
          'sunday': 0, 'sun': 0
        };

        dueDate = getNextWeekday(today, dayMap[lowerDateStr]);
        break;
      }

      // Try to parse as YYYY-MM-DD
      const dateComponents = lowerDateStr.split('-');
      if (dateComponents.length === 3) {
        const parsedDate = new Date(
          parseInt(dateComponents[0]),
          parseInt(dateComponents[1]) - 1,
          parseInt(dateComponents[2])
        );

        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate;
          break;
        }
      }
    }
  }

  title = title.replace(/\s+/g, ' ').trim();

  const task = new Task(title);
  task.priority = priority;
  task.dueDate = dueDate;
  task.tags = tags;

  return task;
}
```

---

## 2. Documentation Generated Using Prompt 1 (Comprehensive Function Documentation)

```javascript
/**
 * Parses free-form text to extract task metadata (title, priority, due date, and tags)
 * and returns a newly instantiated `Task` object.
 *
 * Supported Inline Markers:
 * - Priority: `!1`, `!2`, `!3`, `!4` or `!low`, `!medium`, `!high`, `!urgent`
 * - Tags: `@tagname`
 * - Due Date: `#today`, `#tomorrow`, `#next_week`, `#weekday` (e.g. `#friday`), or `#YYYY-MM-DD`
 *
 * @param {string} text - The unparsed input text containing task title and inline markers.
 * @returns {Task} Instantiated Task model object containing extracted properties.
 * @throws {TypeError} If `text` is `null`, `undefined`, or a non-string type.
 *
 * @example
 * const task = parseTaskFromText("Buy milk @shopping !urgent #tomorrow");
 * console.log(task.title);    // "Buy milk"
 * console.log(task.priority); // 4 (TaskPriority.URGENT)
 * console.log(task.tags);     // ["shopping"]
 * console.log(task.dueDate);  // Date object for tomorrow
 *
 * @note
 * - Regular expressions require a leading whitespace character before `!`, `@`, or `#`.
 * - If multiple date/priority markers are supplied, only the first matching marker is applied.
 */
```

---

## 3. Insights and Analysis Generated Using Prompt 2 (Intent & Logic Explanation)

### 1. High-Level Intent
`parseTaskFromText` acts as a natural language parser for CLI/text-based task input. It allows users to quickly write structured tasks in a single line (similar to Todoist or Slack syntax) by extracting priority flags (`!`), tag markers (`@`), and date tokens (`#`) while retaining the clean remaining text as the task title.

### 2. Step-by-Step Logic Breakdown
1. **Initialization**: Trims whitespace and sets default state (`priority = TaskPriority.MEDIUM`, `dueDate = null`, `tags = []`).
2. **Priority Extraction**: Matches `\s!([1-4]|urgent|high|medium|low)\b` case-insensitively, maps matched token to `TaskPriority` enum, and strips the flag from `title`.
3. **Tag Extraction**: Executes global regex `\s@(\w+)` over input string, collects all tag names into `tags` array, and strips `@tag` tokens from `title`.
4. **Date Marker Extraction**: Executes global regex `\s#(\w+)` to collect all `#date` tokens into a `dates` array and strips them from `title`.
5. **Date Resolution**: Iterates through extracted date tokens until the first valid candidate resolves:
   - Relative terms (`today`/`now`, `tomorrow`, `next_week`/`nextweek`)
   - Weekday names (`monday`..`sunday`, `mon`..`sun`) calculated via helper `getNextWeekday`
   - Explicit ISO dates (`YYYY-MM-DD`) parsed into a local `Date` object
6. **Title Cleanup & Construction**: Collapses duplicate whitespace, instantiates a `Task` instance, assigns attributes, and returns the object.

### 3. Assumptions & Edge Cases Identified
* **Assumptions**:
  * Assumes inline markers are preceded by whitespace (e.g. `" @tag"`). Markers at position 0 (`"@tag task title"`) fail regex matching.
  * Assumes `text` is always a valid `string`.
* **Edge Cases & Flaws**:
  * **Global Regex Re-execution**: `tagRegex.exec(text)` uses original `text` while `title.replace(...)` replaces from `title`, creating potential mismatch if tags repeat.
  * **Same-Day Weekday Jump**: If today is Friday and `#friday` is specified, `getNextWeekday` advances 7 days into the future instead of assigning today.

### 4. Suggested Improvements
1. Fix leading-marker matching by supporting start-of-line anchor (`(^|\s)` instead of `\s`).
2. Centralize regex execution on `title` directly to avoid re-evaluating unmodified `text`.
3. Handle input type checking (`typeof text !== 'string'`).

---

## 4. Final Combined Documentation & Refactored Code Version

Here is the final combined code incorporating comprehensive JSDoc annotations, inline commentary, edge-case fixes, and refined logic:

```javascript
const { TaskPriority, Task } = require("./models");

/**
 * Parses free-form text input to construct a structured Task instance.
 *
 * Extracts inline metadata markers for priority (`!`), tags (`@`), and due dates (`#`),
 * while stripping the markers to produce a clean task title.
 *
 * @param {string} text - Raw input text containing task title and optional inline markers.
 * @returns {Task} Populated Task object.
 * @throws {TypeError} Throws if `text` parameter is not a string.
 *
 * @example
 * // Basic usage
 * const task = parseTaskFromText("Submit report !high @work #2026-08-01");
 * // Resulting Task properties:
 * // title: "Submit report"
 * // priority: 3 (HIGH)
 * // tags: ["work"]
 * // dueDate: 2026-08-01T00:00:00.000Z
 */
function parseTaskFromText(text) {
  if (typeof text !== 'string') {
    throw new TypeError("parseTaskFromText expects a string argument");
  }

  let title = text.trim();
  let priority = TaskPriority.MEDIUM;
  let dueDate = null;
  const tags = [];

  // Step 1: Extract priority marker (!1-!4 or !low-!urgent)
  const priorityRegex = /(?:^|\s)!([1-4]|urgent|high|medium|low)\b/i;
  const priorityMatch = title.match(priorityRegex);
  if (priorityMatch) {
    const pToken = priorityMatch[1].toLowerCase();
    title = title.replace(priorityRegex, '');

    const priorityMap = {
      '1': TaskPriority.LOW, 'low': TaskPriority.LOW,
      '2': TaskPriority.MEDIUM, 'medium': TaskPriority.MEDIUM,
      '3': TaskPriority.HIGH, 'high': TaskPriority.HIGH,
      '4': TaskPriority.URGENT, 'urgent': TaskPriority.URGENT
    };
    priority = priorityMap[pToken] || TaskPriority.MEDIUM;
  }

  // Step 2: Extract all tag markers (@tagname)
  const tagRegex = /(?:^|\s)@(\w+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(text)) !== null) {
    tags.push(tagMatch[1]);
  }
  title = title.replace(/(?:^|\s)@\w+/g, '');

  // Step 3: Extract date markers (#datename)
  const dateRegex = /(?:^|\s)#([\w-]+)/g;
  const dates = [];
  let dateMatch;
  while ((dateMatch = dateRegex.exec(text)) !== null) {
    dates.push(dateMatch[1]);
  }
  title = title.replace(/(?:^|\s)#[\w-]+/g, '');

  // Step 4: Resolve due date from first valid date token
  if (dates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const lowerDateStr = dateStr.toLowerCase();

      if (lowerDateStr === 'today' || lowerDateStr === 'now') {
        dueDate = today;
        break;
      } else if (lowerDateStr === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        dueDate = tomorrow;
        break;
      } else if (lowerDateStr === 'next_week' || lowerDateStr === 'nextweek') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        dueDate = nextWeek;
        break;
      } else if (['monday', 'mon', 'tuesday', 'tue', 'wednesday', 'wed',
                  'thursday', 'thu', 'friday', 'fri', 'saturday', 'sat',
                  'sunday', 'sun'].includes(lowerDateStr)) {
        const dayMap = {
          'sunday': 0, 'sun': 0,
          'monday': 1, 'mon': 1,
          'tuesday': 2, 'tue': 2,
          'wednesday': 3, 'wed': 3,
          'thursday': 4, 'thu': 4,
          'friday': 5, 'fri': 5,
          'saturday': 6, 'sat': 6
        };
        dueDate = getNextWeekday(today, dayMap[lowerDateStr]);
        break;
      }

      // Parse explicit YYYY-MM-DD dates
      const dateComponents = lowerDateStr.split('-');
      if (dateComponents.length === 3) {
        const parsedDate = new Date(
          parseInt(dateComponents[0], 10),
          parseInt(dateComponents[1], 10) - 1,
          parseInt(dateComponents[2], 10)
        );

        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate;
          break;
        }
      }
    }
  }

  // Step 5: Final title normalization
  title = title.replace(/\s+/g, ' ').trim();

  // Step 6: Construct and return Task model
  const task = new Task(title);
  task.priority = priority;
  task.dueDate = dueDate;
  task.tags = tags;

  return task;
}
```

---

## 5. Reflections & Key Learnings

1. **What parts were most challenging for the AI?**
   * **Hidden Assumptions & Regex Boundary Nuances**: Standard JSDoc generation (Prompt 1) accurately captures parameter signatures and return types, but tends to miss non-obvious runtime assumptions such as regex whitespace requirements (`\s@`) or date timezone calculations.
   * **Multi-token Priority Rules**: Recognizing that only the *first* date/priority token is evaluated while subsequent markers are stripped required line-by-line intent analysis (Prompt 2).

2. **What additional information was needed in prompts?**
   * Providing context about related domain objects (`Task`, `TaskPriority` enums) helped ensure return types and priority enumerations were accurately documented.

3. **How to use this dual-prompt approach in production projects?**
   * **Phase 1 (Prompt 1)**: Automatically generate initial API/JSDoc interface specifications for public modules.
   * **Phase 2 (Prompt 2)**: Perform logic audit and intent analysis to uncover edge cases, missing assertions, or implicit assumptions before code review.
   * **Phase 3 (Combined)**: Synthesize into clean, production-grade inline and external documentation.
