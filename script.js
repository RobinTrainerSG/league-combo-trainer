// Combo Trainer Variables
const allowedKeys = ["Q", "W", "E", "R", "D", "F", "A", "AA", "1", "2", "3", "4", "5", "6", "FLASH", "IGNITE"];
let customCombo = [];
let userCombo = [];
let startTime;
let timerInterval;
let currentAttempt = 0;
let totalAttempts = 10;
let totalAccuracy = 0;
let fastestTime = Infinity;
let comboStreak = 0;
let bestStreak = 0;
let attemptTimes = [];

// Sounds
const sounds = {
  "Q": new Audio("https://assets.mixkit.co/sfx/preview/mixkit-fast-whoosh-transition-2585.mp3"),
  "W": new Audio("https://assets.mixkit.co/sfx/preview/mixkit-game-shield-break-1938.mp3"),
  "E": new Audio("https://assets.mixkit.co/sfx/preview/mixkit-fast-sword-strike-2763.mp3"),
  "R": new Audio("https://assets.mixkit.co/sfx/preview/mixkit-fast-magical-attack-2317.mp3"),
  "D": new Audio("https://assets.mixkit.co/sfx/preview/mixkit-game-magical-teleport-2337.mp3"),
  "F": new Audio("https://assets.mixkit.co/sfx/preview/mixkit-small-fire-explosion-1661.mp3"),
};
const errorSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3");
const dingSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3");

// Preset Combos List
const presetCombosList = [
  { champion: "RIVEN", comboName: "Fast Q Cancel Combo", combo: "Q AA Q AA Q AA E R AA" },
  { champion: "GANGPLANK", comboName: "Triple Barrel Chain", combo: "E E E Q AA R" },
  { champion: "QIYANA", comboName: "Elemental Terrain Burst", combo: "E Q R Q W" },
  { champion: "KATARINA", comboName: "Shunpo Reset Spin", combo: "E W AA R E Q AA" },
  { champion: "ZED", comboName: "Triple Shadow Poke", combo: "W E Q R W E Q AA" },
  { champion: "AZIR", comboName: "Shurima Shuffle", combo: "Q E R AA Q AA" },
  { champion: "RENGAR", comboName: "Full Burst Combo", combo: "R E Q AA W Q AA" },
  { champion: "APHELIOS", comboName: "Calibrum → Infernum Combo", combo: "Q R AA Q AA" },
  { champion: "YASUO", comboName: "Airblade + Max Damage", combo: "E Q R AA Q AA E" },
  { champion: "AKALI", comboName: "Shuriken Flip Execution", combo: "E R Q AA R AA" },
  { champion: "GRAGAS", comboName: "Flash Body Slam Combo", combo: "E FLASH Q R AA" },
  { champion: "NEEKO", comboName: "Instant Root & Burst", combo: "E Q R AA" },
  { champion: "AMUMU", comboName: "Bandage Toss Lockdown", combo: "Q AA R E AA" },
  { champion: "ZOE", comboName: "Sleepy Trouble Burst", combo: "E Q R Q AA" }
];

// Populate Preset Dropdown on Load
window.onload = () => {
  const presetDropdown = document.getElementById("presetCombos");
  presetCombosList.forEach((combo, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = `${combo.champion} - ${combo.comboName}`;
    presetDropdown.appendChild(option);
  });

  // Visit Counter
  fetch('https://api.countapi.xyz/hit/league-combo-trainer-robin/visits')
    .then(res => res.json())
    .then(res => {
      document.getElementById('visitCount').innerText = res.value;
    })
    .catch(err => {
      console.error('Visit counter error', err);
      document.getElementById('visitCount').innerText = 'N/A';
    });
};

// Load Preset Combo
function loadPresetCombo() {
  const selectedIndex = document.getElementById("presetCombos").value;
  const flashKey = document.getElementById("flashKey").value;
  const igniteKey = document.getElementById("igniteKey").value;

  if (selectedIndex === "") {
    alert("Please select a preset combo first!");
    return;
  }

  let selectedCombo = presetCombosList[selectedIndex].combo;

  // Replace FLASH/IGNITE words if present
  selectedCombo = selectedCombo.replace(/FLASH/g, flashKey);
  selectedCombo = selectedCombo.replace(/IGNITE/g, igniteKey);

  document.getElementById("customCombo").value = selectedCombo;
}

// Reset Selections
function resetPresetSelection() {
  document.getElementById("presetCombos").value = "";
  document.getElementById("flashKey").value = "D";
  document.getElementById("igniteKey").value = "F";
  document.getElementById("customCombo").value = "";
}

// --- (Combo Training Original Functions continue below) ---

function startCountdown() {
  const countdown = document.getElementById("countdown");
  let counter = 3;
  countdown.innerText = counter;
  countdown.style.display = "flex";

  const interval = setInterval(() => {
    counter--;
    if (counter > 0) {
      countdown.innerText = counter;
    } else if (counter === 0) {
      countdown.innerText = "GO!";
    } else {
      clearInterval(interval);
      countdown.style.display = "none";
      startTraining();
    }
  }, 1000);
}

function startTraining() {
    const input = document.getElementById("customCombo").value.trim().toUpperCase();
    const flashKey = document.getElementById("flashKey").value;
    const igniteKey = document.getElementById("igniteKey").value;
  
    if (!input) {
      alert("Please enter a combo!");
      return;
    }
  
    let rawCombo;
  
    if (input.includes(" ")) {
      rawCombo = input.split(" ").filter(k => k.trim() !== "");
    } else {
      rawCombo = input.split("").filter(k => k.trim() !== "");
    }
  
    // Smart mapping: if user typed D/F, we map them to FLASH or IGNITE based on config
    customCombo = rawCombo.map(k => {
      if (k === flashKey) return "FLASH";
      if (k === igniteKey) return "IGNITE";
      return k;
    });
  
    const invalidKeys = customCombo.filter(k => !["Q", "W", "E", "R", "D", "F", "A", "AA", "1", "2", "3", "4", "5", "6", "FLASH", "IGNITE"].includes(k));
    if (invalidKeys.length > 0) {
      alert("Invalid keys detected: " + invalidKeys.join(", "));
      return;
    }
  
    document.getElementById("comboDisplay").innerHTML = customCombo.map(k => {
        if (k === "FLASH") {
          return `<img src= "flash.png" alt="Flash" class="spell-icon">`;
        } else if (k === "IGNITE") {
          return `<img src= "ignite.png" alt="Ignite" class="spell-icon">`;
        } else if (k === "AA") {
          return `<img src= "sword.png" alt="Auto Attack" class="spell-icon">`;
        } else {
          return `<span class="key">${k}</span>`;
        }
      }).join(" ");     
  
    document.getElementById("comboDisplayArea").style.display = "block";
    document.getElementById("userInputArea").style.display = "block";
    document.getElementById("statsArea").style.display = "block";
    document.getElementById("attemptCounter").style.display = "block";
    document.getElementById("attemptNumber").innerText = 1;
    document.getElementById("totalAttempts").innerText = totalAttempts;
  
    currentAttempt = 0;
    totalAccuracy = 0;
    fastestTime = Infinity;
    comboStreak = 0;
    bestStreak = 0;
    attemptTimes = [];
  
    startNewAttempt();
  }
 
  function startNewAttempt() {
    userCombo = [];
    document.getElementById("userInput").value = "";
    document.getElementById("accuracy").textContent = "";
    document.getElementById("timeTaken").textContent = "";
    
    const keys = document.querySelectorAll("#comboDisplay .key, #comboDisplay img");
    
    keys.forEach(key => {
      key.classList.remove("correct");
      key.classList.remove("wrong");
      key.classList.remove("correct-img");
      key.classList.remove("wrong-img");
    });
  
    document.getElementById("attemptNumber").innerText = currentAttempt + 1;
  
    startTimer();
  }
  

function updateLiveTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("liveTimer").innerText = `${seconds}s`;
}

document.addEventListener("keydown", function(event) {
  let key = event.key.toUpperCase();
  if (!allowedKeys.includes(key)) return;

  if (sounds[key]) {
    sounds[key].currentTime = 0;
    sounds[key].play();
  }

  userCombo.push(key);
  updateInputDisplay();
  checkCombo();
});

function updateInputDisplay() {
  let display = userCombo.map(k => k === "A" ? "⚔️" : k).join(" ");
  document.getElementById("userInput").innerHTML = display;
}

function checkCombo() {
    const keys = document.querySelectorAll("#comboDisplay .key, #comboDisplay img");
  
    if (userCombo.length <= customCombo.length) {
      const currentIndex = userCombo.length - 1;
      const expectedKey = customCombo[currentIndex];
      const pressedKey = userCombo[currentIndex];
      const flashKey = document.getElementById("flashKey").value;
      const igniteKey = document.getElementById("igniteKey").value;
  
      let correct = false;
  
      if (expectedKey === "AA" && pressedKey === "A") {
        correct = true;
      } else if (expectedKey === "FLASH" && pressedKey === flashKey) {
        correct = true;
      } else if (expectedKey === "IGNITE" && pressedKey === igniteKey) {
        correct = true;
      } else if (pressedKey === expectedKey) {
        correct = true;
      }
  
      if (correct) {
        if (keys[currentIndex].tagName === "IMG") {
          keys[currentIndex].classList.add('correct-img');
        } else {
          keys[currentIndex].classList.add('correct');
        }
      } else {
        if (keys[currentIndex].tagName === "IMG") {
          keys[currentIndex].classList.add('wrong-img');
        } else {
          keys[currentIndex].classList.add('wrong');
        }
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
      }
    }
  
    if (userCombo.length === customCombo.length) {
      clearInterval(timerInterval);
      dingSound.currentTime = 0;
      dingSound.play().catch(()=>{});
  
      let correctCount = 0;
      const flashKey = document.getElementById("flashKey").value;
      const igniteKey = document.getElementById("igniteKey").value;
  
      for (let i = 0; i < customCombo.length; i++) {
        if ((customCombo[i] === "AA" && userCombo[i] === "A") ||
            (customCombo[i] === "FLASH" && userCombo[i] === flashKey) ||
            (customCombo[i] === "IGNITE" && userCombo[i] === igniteKey) ||
            (userCombo[i] === customCombo[i])) {
          correctCount++;
        }
      }
  
      let accuracy = Math.round((correctCount / customCombo.length) * 100);
      let timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  
      document.getElementById("accuracy").textContent = `${accuracy}%`;
      document.getElementById("timeTaken").textContent = `${timeTaken}s`;
  
      totalAccuracy += accuracy;
      attemptTimes.push(Number(timeTaken));
      if (timeTaken < fastestTime) {
        fastestTime = timeTaken;
      }
  
      if (accuracy === 100) {
        comboStreak++;
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (comboStreak > bestStreak) {
          bestStreak = comboStreak;
        }
      } else {
        comboStreak = 0;
      }
  
      showComboMultiplier(comboStreak);
  
      currentAttempt++;
      if (currentAttempt < totalAttempts) {
        setTimeout(startNewAttempt, 1000);
      } else {
        setTimeout(showFinalResult, 1000);
      }
    }
  }
  
function showComboMultiplier(streak) {
  const element = document.getElementById("comboMultiplier");
  if (streak > 1) {
    element.textContent = `COMBO x${streak}!`;
    element.style.display = "block";
    setTimeout(() => {
      element.style.display = "none";
    }, 1500);
  } else {
    element.style.display = "none";
  }
}

function showFinalResult() {
  const finalAcc = Math.round(totalAccuracy / totalAttempts);
  document.getElementById("comboDisplayArea").style.display = "none";
  document.getElementById("userInputArea").style.display = "none";
  document.getElementById("statsArea").style.display = "none";
  document.getElementById("attemptCounter").style.display = "none";

  document.getElementById("finalAccuracy").textContent = finalAcc;
  document.getElementById("fastestTime").textContent = fastestTime;
  document.getElementById("bestStreak").textContent = bestStreak;
  document.getElementById("precisionScore").textContent = calculatePrecision(finalAcc, fastestTime);

  document.getElementById("finalResult").style.display = "block";

  const ctx = document.getElementById('speedChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: attemptTimes.map((_, i) => `Attempt ${i+1}`),
      datasets: [{
        label: 'Time per Combo (seconds)',
        data: attemptTimes,
        borderColor: '#00C8FF',
        backgroundColor: 'rgba(0, 200, 255, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#00C8FF',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            color: '#00C8FF',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#00C8FF',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(255,255,255,0.1)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#00C8FF',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function calculatePrecision(accuracy, fastestTime) {
  let precision = Math.round((accuracy / fastestTime) * 10);
  if (precision > 100) precision = 100;
  return precision;
}

function resetTraining() {
  location.reload();
}

// Random Quote Generator for Review Section
document.addEventListener("DOMContentLoaded", function() {
  const quotes = [
    "A true master is an eternal student. – Master Yi",
    "Master yourself, master the enemy. – Lee Sin",
    "Those who do not know their limits will never reach their potential. – Lee Sin",
    "I will struggle, I will fail, but to surrender is a privilege I do not have. – Lee Sin",
    "My training left more scars than any battle. – Lee Sin",
    "I bloodied my knuckles to sharpen my fists. – Lee Sin",
    "Anything worth doing is worth doing right. – Camille",
    "Obviously, you weren’t a learning computer. – Camille",
    "The will comes from within, not from the blade. – Akali",
    "We are what we overcome. – Pantheon",
    "More than what we do not understand, we fear being understood. – Swain",
    "Wear a mask long enough, and you forget the face beneath. – Yone",
    "People don't always listen, but that's no reason to keep quiet. – Seraphine",
    "Music helps you keep your head up. – Seraphine",
    "I sing to help them find themselves. The stage just makes it easier. – Seraphine",
    "You learn a lot with your nose to the ground. – Naafiri",
    "The second-years are a lot stronger than us. But with the right training, we can surpass them! – Battle Academia Ezreal",
    "Balance is a point, not a stance. – Shen",
    "The road to ruin is shorter than you think. – Shen",
    "Strength and wisdom guide me. – Shen",
    "Challenge me, mortal. I am but an apprentice. – Jax",
    "Bravery and a strong arm are not enough; wisdom must guide them. – Jax",
    "Never become a monster to defeat one. – Karma",
    "Pain is the greatest teacher. – Aatrox",
    "The mind is the sharpest weapon. – Zed",
    "To conquer our fears, we must move forward. – Taliyah",
    "Only fools pledge life to honor when the true lesson is survival. – Rengar"
  ];

  // Pick a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Find the div and set text
  const quoteArea = document.getElementById('randomQuoteArea');
  if (quoteArea) {
    quoteArea.textContent = `"${randomQuote}"`;
  }
});


