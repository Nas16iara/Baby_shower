function openUp() {
  const elements = {
    opentop: document.querySelector("#opentop"),
    top: document.querySelector("#top"),
    front: document.querySelector("#front"),
    back: document.querySelector("#back"),
    letter: document.querySelector("#letter"),
    button: document.querySelector(".open"),
    audio: document.getElementById("background-music"),
  };
  // Play the background music
  if (elements.audio) {
    console.log("Playing audio...");
    elements.audio.play();
  } else {
    console.log("Audio element not found.");
  }

  if (elements.opentop) elements.opentop.beginElement();
  if (elements.top) elements.top.style.zIndex = 2;

  for (let el of Object.values(elements)) {
    if (el) el.classList.add("animate");
  }
}

function closeUp() {
  const elements = {
    opentop: document.querySelector("#opentop"),
    top: document.querySelector("#top"),
    front: document.querySelector("#front"),
    back: document.querySelector("#back"),
    letter: document.querySelector("#letter"),
    button: document.querySelector(".open"),
    audio: document.getElementById("background-music"),
  };

  // Stop the music
  if (elements.audio) {
    console.log("Pausing audio...");
    elements.audio.currentTime = 0;
    elements.audio.pause();
  } else {
    console.log("Audio element not found.");
  }

  // Animate the letter first
  if (elements.letter) {
    elements.letter.classList.add("closing");
  }

  // Wait for letter animation to start before closing the envelope
  setTimeout(() => {
    if (elements.opentop) {
      // Reverse the animation
      elements.opentop.setAttribute("from", "0,100 150,0 300,100");
      elements.opentop.setAttribute("to", "0,100 150,200 300,100");
      elements.opentop.beginElement();
    }

    if (elements.top) elements.top.style.zIndex = 11; // Reset to original z-index

    // Remove animate class from all elements
    for (let el of Object.values(elements)) {
      if (el && el !== elements.audio) el.classList.remove("animate");
    }
  }, 250); // Adjust this delay to match half of your letter closing animation duration

  // Reset the button display and remove the closing class from the letter after all animations
  setTimeout(() => {
    if (elements.button) elements.button.style.display = "block";
    if (elements.letter) elements.letter.classList.remove("closing");
  }, 750); // Adjust timing as needed to match your total animation duration
}

function stopAudio() {
  const audio = document.getElementById("background-music");
  if (audio) {
    audio.paused ? audio.play() : audio.pause();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", () => {
      console.log("Back button clicked");
      window.history.back(); // Go back to the previous page
    });
  }

  const submitPasscodeButton = document.getElementById("submitPasscode");
  if (submitPasscodeButton) {
    submitPasscodeButton.addEventListener(
      "click",
      handleGuestPasscodeSubmission
    ); // Use specific function for guests
  }

  const submitHostPasscodeButton =
    document.getElementById("submitHostPasscode");
  if (submitHostPasscodeButton) {
    submitHostPasscodeButton.addEventListener(
      "click",
      handleHostPasscodeSubmission
    ); // Use specific function for hosts
  }

  const rsvpForm = document.getElementById("rsvpForm");
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", handleRsvpSubmission);
  }
});

function handlePasscodeSubmission(url, localStorageKey, redirectUrl) {
  const passcode = document.getElementById(
    url === "http://localhost:5115/validate" ? "hpasscode" : "passcode"
  ).value;
  // Validate input before sending
  if (!passcode) {
    document.getElementById("errorMessage").innerText =
      "Please enter a passcode.";
    return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          // Customize error message based on response data if available
          document.getElementById("errorMessage").innerText =
            data.message || "Access denied.";
        });
      }
      localStorage.setItem(localStorageKey, "true");
      window.location.href = redirectUrl; // Redirect on success
    })
    .catch(() => {
      document.getElementById("errorMessage").innerText =
        "An error occurred. Please try again later.";
    });
}

// Function for host passcode submission
function handleHostPasscodeSubmission() {
  handlePasscodeSubmission(
    "http://localhost:5115/validate",
    "isHostValid",
    "host.html"
  );
}

// Function for guest passcode submission
function handleGuestPasscodeSubmission() {
  handlePasscodeSubmission(
    "http://localhost:5115/validate",
    "isPasscodeValid",
    "rsvp.html"
  );
}

function handleRsvpSubmission(event) {
  event.preventDefault(); // Prevent default form submission
  console.log("RSVP Form Submission");

  // Collecting form data
  const rsvpData = {
    name: document.getElementById("name").value,
    contactInfo: document.getElementById("contactInfo").value,
    attendance: document.getElementById("attendance").value,
    guests: document.getElementById("guests").value,
    message: document.getElementById("message").value,
  };
  console.log("RSVP Data:", rsvpData);

  // Clear any previous error messages
  document.getElementById("errorMessage").innerText = "";

  // Send data to server
  fetch("http://localhost:5115/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rsvpData),
  })
    .then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        console.error("Error:", data.message);
        document.getElementById("errorMessage").innerText = data.message; // Display error message
        throw new Error(data.message);
      }
      window.location.href = "thank.html"; // Redirect to passcode input page
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Stop audio on click
document.addEventListener("click", (event) => {
  // Check if the clicked element is a button
  if (!event.target.matches("button")) {
    stopAudio();
  }
});

function rsvp() {
  window.location.href = "password.html"; // Redirect to passcode input page
}
