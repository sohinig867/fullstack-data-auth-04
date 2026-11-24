require("dotenv").config();
const express = require("express");
const cors = require("cors");
// Import SQLite database.
const db = require("./database/database");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(
cors({
origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
})
);
app.use(express.json());
app.get("/", (req, res) => {
res.status(200).json({
message: "Course Management API is running"
});
});
// Authentication APIs.
app.use("/api/auth", authRoutes);
// Protected course APIs.
app.use("/api/courses", courseRoutes);
// Unknown route handler.
app.use((req, res) => {
res.status(404).json({
error: "Endpoint not found",
path: req.originalUrl
});
});
// Error handler.

 //Express + React

app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({
error: "Internal server error"
});
});
// Verify SQLite connection before starting.
function startServer() {
try {
db.prepare("SELECT 1").get();
console.log("Connected to SQLite successfully.");
app.listen(PORT, () => {
console.log(`Course API running at http://localhost:${PORT}`);
});
} catch (error) {
console.error("Could not connect to SQLite:", error.message);
process.exitCode = 1;
}
}
startServer();