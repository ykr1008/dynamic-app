const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");

const API_URL = "https://jsonplaceholder.typicode.com/todos";

let tasks = [];

async function loadTasks() {
  statusMessage.textContent = "Loading tasks...";

  try {
    const response = await fetch(`${API_URL}?_limit=10`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    taskList.replaceChildren();
    statusMessage.textContent = "Unable to load tasks. Please try again.";
  }
}

function renderTasks(taskArray) {
  taskList.replaceChildren();

  if (taskArray.length === 0) {
    statusMessage.textContent = "No tasks found.";
    return;
  }

  statusMessage.textContent = "";

  const fragment = document.createDocumentFragment();

  taskArray.forEach((task) => {
    const listItem = document.createElement("li");
    const checkbox = document.createElement("input");
    const title = document.createElement("span");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    listItem.className = "task-item";
    listItem.dataset.id = task.id;

    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    title.className = "task-title";
    title.textContent = task.title;

    if (task.completed) {
      title.classList.add("completed");
    }

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.className = "task-action";

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.className = "task-action delete-button";

    listItem.append(checkbox, title, editButton, deleteButton);

    fragment.appendChild(listItem);
  });

  taskList.appendChild(fragment);
}

// Add a task
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) return;

  statusMessage.textContent = "Adding task...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        completed: false,
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const newTask = await response.json();

    tasks.unshift(newTask);
    renderTasks(tasks);
    taskForm.reset();
    taskInput.focus();
    statusMessage.textContent = "Task added.";
  } catch (error) {
    statusMessage.textContent = "Unable to add task. Please try again.";
  }
});

// Exactly one click listener on the task list
taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");

  if (!button || !taskList.contains(button)) return;

  const listItem = button.closest(".task-item");
  const taskId = Number(listItem.dataset.id);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) return;

  const action = button.dataset.action;

  if (action === "toggle") {
    const previousCompleted = task.completed;
    task.completed = button.checked;
    renderTasks(tasks);

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      statusMessage.textContent = "Task updated.";
    } catch (error) {
      task.completed = previousCompleted;
      renderTasks(tasks);
      statusMessage.textContent = "Update failed. The task was restored.";
    }
  }

  if (action === "edit") {
    const updatedTitle = prompt("Edit task title:", task.title);

    if (updatedTitle === null) return;

    const trimmedTitle = updatedTitle.trim();

    if (!trimmedTitle) {
      statusMessage.textContent = "Task title cannot be empty.";
      return;
    }

    const previousTitle = task.title;

    // Optimistic update
    task.title = trimmedTitle;
    renderTasks(tasks);

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      statusMessage.textContent = "Task edited.";
    } catch (error) {
      task.title = previousTitle;
      renderTasks(tasks);
      statusMessage.textContent =
        "Edit failed. The original title was restored.";
    }
  }

  if (action === "delete") {
    const confirmed = confirm(`Delete "${task.title}"?`);

    if (!confirmed) return;

    const originalIndex = tasks.findIndex((item) => item.id === taskId);

    // Optimistic deletion
    tasks = tasks.filter((item) => item.id !== taskId);
    renderTasks(tasks);

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      statusMessage.textContent = "Task deleted.";
    } catch (error) {
      tasks.splice(originalIndex, 0, task);
      renderTasks(tasks);
      statusMessage.textContent = "Delete failed. The task was restored.";
    }
  }
});

loadTasks();

const searchInput = document.getElementById("search-input");

let searchTimer;
let searchController;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);

  // Cancel the previous request if it is still running.
  if (searchController) {
    searchController.abort();
  }

  searchTimer = setTimeout(async () => {
    const query = searchInput.value.trim();

    statusMessage.textContent = "Searching...";

    // Create a controller for this search request.
    searchController = new AbortController();

    try {
      const response = await fetch(
        `${API_URL}?q=${encodeURIComponent(query)}&_limit=10`,
        { signal: searchController.signal },
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const results = await response.json();

      // Ignore results if the search box changed while waiting.
      if (query !== searchInput.value.trim()) {
        return;
      }

      renderTasks(
        results.filter((task) =>
          task.title.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    } catch (error) {
      // Aborting an old request is expected, not a search failure.
      if (error.name !== "AbortError") {
        statusMessage.textContent = "Search failed.";
      }
    }
  }, 300);
});

let lastScrollTime = 0;

window.addEventListener("scroll", () => {
  const now = Date.now();

  // Throttling is appropriate for scroll events because we want
  // to handle scrolling periodically while it continues, rather
  // than waiting until scrolling stops as debouncing would.
  if (now - lastScrollTime < 200) {
    return;
  }

  lastScrollTime = now;

  const visibleTaskCount = taskList.children.length;

  console.log(`Scroll event handled. Visible tasks: ${visibleTaskCount}`);
});
