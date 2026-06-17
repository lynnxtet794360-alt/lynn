const token = localStorage.getItem("accessToken");

if (!token) {
  window.location.href = "/";
}

async function loadProfile() {
  const res = await fetch("/profile", {
    headers: {
      Authorization: token
    }
  });

  const data = await res.json();

  document.getElementById("userInfo").innerText =
    "User ID: " + data.user.id + " | Role: " + data.user.role;
}

loadProfile();

function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
}