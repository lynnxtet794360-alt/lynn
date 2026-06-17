let token = localStorage.getItem("accessToken");

if (!token) {
  window.location.href = "/";
}

// ================= PROFILE =================
async function loadProfile() {
  try {
    const res = await fetch("/profile", {
      headers: {
        Authorization: token
      }
    });

    const data = await res.json();

    if (!data.success) {
      logout();
      return;
    }

    document.getElementById("userInfo").innerText =
      `ID: ${data.user.id} | Role: ${data.user.role}`;

  } catch (err) {
    console.log(err);
    logout();
  }
}

// ================= STATS =================
async function loadStats() {
  try {
    const res = await fetch("/users", {
      headers: {
        Authorization: token
      }
    });

    const data = await res.json();

    if (!Array.isArray(data)) {
      document.getElementById("totalUsers").innerText = 0;
      return;
    }

    document.getElementById("totalUsers").innerText = data.length;

  } catch (err) {
    console.log(err);
    document.getElementById("totalUsers").innerText = 0;
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
}

// ================= MENU TOGGLE =================
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}

// ================= AUTO LOAD =================
loadProfile();
loadStats();