const express = require('express');
const router = express.Router();
const passport = require('passport');

// Login
router.post('/login', (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            console.log(" Invalid login attempt");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            console.log("Login successful for user:", user.username);
            console.log("Session after login:", req.session);
            res.json({ message: "Login successful", user });
        });
    })(req, res, next);
});

// GitHub Authentication
router.get('/github', (req, res, next) => {
    console.log("GitHub login route hit");
    next();
}, passport.authenticate('github'));

router.get('/github/callback',
    (req, res, next) => {
        console.log("GitHub callback route hit");
        next();
    },
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        console.log("GitHub authentication successful:", req.user);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

// Logout 
router.get('/logout', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "User not logged in" });
    }

    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }
        req.session.destroy(() => {
            res.clearCookie("connect.sid", { path: "/" });
            console.log("User successfully logged out.");
            res.json({ message: "Logged out successfully" });
        });
    });
});


module.exports = router;