import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../model/session.model.js";
import crypto from "crypto";

async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword, // ✅ correct field name
    });

    const refreshToken = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    const hashRefresh = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      userId: user._id,
      refreshTokenHash: hashRefresh,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      { userId: user._id, session: session._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Created Successfully", accessToken });

  } catch (err) { // ✅ try/catch added
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getUser(req, res) {
  try { // ✅ try/catch added
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token not found" });

    const accessToken = authHeader.split(" ")[1];

    const decoded = jwt.verify(accessToken, config.JWT_SECRET); // ✅ now caught by try/catch

    const findUser = await User.findById(decoded.userId);
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User found",
      user: { name: findUser.username, email: findUser.email },
    });

  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

async function logoutUser(req, res) {
  try { // ✅ try/catch added
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const hashRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash: hashRefreshToken,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" }); // ✅ correct message

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function logoutAllUser(req, res) {
  try { // ✅ try/catch added
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }
    const decode=jwt.verify(refreshToken, config.JWT_SECRET);

    const hashRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

   await sessionModel.updateMany({
  userId: decode.userId,
  revoked: false,
}, {
  revoked: true,
});

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" }); // ✅ correct message

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function generateAccessToken(req, res) { // ✅ req, res added
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const hashRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash: hashRefreshToken,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET); // caught by try/catch

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId }, // ✅ decoded.userId not decoded._id
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const hashRefresh = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    const accessToken = jwt.sign(
      { userId: decoded.userId, session: session._id }, // ✅ decoded.userId
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    session.refreshTokenHash = hashRefresh;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Access token generated", accessToken }); // ✅ correct message

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}



async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   
    const refreshToken = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    
    const hashRefresh = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

   
    const session = await sessionModel.create({
      userId: user._id,
      refreshTokenHash: hashRefresh,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

   
    const accessToken = jwt.sign(
      { userId: user._id, session: session._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Logged in successfully", accessToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export { registerUser, getUser, generateAccessToken, logoutUser, loginUser, logoutAllUser };