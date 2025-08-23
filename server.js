const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
app.use(cors({
  origin: "*"
}))


const app = express();
app.use(bodyParser.json());

// --- MongoDB Connection ---
const mongoURI = process.env.MONGO_URI;  // will come from Render env vars
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// --- Schema & Model ---
const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model("SensorData", sensorSchema);

// --- Routes ---
// Store data from ESP32
app.post("/data", async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const entry = new SensorData({ temperature, humidity });
    await entry.save();

    console.log("📩 Data saved:", entry);
    res.json({ status: "success", saved: entry });
  } catch (err) {
    console.error("❌ Error saving data:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Fetch last 10 entries
app.get("/data", async (req, res) => {
  try {
    const docs = await SensorData.find().sort({ timestamp: -1 }).limit(10);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ ESP32 + MongoDB API is running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
