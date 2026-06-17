const token = localStorage.getItem("accessToken");

if (!token) {
  window.location.href = "/";
}

// PROFILE
async function loadProfile() {
  const res = await fetch("/profile", {
    headers: {
      Authorization: token
    }
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("userInfo").innerText =
      `ID: ${data.user.id} | Role: ${data.user.role}`;
  }
}

// STATS (simple demo)
async function loadStats() {
  const res = await fetch("/users", {
    headers: {
      Authorization: token
    }
  });

  const data = await res.json();

  document.getElementById("totalUsers").innerText = data.length || 0;
}

// LOGOUT
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
}

// auto load
loadProfile();
loadStats();