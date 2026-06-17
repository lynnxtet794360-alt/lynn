const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// =====================
// CONFIG
// =====================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = "mysecret123";

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.static("."));

// =====================
// DB CONNECT
// =====================
mongoose.connect(
  "mongodb+srv://aungarkarminn_db_user:abc12345@cluster0.chuojxk.mongodb.net/loginDB?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log("DB Connected ✅"))
.catch(err => console.log("DB Error ❌", err.message));

// =====================
// USER MODEL
// =====================
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: "user" }
});

const User = mongoose.model("User", UserSchema);

// =====================
// REGISTER
// =====================
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const exists = await User.findOne({ username });
    if (exists) {
      return res.json({ success: false, message: "User exists ❌" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await new User({
      username,
      password: hashed,
      role: "user"
    }).save();

    res.json({ success: true, message: "Registered ✅" });

  } catch (err) {
    res.json({ success: false, message: "Register Error ❌" });
  }
});

// =====================
// LOGIN
// =====================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "User not found ❌" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Wrong password ❌" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login success ✅",
      token
    });

  } catch (err) {
    res.json({ success: false, message: "Login Error ❌" });
  }
});

// =====================
// AUTH MIDDLEWARE
// =====================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.json({ success: false, message: "No token ❌" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.json({ success: false, message: "Invalid token ❌" });
  }
}

// =====================
// PROFILE
// =====================
app.get("/profile", auth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// =====================
// ADMIN MIDDLEWARE
// =====================
function admin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.json({ success: false, message: "Admin only ❌" });
  }
  next();
}

// =====================
// GET USERS (ADMIN)
// =====================
app.get("/users", auth, admin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// =====================
// DELETE USER (ADMIN)
// =====================
app.delete("/user/:id", auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted ✅" });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});