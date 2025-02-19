const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    console.log("User authentication check:", req.isAuthenticated());
    if (req.isAuthenticated()) {
        console.log("User authentication successful");
        return next();
    }
    res.status(401).json({ error: "Unauthorized!!" });
}

// calculate deadline based on priority
function calculateDeadline(startDate, priority) {
    const date = new Date(startDate);
    let daysToAdd = 0;

    if (priority === "High") {
        daysToAdd = 1;
    } else if (priority === "Medium") {
        daysToAdd = 3;
    } else if (priority === "Low") {
        daysToAdd = 5;
    }

    date.setDate(date.getDate() + daysToAdd);
    return date;
}

//  Edit task
router.put("/:id", ensureAuthenticated, async (req, res) => {
    try {
        console.log("Update request received for task:", req.params.id, "with data:", req.body);

        const { description, priority, startDate } = req.body;
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        if (description) task.description = description;
        if (priority) task.priority = priority;
        if (startDate) {
            task.startDate = startDate;
            task.deadline = calculateDeadline(startDate, priority || task.priority);
        }

        await task.save();
        console.log("Task successfully updated:", task);
        res.json(task);
    } catch (err) {
        console.error("Error updating task:", err.message);
        res.status(500).json({ error: err.message });
    }
});


//  Get all tasks
router.get("/", (req, res, next) => {
    console.log("GET /api/tasks was called");
    next();
}, ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        console.log("Sending tasks response:", tasks);
        res.json(Array.isArray(tasks) ? tasks : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Add task
router.post("/", ensureAuthenticated, async (req, res) => {
    try {
        const { description, priority, startDate } = req.body;
        if (!description || !priority || !startDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const deadline = calculateDeadline(startDate, priority);

        const newTask = new Task({
            user: req.user._id,
            description,
            priority,
            startDate,
            deadline,
        });

        await newTask.save();
        res.json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Delete task
router.delete("/:id", ensureAuthenticated, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json({ success: true, taskId: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
