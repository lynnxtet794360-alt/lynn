// ================= REGISTER =================
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

// ================= LOGIN =================
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
        document.getElementById("msg").style.color = "green";
        localStorage.setItem("token", data.token);
    } else {
        document.getElementById("msg").style.color = "red";
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("token");
    document.getElementById("msg").innerText = "Logged out ✅";
}

// ================= PROFILE =================
async function profile() {
    const res = await fetch("/profile", {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
}

// ================= USERS (ADMIN) =================
async function users() {
    const res = await fetch("/users", {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
}

// ================= DELETE USER (ADMIN) =================
async function deleteUser(id) {
    const res = await fetch("/user/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();
    alert(data.message);
}