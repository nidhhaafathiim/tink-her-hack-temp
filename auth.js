// SIGNUP FUNCTION
function signup() {

    let name = document.getElementById("signupName").value.trim();
    let email = document.getElementById("signupEmail").value.trim();
    let password = document.getElementById("signupPassword").value;

    if(name === "" || email === "" || password === ""){
        alert("Please fill all fields");
        return;
    }

    if(password.length < 6){
        alert("Password must be at least 6 characters");
        return;
    }

    // Store data in localStorage
    let user = {
        name: name,
        email: email,
        password: password
    };

    localStorage.setItem("dhooraUser", JSON.stringify(user));

    alert("Signup successful 🎉");

    window.location.href = "login.html";
}



// LOGIN FUNCTION
function login() {

    let email = document.getElementById("loginEmail").value.trim();
    let password = document.getElementById("loginPassword").value;

    let storedUser = JSON.parse(localStorage.getItem("dhooraUser"));

    if(storedUser === null){
        alert("No user found. Please sign up first.");
        return;
    }

    if(email === storedUser.email && password === storedUser.password){
        alert("Login successful 🚀");
        window.location.href = "body.html";
    } else {
        alert("Invalid email or password");
    }
}
