async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  document.getElementById("msg").innerText = data.message;
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  document.getElementById("msg").innerText = data.message;

  if (data.success) {
    localStorage.setItem("token", data.token);
    window.location.href = "/dashboard.html";
  }
}

async function loadProfile() {
  const token = localStorage.getItem("token");

  const res = await fetch("/profile", {
    headers: { Authorization: token }
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("userInfo").innerText =
      `Username: ${data.user.username} | Role: ${data.user.role}`;
  }
}

async function loadUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch("/users", {
    headers: { Authorization: token }
  });

  const data = await res.json();

  document.getElementById("totalUsers").innerText = data.length;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}

window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadUsers();
});