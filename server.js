const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_SECRET = "access_secret_123";
const REFRESH_SECRET = "refresh_secret_123";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// DB
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("DB Connected ✅"))
.catch(err => console.log("DB Error ❌", err.message));

// USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: { type: String, default: "user" },
  refreshToken: String
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ success: false, message: "User exists ❌" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hash
  });

  res.json({ success: true, message: "Registered ✅" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, message: "User not found ❌" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ success: false, message: "Wrong password ❌" });

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "1m" } // short life
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    success: true,
    accessToken,
    refreshToken
  });
});

// AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.json({ success: false });

  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    return res.json({ success: false, expired: true });
  }
}

// REFRESH TOKEN
app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.json({ success: false });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.json({ success: false });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      ACCESS_SECRET,
      { expiresIn: "1m" }
    );

    res.json({
      success: true,
      accessToken: newAccessToken
    });

  } catch {
    res.json({ success: false });
  }
});

// LOGOUT
app.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.json({ success: true });
});

// PROFILE
app.get("/profile", auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});