const env = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt"); // Ensure bcrypt is required

const app = express();
const PORT = process.env.PORT || 3000;

console.log(PORT);

// Get passwords from environment variables
const guestPasscode = process.env.GUEST_PASSCODE;
const hostPasscode = process.env.HOST_PASSCODE;

// Middleware
app.use(
  cors({
    origin: "https://nakyiahpoodababyshower.onrender.com", // Replace with your frontend's origin
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "html")));
app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "media")));
app.use(express.static(path.join(__dirname, "js")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

// Load existing RSVP data from JSON file
const dataFilePath = path.join(__dirname, "rsvpData.json"); // Path to JSON file
let rsvpData = [];

// Function to initialize RSVP data from file
function initializeRsvpData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, "utf-8");
      rsvpData = JSON.parse(data);
    } else {
      fs.writeFileSync(dataFilePath, JSON.stringify([])); // Create an empty JSON array
    }
  } catch (error) {
    console.error("Error reading or parsing the RSVP data file:", error);
    rsvpData = []; // Initialize to an empty array in case of error
  }
}

// Initialize RSVP data on server start
initializeRsvpData();

// Validate passcode route
app.post("/validate", async (req, res) => {
  const enteredPasscode = req.body.passcode;
  const isValid = enteredPasscode == guestPasscode || hostPasscode;
  if (!isValid) {
    return res.status(403).json({ message: "Invalid passcode." }); // Send JSON response
  }
  res.status(200).json({ message: "Passcode is valid." }); // Send a response back
});

// RSVP route
app.post("/rsvp", (req, res) => {
  const newEntry = req.body;
  rsvpData.push(newEntry); // Add new entry to the array
  fs.writeFileSync(dataFilePath, JSON.stringify(rsvpData, null, 2)); // Write to JSON file
  console.log("RSVP Data:", newEntry); // Log the received data
  res.status(200).json({ message: "RSVP received!" }); // Send a response back
});

// Endpoint to get RSVP data
app.get("/guest-list", (req, res) => {
  console.log("Getting RSVP data..."); // Log a message to the console

  console.log("RSVP Data", rsvpData);
  // Check if rsvpData is initialized and is an array
  if (!Array.isArray(rsvpData) || rsvpData.length === 0) {
    return res.status(200).json({ message: "No RSVP data found.", data: [] }); // Return a message with an empty array
  }
  res.status(200).json(rsvpData); // Send the RSVP data as a JSON response
});

// Host route with host passcode check
app.get("/host", (req, res) => {
  res.send("Welcome to the host dashboard!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
