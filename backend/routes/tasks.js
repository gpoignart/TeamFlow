const express = require('express');
const router = express.Router();
const { db } = require("../db");
const Task = require("../models/Task");
// require filters from utils according to project structure
const { filterTasks } = require("../tasks/filter");

// GET /tasks 
// return the list of tasks the current user can see
router.get("/", async (req, res) => {
    await db.read();
    
    const userId = req.query.userId || (req.body && req.body.userId); 

    // Debug log
    console.log("GET /tasks - UserId reçu :", userId);

    if (!userId) {
        return res.status(400).json({ error: "Need a userId." });
    }

    const tasks = db.data.tasks.filter(t => 
        t.userAllowedIds && t.userAllowedIds.map(String).includes(String(userId))
    );

    res.json(tasks);
});

// GET /tasks/filter
router.get("/filter", async (req, res) => {
    await db.read();

    const { userId, status, assignedTo, search } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    const tasks = filterTasks({ userId, status, assignedTo, search });

    res.json(tasks);
});

// 2. POST /tasks
// create a new task
router.post("/", async (req, res) => {
    await db.read();

    const { title, description, assignedTo, userAllowedIds } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required." });
    }

    const currentTaskId = db.data.lastTaskId + 1;
    db.data.lastTaskId = currentTaskId;

    const newTask = new Task({ 
        id: currentTaskId, 
        title, 
        description, 
        status: 'todo',
        assignedTo, 
        userAllowedIds: userAllowedIds || [] 
    });

    db.data.tasks.push(newTask);
    await db.write();
    
    res.status(201).json(newTask);
});

// 3. PUT /tasks/:id
// update task info by id
router.put("/:id", async (req, res) => {
    await db.read();
    const taskId = parseInt(req.params.id);
    const { title, description, status, assignedTo, userAllowedIds } = req.body;

    const taskIndex = db.data.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found." });
    }

    const task = db.data.tasks[taskIndex];
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (userAllowedIds !== undefined) task.userAllowedIds = userAllowedIds;

    await db.write();
    res.json(task);
});

// 4. DELETE /tasks/:id
// delete a task by id
router.delete("/:id", async (req, res) => {
    await db.read();
    const taskId = parseInt(req.params.id);

    const taskIndex = db.data.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found." });
    }

    db.data.tasks.splice(taskIndex, 1);
    
    await db.write();
    res.json({ message: "Task deleted successfully." });
});

module.exports = router;
