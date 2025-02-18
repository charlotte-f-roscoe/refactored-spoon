const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');


const app = express();


// Load environment variables
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// CORS
const allowedOrigins = [
    "https://refactored-spoon-bpck.onrender.com",
    "https://a4-charlotte-f-roscoe-backend.onrender.com" ];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.set("trust proxy", 1);


// Session middleware
app.use(session({
    secret: "superAwesomeSecretKey",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: true,
        sameSite: "none",
        httpOnly: true
    }
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// API routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Session data:", req.session);
    console.log("User data:", req.user);
    next();
});

// Serve React Frontend
// Serve React Frontend (for production)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));

    // This ensures React handles all unknown routes
    app.get("*", (req, res) => {
        console.log(`Frontend route request: ${req.url}`); // Debugging log
        res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
    });
}


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
