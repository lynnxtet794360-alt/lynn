async function changePassword() {
    const oldPassword = prompt("Old Password:");
    const newPassword = prompt("New Password:");

    const res = await fetch("/change-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();
    alert(data.message);
}