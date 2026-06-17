function login() {

    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    console.log("clicked");

    if(user === "admin" && pass === "1234") {
        document.getElementById("msg").innerText = "Login Success ✅";
        document.getElementById("msg").style.color = "green";
    } else {
        document.getElementById("msg").innerText = "Wrong Username or Password ❌";
        document.getElementById("msg").style.color = "red";
    }
}