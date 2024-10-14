const env = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // Install uuid package for unique IDs

const path = require("path");
const bcrypt = require("bcrypt");

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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Load existing RSVP data from JSON file
const dataFilePath = path.join(__dirname, "rsvpData.json"); // Path to JSON file
let rsvpData = [];

// Main route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

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
  const isValid =
    enteredPasscode === guestPasscode || enteredPasscode === hostPasscode;
  if (!isValid) {
    return res.status(403).json({ message: "Invalid passcode." });
  }
  res.status(200).json({ message: "Passcode is valid." });
});

// RSVP route
app.post("/rsvp", (req, res) => {
  const newEntry = {
    id: uuidv4(), // Generate a unique ID
    ...req.body, // Spread the rest of the body properties
  };
  rsvpData.push(newEntry); // Add new entry to the array
  fs.writeFileSync(dataFilePath, JSON.stringify(rsvpData, null, 2)); // Write to JSON file
  console.log("RSVP Data:", newEntry); // Log the received data
  res.status(200).json({ message: "RSVP received!" });
});

// HOST route that shows the list of guest
app.get("/list", (req, res) => {
  console.log("Getting RSVP data...");
  if (!Array.isArray(rsvpData) || rsvpData.length === 0) {
    return res.status(200).json({ message: "No RSVP data found.", data: [] });
  }
  res.status(200).json(rsvpData); // Send the RSVP data as a JSON response
});

// HOST route that deletes a guest from the list
app.delete("/rsvp/:id", (req, res) => {
  const { id } = req.params;

  // Filter out the entry with the matching id
  rsvpData = rsvpData.filter((entry) => entry.id !== id);

  // Write updated data back to the file
  fs.writeFileSync(dataFilePath, JSON.stringify(rsvpData, null, 2));

  console.log(`RSVP entry with id ${id} deleted.`);
  res.status(200).json({ message: "RSVP entry deleted." });
});

app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, "public", "html", `${page}.html`);

  // Check if the file exists before sending
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Page not found");
  }
});

app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// Endpoint to get RSVP data

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
