<<<<<<< HEAD
// Toggle Chat
alert("AI Loaded");

document.getElementById("chatToggle").onclick = function(){
    document.getElementById("chatBox").style.display = "flex";
}

document.getElementById("closeChat").onclick = function(){
    document.getElementById("chatBox").style.display = "none";
}


// Send Message
function sendMessage(){

    let input = document.getElementById("userInput").value.trim();
    if(input === "") return;

    addMessage(input, "user");
    document.getElementById("userInput").value = "";

    let response = generateAIResponse(input);
    setTimeout(() => addMessage(response, "bot"), 500);
}


// Add Message
function addMessage(message, sender){

    let chat = document.getElementById("chatMessages");

    let div = document.createElement("div");
    div.className = sender === "user" ? "user-msg" : "bot-msg";
    div.innerText = message;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}


// SMART AI RESPONSE
function generateAIResponse(input){

    let text = input.toLowerCase();

    // Manglish detection
    if(text.includes("destination") ){
        return "Sure 😄 where you want to go?";
    }
    if(text.includes("budget") ){
        return "Sure 😄 how much you planning?";
    }
     if(text.includes("pokanam") || text.includes("venam")){
        return "Sure 😄 Evidekku pokanam? Budget ethra aanu?";
    }

    

    // Malayalam detection
    if(text.includes("യാത്ര") || text.includes("ബഡ്ജറ്റ്")){
        return "ശരി 😊 എവിടേക്ക് യാത്ര വേണം? എത്ര ദിവസമാണ്?";
    }

    // English detection
    if(text.includes("trip") || text.includes("travel")){
        return "Great! 🌍 Where do you want to go and what is your budget?";
    }

    // Budget planning
    if(text.includes("10000") || text.includes("15000") || text.includes("20000")){
        return "Awesome 🔥 Based on your budget, I can arrange travel, stay and food. How many days are you planning?";
    }

    return "signup.html";
}
=======
// Toggle Chat
alert("AI Loaded");

document.getElementById("chatToggle").onclick = function(){
    document.getElementById("chatBox").style.display = "flex";
}

document.getElementById("closeChat").onclick = function(){
    document.getElementById("chatBox").style.display = "none";
}


// Send Message
function sendMessage(){

    let input = document.getElementById("userInput").value.trim();
    if(input === "") return;

    addMessage(input, "user");
    document.getElementById("userInput").value = "";

    let response = generateAIResponse(input);
    setTimeout(() => addMessage(response, "bot"), 500);
}


// Add Message
function addMessage(message, sender){

    let chat = document.getElementById("chatMessages");

    let div = document.createElement("div");
    div.className = sender === "user" ? "user-msg" : "bot-msg";
    div.innerText = message;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}


// SMART AI RESPONSE
function generateAIResponse(input){

    let text = input.toLowerCase();

    // Manglish detection
    if(text.includes("destination") ){
        return "Sure 😄 where you want to go?";
    }
    if(text.includes("budget") ){
        return "Sure 😄 how much you planning?";
    }
     if(text.includes("pokanam") || text.includes("venam")){
        return "Sure 😄 Evidekku pokanam? Budget ethra aanu?";
    }

    

    // Malayalam detection
    if(text.includes("യാത്ര") || text.includes("ബഡ്ജറ്റ്")){
        return "ശരി 😊 എവിടേക്ക് യാത്ര വേണം? എത്ര ദിവസമാണ്?";
    }

    // English detection
    if(text.includes("trip") || text.includes("travel")){
        return "Great! 🌍 Where do you want to go and what is your budget?";
    }

    // Budget planning
    if(text.includes("10000") || text.includes("15000") || text.includes("20000")){
        return "Awesome 🔥 Based on your budget, I can arrange travel, stay and food. How many days are you planning?";
    }

    return "I'm here to help you plan your trip 😊 Tell me your destination, budget and number of days.";
}
>>>>>>> fb0ed6e008e4f779e8ea58e88c67969cbdbad178
