async function login() {

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await res.json();

    document.getElementById("msg").innerText = data.message;

    if(data.success){
        document.getElementById("msg").style.color = "green";

        localStorage.setItem(
            "token",
            data.token
        );

    }else{
        document.getElementById("msg").style.color = "red";
    }
}