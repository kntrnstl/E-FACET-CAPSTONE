const pool = require("../config/database.js");
const bcrypt = require("bcryptjs");

// helper: get track_id from track_code
async function getTrackIdByCode(trackCode) {
  const code = String(trackCode || "")
    .trim()
    .toLowerCase();
  if (code !== "driving" && code !== "tesda") return null;

  const [rows] = await pool.execute(
    "SELECT track_id FROM tracks WHERE track_code = ? LIMIT 1",
    [code],
  );
  return rows.length ? rows[0].track_id : null;
}

// --------------------
// LOGIN
// --------------------
const login = async (req, res) => {
  try {
    const { username, password, track } = req.body;
    // ✅ track comes from frontend: 'tesda' or 'driving' (optional but recommended)

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required",
      });
    }

    const identity = username.trim();
    const requestedTrack = String(track || "")
      .trim()
      .toLowerCase(); // tesda/driving

    // ✅ join tracks so we can return track_code + enforce access
    const [users] = await pool.execute(
      `SELECT 
         u.id, u.username, u.password, u.role, u.fullname, u.track_id,
         t.track_code
       FROM users u
       LEFT JOIN tracks t ON t.track_id = u.track_id
       WHERE u.username = ? OR u.email = ?
       LIMIT 1`,
      [identity, identity],
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Account not found",
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    // ✅ ENFORCE: student/user must match track
    // Admin/instructor can enter their own dashboards regardless of track.
    if (user.role === "user" || user.role === "student") {
      const dbTrack = (user.track_code || "").toLowerCase();

      // if frontend sent track, enforce it matches DB
      if (
        requestedTrack &&
        (requestedTrack === "tesda" || requestedTrack === "driving")
      ) {
        if (dbTrack && dbTrack !== requestedTrack) {
          return res.status(403).json({
            status: "error",
            message: `This account is registered for ${dbTrack.toUpperCase()} portal. Please login using the correct portal.`,
          });
        }
      }

      // If user has no track set yet (legacy), default to driving (optional)
      // Better: set it in DB properly.
    }

    // Session
    req.session.user_id = user.id;
    req.session.username = user.username;
    req.session.fullname = user.fullname;
    req.session.role = user.role;

    // ✅ also store track for student/user
    if (user.role === "user" || user.role === "student") {
      req.session.track_code = user.track_code || requestedTrack || null;
      req.session.track_id = user.track_id || null;
    } else {
      req.session.track_code = null;
      req.session.track_id = null;
    }

    req.session.user = {
      user_id: user.id,
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      track_code: req.session.track_code,
      track_id: req.session.track_id,
    };

    const userSession = {
      user_id: user.id,
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      track: user.track_code || requestedTrack || null,
    };

    const redirect =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "instructor"
          ? "/instructor-dashboard"
          : user.role === "trainer"
            ? "/trainer-dashboard"
            : userSession.track === "tesda"
              ? "/tesda-dashboard"
              : "/student-dashboard";


    return res.json({
      status: "success",
      redirect,
      user: userSession,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

// --------------------
// CHECK AUTH
// --------------------
const checkAuth = (req, res) => {
  try {
    if (req.session && req.session.user_id) {
      return res.json({
        status: "success",
        authenticated: true,
        user: {
          user_id: req.session.user_id,
          username: req.session.username,
          fullname: req.session.fullname,
          role: req.session.role,
          track: req.session.track_code || null,
        },
      });
    }

    return res.json({
      status: "error",
      authenticated: false,
      message: "Not authenticated",
      redirect: "/login",
    });
  } catch (error) {
    console.error("Check auth error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error checking authentication",
    });
  }
};

// --------------------
// CHECK ADMIN
// --------------------
const checkAdmin = (req, res) => {
  try {
    if (req.session && req.session.user_id && req.session.role === "admin") {
      return res.json({
        status: "success",
        isAdmin: true,
        user: {
          user_id: req.session.user_id,
          username: req.session.username,
          fullname: req.session.fullname,
        },
      });
    }

    return res.json({
      status: "error",
      isAdmin: false,
      message: "Admin access required",
      redirect: "/login",
    });
  } catch (error) {
    console.error("Check admin error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error checking admin status",
    });
  }
};

// --------------------
// CHECK INSTRUCTOR
// --------------------
const checkInstructor = (req, res) => {
  try {
    if (
      req.session &&
      req.session.user_id &&
      req.session.role === "instructor"
    ) {
      return res.json({
        status: "success",
        isInstructor: true,
        user: {
          user_id: req.session.user_id,
          username: req.session.username,
          fullname: req.session.fullname,
        },
      });
    }

    return res.json({
      status: "error",
      isInstructor: false,
      message: "Instructor access required",
      redirect: "/login",
    });
  } catch (error) {
    console.error("Check instructor error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error checking instructor status",
    });
  }
};

// --------------------
// SIGNUP (student/user default)
// --------------------
const signup = async (req, res) => {
  try {
    const { fullname, username, email, contact, password, confirm, track } =
      req.body;
    // ✅ track should be 'tesda' or 'driving' from frontend

    const fullnameTrimmed = (fullname || "").trim();
    const usernameTrimmed = (username || "").trim();
    const emailTrimmed = (email || "").trim();
    const contactTrimmed = (contact || "").trim();
    const trackCode = String(track || "")
      .trim()
      .toLowerCase();

    const errors = {};

    if (!fullnameTrimmed) errors.fullname = "Full name is required";
    if (!usernameTrimmed) errors.username = "Username is required";
    if (!emailTrimmed) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!confirm) errors.confirm = "Confirm password is required";

    if (password && confirm && password !== confirm) {
      errors.confirm = "Passwords do not match";
    }

    // ✅ require track to prevent "one acc both portals"
    if (trackCode !== "tesda" && trackCode !== "driving") {
      errors.track = "Track is required (tesda or driving)";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ status: "error", errors });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      [emailTrimmed, usernameTrimmed],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: "error",
        errors: { general: "Email or Username already exists" },
      });
    }

    const trackId = await getTrackIdByCode(trackCode);
    if (!trackId) {
      return res.status(400).json({
        status: "error",
        errors: { track: "Invalid track. Please select TESDA or Driving." },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ insert with track_id
    const [result] = await pool.execute(
      "INSERT INTO users (fullname, username, email, password, contact, role, track_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        fullnameTrimmed,
        usernameTrimmed,
        emailTrimmed,
        hashedPassword,
        contactTrimmed,
        "user",
        trackId,
      ],
    );

    return res.json({
      status: "success",
      message: "Account created successfully!",
      user: {
        id: result.insertId,
        fullname: fullnameTrimmed,
        username: usernameTrimmed,
        email: emailTrimmed,
        contact: contactTrimmed,
        role: "user",
        track: trackCode,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      status: "error",
      errors: { general: "Something went wrong. Try again" },
    });
  }
};

// --------------------
// SIGNUP INSTRUCTOR (optional)
// --------------------
const signupInstructor = async (req, res) => {
  try {
    const { fullname, username, email, contact, password, confirm } = req.body;

    const fullnameTrimmed = (fullname || "").trim();
    const usernameTrimmed = (username || "").trim();
    const emailTrimmed = (email || "").trim();
    const contactTrimmed = (contact || "").trim();

    const errors = {};

    if (!fullnameTrimmed) errors.fullname = "Full name is required";
    if (!usernameTrimmed) errors.username = "Username is required";
    if (!emailTrimmed) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!confirm) errors.confirm = "Confirm password is required";

    if (password && confirm && password !== confirm) {
      errors.confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ status: "error", errors });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      [emailTrimmed, usernameTrimmed],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: "error",
        errors: { general: "Email or Username already exists" },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // instructors don't need track_id (NULL)
    const [result] = await pool.execute(
      "INSERT INTO users (fullname, username, email, password, contact, role, track_id) VALUES (?, ?, ?, ?, ?, ?, NULL)",
      [
        fullnameTrimmed,
        usernameTrimmed,
        emailTrimmed,
        hashedPassword,
        contactTrimmed,
        "instructor",
      ],
    );

    return res.json({
      status: "success",
      message: "Instructor account created successfully!",
      user: {
        id: result.insertId,
        fullname: fullnameTrimmed,
        username: usernameTrimmed,
        email: emailTrimmed,
        contact: contactTrimmed,
        role: "instructor",
      },
    });
  } catch (error) {
    console.error("Signup instructor error:", error);
    return res.status(500).json({
      status: "error",
      errors: { general: "Something went wrong. Try again" },
    });
  }
};

// --------------------
// CHECK USERNAME
// --------------------
const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Username cannot be empty",
      });
    }

    const trimmedUsername = username.trim();

    const [users] = await pool.execute(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [trimmedUsername],
    );

    if (users.length > 0) {
      return res.json({ status: "taken", message: "Username already taken" });
    }
    return res.json({ status: "available", message: "Username available" });
  } catch (error) {
    console.error("Check username error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

// --------------------
// LOGOUT
// --------------------
const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({
          status: "error",
          message: "Logout failed",
        });
      }

      res.clearCookie("connect.sid");

      return res.json({
        status: "success",
        message: "Logged out successfully",
        redirect: "/login",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error during logout",
    });
  }
};

// --------------------
// TEST
// --------------------
const test = (req, res) => {
  res.json({
    message: "Auth API is working",
    sessionInfo: req.sessionID
      ? {
          sessionId: req.sessionID,
          userId: req.session.user_id || "No user",
          role: req.session.role || "No role",
          track: req.session.track_code || null,
        }
      : "No session",
  });
};

module.exports = {
  login,
  signup,
  signupInstructor,
  logout,
  checkAuth,
  checkAdmin,
  checkInstructor,
  checkUsername,
  test,
};
