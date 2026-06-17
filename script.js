async function register() {
  const username = u.value;
  const password = p.value;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  msg.innerText = data.message;
}

async function login() {
  const username = u.value;
  const password = p.value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  msg.innerText = data.message;

  if (data.token) {
    localStorage.setItem("token", data.token);
  }
}

async function profile() {
  const res = await fetch("/profile", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });

  msg.innerText = JSON.stringify(await res.json(), null, 2);
}

async function users() {
  const res = await fetch("/users", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });

  msg.innerText = JSON.stringify(await res.json(), null, 2);
}

function logout() {
  localStorage.removeItem("token");
  msg.innerText = "Logged out ";
}