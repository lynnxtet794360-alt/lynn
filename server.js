require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_SECRET = "access_secret_123";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// DB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connected ✅"))
  .catch(err => console.log("DB Error ❌", err.message));

// MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: { type: String, default: "user" }
});

// ================= HOME =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================= DASHBOARD =================
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) {
    return res.json({ success: false, message: "User exists ❌" });
  }

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hash,
    role: "user"
  });

  res.json({ success: true, message: "Registered" });
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.json({ success: false, message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  res.json({
    success: true,
    message: "Login success",
    token
  });
});

// ================= AUTH =================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.json({ success: false });

  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    return res.json({ success: false });
  }
}

// ================= PROFILE =================
app.get("/profile", auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ================= USERS =================
app.get("/users", auth, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ================= START =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      user
    });

  } catch (err) {
    res.json({ success: false, message: "Error loading profile ❌" });
  }
});