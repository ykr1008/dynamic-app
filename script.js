
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
    statusMessage.textContent =
      "Unable to load tasks. Please try again.";
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

    listItem.className = "task-item";
    checkbox.className = "task-checkbox";
    title.className = "task-title";

    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.disabled = true;
    checkbox.setAttribute("aria-label", "Task completed");

    title.textContent = task.title;

    if (task.completed) {
      title.classList.add("completed");
    }

    listItem.append(checkbox, title);
    fragment.appendChild(listItem);
  });

  taskList.appendChild(fragment);
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    return;
  }

  statusMessage.textContent = "Adding task...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
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
  } catch (error) {
    statusMessage.textContent =
      "Unable to add task. Please try again.";
  }
});

loadTasks();
