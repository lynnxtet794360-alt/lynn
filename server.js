const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_SECRET = "access_secret_123";
const REFRESH_SECRET = "refresh_secret_123";

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connected ✅"))
  .catch(err => console.log("DB Error ❌", err.message));

// ================= USER MODEL =================
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: { type: String, default: "user" },
  refreshToken: String
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
  if (exists) return res.json({ success: false, message: "User exists ❌" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({ username, password: hash });

  res.json({ success: true, message: "Registered ✅" });
});

// ================= LOGIN (COOKIE VERSION) =================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, message: "User not found ❌" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ success: false, message: "Wrong password ❌" });

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  user.refreshToken = refreshToken;
  await user.save();

  // 🍪 COOKIE SET
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false, // 👉 Render မှာ deploy လုပ်ရင် true ပြောင်း
    sameSite: "lax",
    maxAge: 15 * 60 * 1000
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ success: true, message: "Login success ✅" });
});

// ================= AUTH =================
function auth(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.json({ success: false, message: "No token ❌" });
  }

  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    return res.json({ success: false, expired: true });
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

// ================= LOGOUT =================
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ success: true, message: "Logged out ✅" });
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});