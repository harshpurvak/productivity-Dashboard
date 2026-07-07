const dashboardView = document.getElementById("dashboardView");
const featureView = document.getElementById("featureView");
const backButton = document.getElementById("backButton");
const featurePanels = document.querySelectorAll(".feature-panel");
const themeToggle = document.getElementById("themeToggle");

const featureMap = {
  todo: "todoFeature",
  planner: "plannerFeature",
  goals: "goalsFeature",
  pomodoro: "pomodoroFeature",
  quote: "quoteFeature"
};

document.querySelectorAll(".feature-icon-button").forEach(function(card) {
  card.addEventListener("click", function() {
    openFeature(card.dataset.feature);
  });
});

backButton.addEventListener("click", showDashboard);
featureView.addEventListener("click", function(event) {
  if (event.target === featureView) {
    showDashboard();
  }
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape" && !featureView.classList.contains("hidden")) {
    showDashboard();
  }
});

function openFeature(name) {
  const panelId = featureMap[name];
  const panel = document.getElementById(panelId);

  if (!panel) return;

  featureView.classList.remove("hidden");
  featureView.setAttribute("aria-label", panel.dataset.title || "Productivity app");

  featurePanels.forEach(function(panel) {
    panel.classList.add("hidden");
  });

  panel.classList.remove("hidden");
}

function showDashboard() {
  featureView.classList.add("hidden");

  featurePanels.forEach(function(panel) {
    panel.classList.add("hidden");
  });
}

if (localStorage.getItem("dashboard-theme") === "dark") {
  document.body.classList.add("dark-theme");
  themeToggle.checked = true;
}

themeToggle.addEventListener("change", function() {
  if (themeToggle.checked) {
    document.body.classList.add("dark-theme");
    localStorage.setItem("dashboard-theme", "dark");
  } else {
    document.body.classList.remove("dark-theme");
    localStorage.setItem("dashboard-theme", "light");
  }
});

function updateDateTime() {
  const now = new Date();

  document.getElementById("dateText").textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  document.getElementById("timeText").textContent = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  updateBackground(now.getHours());
}

function updateBackground(hour) {
  document.body.classList.remove("morning-bg", "afternoon-bg", "evening-bg", "night-bg");

  if (hour >= 5 && hour < 12) {
    document.body.classList.add("morning-bg");
  } else if (hour >= 12 && hour < 17) {
    document.body.classList.add("afternoon-bg");
  } else if (hour >= 17 && hour < 21) {
    document.body.classList.add("evening-bg");
  } else {
    document.body.classList.add("night-bg");
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);

let todos = JSON.parse(localStorage.getItem("dashboard-todos")) || [];
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");

todoForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (text === "") return;

  todos.push({
    id: Date.now(),
    text: text,
    completed: false,
    important: false
  });

  todoInput.value = "";
  saveTodos();
});

todoList.addEventListener("click", function(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.closest(".list-item").dataset.id);
  const task = todos.find(function(item) {
    return item.id === id;
  });

  if (button.dataset.action === "complete") {
    task.completed = !task.completed;
  } else if (button.dataset.action === "important") {
    task.important = !task.important;
  } else if (button.dataset.action === "delete") {
    todos = todos.filter(function(item) {
      return item.id !== id;
    });
  }

  saveTodos();
});

function saveTodos() {
  localStorage.setItem("dashboard-todos", JSON.stringify(todos));
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = "";

  todos.forEach(function(task) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.dataset.id = task.id;

    if (task.completed) {
      li.classList.add("done");
    }

    li.innerHTML = `
      <button class="mini-button" data-action="complete" type="button">${task.completed ? "Done" : "Do"}</button>
      <span class="item-text ${task.important ? "important" : ""}">${task.text}</span>
      <button class="mini-button" data-action="important" type="button">!</button>
      <button class="mini-button delete" data-action="delete" type="button">X</button>
    `;

    todoList.appendChild(li);
  });
}

let plannerData = JSON.parse(localStorage.getItem("dashboard-planner")) || {};
const plannerSlots = document.getElementById("plannerSlots");
const dayHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function renderPlanner() {
  const currentHour = new Date().getHours().toString().padStart(2, "0") + ":00";
  plannerSlots.innerHTML = "";

  dayHours.forEach(function(time) {
    const row = document.createElement("div");
    row.className = "planner-slot";

    if (time === currentHour) {
      row.classList.add("current");
    }

    row.innerHTML = `
      <span class="planner-time">${time}</span>
      <textarea data-time="${time}" placeholder="Write your plan for this time">${plannerData[time] || ""}</textarea>
    `;

    plannerSlots.appendChild(row);
  });
}

plannerSlots.addEventListener("input", function(event) {
  if (event.target.tagName === "TEXTAREA") {
    plannerData[event.target.dataset.time] = event.target.value;
    localStorage.setItem("dashboard-planner", JSON.stringify(plannerData));
  }
});

let goals = JSON.parse(localStorage.getItem("dashboard-goals")) || [];
const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const goalList = document.getElementById("goalList");
const goalProgress = document.getElementById("goalProgress");

goalForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const text = goalInput.value.trim();
  if (text === "") return;

  goals.push({
    id: Date.now(),
    text: text,
    completed: false
  });

  goalInput.value = "";
  saveGoals();
});

goalList.addEventListener("click", function(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.closest(".list-item").dataset.id);

  if (button.dataset.action === "toggle") {
    const goal = goals.find(function(item) {
      return item.id === id;
    });
    goal.completed = !goal.completed;
  } else if (button.dataset.action === "delete") {
    goals = goals.filter(function(item) {
      return item.id !== id;
    });
  }

  saveGoals();
});

function saveGoals() {
  localStorage.setItem("dashboard-goals", JSON.stringify(goals));
  renderGoals();
}

function renderGoals() {
  goalList.innerHTML = "";

  const completedGoals = goals.filter(function(goal) {
    return goal.completed;
  }).length;

  goalProgress.textContent = completedGoals + " of " + goals.length + " completed";

  goals.forEach(function(goal) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.dataset.id = goal.id;

    if (goal.completed) {
      li.classList.add("done");
    }

    li.innerHTML = `
      <button class="mini-button" data-action="toggle" type="button">${goal.completed ? "Done" : "Do"}</button>
      <span class="item-text">${goal.text}</span>
      <span></span>
      <button class="mini-button delete" data-action="delete" type="button">X</button>
    `;

    goalList.appendChild(li);
  });
}

const timerDisplay = document.getElementById("timerDisplay");
const timerMessage = document.getElementById("timerMessage");
const workSeconds = 25 * 60;
let remainingSeconds = workSeconds;
let timerId = null;

document.getElementById("startTimer").addEventListener("click", startTimer);
document.getElementById("pauseTimer").addEventListener("click", pauseTimer);
document.getElementById("resetTimer").addEventListener("click", resetTimer);

function startTimer() {
  if (timerId !== null) return;

  timerMessage.textContent = "Focus time is running.";

  timerId = setInterval(function() {
    remainingSeconds--;
    renderTimer();

    if (remainingSeconds <= 0) {
      pauseTimer();
      timerMessage.textContent = "Session complete. Take a short break.";
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;

  if (remainingSeconds > 0) {
    timerMessage.textContent = "Paused.";
  }
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = workSeconds;
  timerMessage.textContent = "Ready when you are.";
  renderTimer();
}

function renderTimer() {
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  timerDisplay.textContent = minutes + ":" + seconds;
}

const fallbackQuotes = [
  {
    content: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe"
  },
  {
    content: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    content: "Small progress is still progress.",
    author: "Unknown"
  },
  {
    content: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    content: "Great things are done by a series of small things brought together.",
    author: "Vincent van Gogh"
  },
  {
    content: "You do not have to be perfect to make progress.",
    author: "Unknown"
  },
  {
    content: "Focus on being productive instead of busy.",
    author: "Tim Ferriss"
  }
];

document.getElementById("newQuoteButton").addEventListener("click", loadQuote);

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  return fallbackQuotes[randomIndex];
}

function loadDashboardQuote() {
  const quoteText = document.getElementById("dashboardQuoteText");
  const quoteAuthor = document.getElementById("dashboardQuoteAuthor");

  if (!quoteText || !quoteAuthor) return;

  const quote = getRandomQuote();
  quoteText.textContent = quote.content;
  quoteAuthor.textContent = "- " + quote.author;
}

async function loadQuote() {
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  quoteText.textContent = "Loading quote...";
  quoteAuthor.textContent = "";

  try {
    const response = await fetch("https://api.quotable.io/random");
    const data = await response.json();

    quoteText.textContent = data.content;
    quoteAuthor.textContent = "- " + data.author;
  } catch (error) {
    const quote = getRandomQuote();

    quoteText.textContent = quote.content;
    quoteAuthor.textContent = "- " + quote.author;
  }
}

const defaultWeatherLocation = {
  latitude: 28.6139,
  longitude: 77.209,
  label: "New Delhi"
};

async function loadWeather() {
  const location = document.getElementById("weatherLocation");
  const details = document.getElementById("weatherDetails");

  try {
    location.textContent = "Checking location";
    details.textContent = "Loading live weather...";

    const coordinates = await getWeatherCoordinates();
    const data = await fetchWeather(coordinates.latitude, coordinates.longitude);
    renderWeather(data, coordinates.label);
  } catch (error) {
    location.textContent = "Weather unavailable";
    details.textContent = error.message || "Please try again in a few minutes.";
  }
}

async function getWeatherCoordinates() {
  try {
    const position = await getPosition();

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      label: "Your Location"
    };
  } catch (error) {
    return defaultWeatherLocation;
  }
}

async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    lat: latitude,
    lon: longitude,
    units: "metric"
  });

  const url = "/api/weather?" + params.toString();
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(getWeatherErrorMessage(data, response.status));
  }

  return data;
}

function renderWeather(data, fallbackLabel) {
  const location = document.getElementById("weatherLocation");
  const details = document.getElementById("weatherDetails");
  const temperature = Math.round(data.main.temp);
  const humidity = data.main.humidity;
  const windSpeed = Math.round(data.wind.speed * 3.6);
  const condition = data.weather && data.weather[0] ? data.weather[0].description : "weather update";
  const cityName = data.name || fallbackLabel;

  location.textContent = cityName;
  details.textContent = "";
  details.appendChild(createWeatherGrid([
    {
      icon: "temperature",
      label: "Temp",
      value: temperature + " C"
    },
    {
      icon: "condition",
      label: "Sky",
      value: toTitleCase(condition)
    },
    {
      icon: "humidity",
      label: "Humidity",
      value: humidity + "%"
    },
    {
      icon: "wind",
      label: "Wind",
      value: windSpeed + " km/h"
    }
  ]));
}

function createWeatherGrid(items) {
  const grid = document.createElement("div");
  grid.className = "weather-grid";

  items.forEach(function(item) {
    const metric = document.createElement("div");
    const icon = document.createElement("span");
    const text = document.createElement("span");
    const label = document.createElement("span");
    const value = document.createElement("span");

    metric.className = "weather-metric";
    icon.className = "weather-icon";
    icon.innerHTML = getWeatherIcon(item.icon);
    text.className = "weather-text";
    label.className = "weather-label";
    value.className = "weather-value";

    label.textContent = item.label;
    value.textContent = item.value;

    text.appendChild(label);
    text.appendChild(value);
    metric.appendChild(icon);
    metric.appendChild(text);
    grid.appendChild(metric);
  });

  return grid;
}

function getWeatherIcon(type) {
  const icons = {
    temperature: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z"></path><path d="M10 9v8"></path></svg>',
    condition: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 18H8a5 5 0 1 1 1.07-9.88A7 7 0 0 1 22 11.5 4.5 4.5 0 0 1 17.5 18Z"></path></svg>',
    humidity: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s6 6.18 6 11a6 6 0 0 1-12 0c0-4.82 6-11 6-11Z"></path></svg>',
    wind: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3"></path><path d="M3 12h16"></path><path d="M3 16h11a3 3 0 1 1-3 3"></path></svg>'
  };

  return icons[type] || icons.condition;
}

function getWeatherErrorMessage(data, status) {
  if (status === 401) {
    return "OpenWeather API key is not active yet or is invalid.";
  }

  if (data && data.message) {
    return "OpenWeather error: " + data.message;
  }

  return "Weather request failed. Status " + status + ".";
}

function toTitleCase(text) {
  return text.replace(/\b\w/g, function(letter) {
    return letter.toUpperCase();
  });
}

function getPosition() {
  return new Promise(function(resolve, reject) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: 10 * 60 * 1000,
        timeout: 8000
      });
    } else {
      reject(new Error("Location is not supported."));
    }
  });
}

renderTodos();
renderPlanner();
renderGoals();
renderTimer();
loadDashboardQuote();
loadWeather();
