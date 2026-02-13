// Search Button Logic
document.getElementById("searchBtn").addEventListener("click", function() {

    let destination = document.getElementById("searchInput").value.trim();

    if(destination === ""){
        alert("Please enter a destination!");
        return;
    }

    alert("Searching for: " + destination + " 🌍");

    // Future upgrade:
    // window.location.href = "destination.html?place=" + destination;
});
