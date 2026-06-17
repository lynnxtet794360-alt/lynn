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
  }
}

function logout() {
  localStorage.removeItem("token");
  document.getElementById("msg").innerText = "Logged out ✅";
}

async function profile() {
  const res = await fetch("/profile", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });

  const data = await res.json();
  alert(JSON.stringify(data, null, 2));
}

async function users() {
  const res = await fetch("/users", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });

  const data = await res.json();
  alert(JSON.stringify(data, null, 2));
}