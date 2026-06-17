let accessToken = "";
let refreshToken = "";

// REGISTER
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

// LOGIN
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;

    localStorage.setItem("refreshToken", refreshToken);

    document.getElementById("msg").innerText = "Login success ✅";
  } else {
    document.getElementById("msg").innerText = "Login failed ❌";
  }
}

// AUTO REFRESH
async function apiCall(url) {
  let res = await fetch(url, {
    headers: { Authorization: accessToken }
  });

  let data = await res.json();

  if (data.expired) {
    await refreshAccessToken();

    res = await fetch(url, {
      headers: { Authorization: accessToken }
    });

    data = await res.json();
  }

  return data;
}

// REFRESH TOKEN
async function refreshAccessToken() {
  const res = await fetch("/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: localStorage.getItem("refreshToken")
    })
  });

  const data = await res.json();

  if (data.success) {
    accessToken = data.accessToken;
  }
}

// PROFILE
async function profile() {
  const data = await apiCall("/profile");
  alert(JSON.stringify(data, null, 2));
}

// LOGOUT
async function logout() {
  await fetch("/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: localStorage.getItem("refreshToken")
    })
  });

  accessToken = "";
  refreshToken = "";
  localStorage.removeItem("refreshToken");

  document.getElementById("msg").innerText = "Logged out ✅";
}