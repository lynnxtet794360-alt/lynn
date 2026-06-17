const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = "mysecret123";

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// DB CONNECT (FIXED)
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("DB Connected ✅"))
.catch(err => console.log("DB Error ❌", err.message));

// USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: { type: String, default: "user" }
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ success: false, message: "User exists ❌" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({ username, password: hash });

  res.json({ success: true, message: "Registered ✅" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, message: "User not found ❌" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ success: false, message: "Wrong password ❌" });

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ success: true, message: "Login success ✅", token });
});

// AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.json({ success: false, message: "No token ❌" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.json({ success: false, message: "Invalid token ❌" });
  }
}

// PROFILE
app.get("/profile", auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ADMIN CHECK
function admin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.json({ success: false, message: "Admin only ❌" });
  }
  next();
}

// USERS (ADMIN ONLY)
app.get("/users", auth, admin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// DELETE USER
app.delete("/user/:id", auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted ✅" });
});

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// START SERVER
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});