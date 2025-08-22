const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model("SensorData", sensorSchema);

app.post("/data", async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    if (temperature == null || humidity == null) {
      return res.status(400).json({ status: "error", message: "Missing temperature or humidity" });
    }
    const entry = new SensorData({ temperature, humidity });
    await entry.save();
    console.log("📩 Data saved:", entry);
    res.json({ status: "success", saved: entry });
  } catch (err) {
    console.error("❌ Error saving data:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/data", async (req, res) => {
  try {
    const docs = await SensorData.find().sort({ timestamp: -1 }).limit(10);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/data/latest", async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ ESP32 + MongoDB API is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
