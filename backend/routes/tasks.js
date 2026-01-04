const express = require('express');
const router = express.Router();
const { db } = require("../db");
const Task = require("../models/Task");
const { authMiddleware } = require("../utils/auth");

// GET /tasks 
router.get("/", authMiddleware, async (req, res) => {
    await db.read();
    const userId = req.user.id;
    const user = db.data.users?.find(u => String(u.id) === String(userId));
    const userEmail = user?.email;

    // Find all teams the user is a member of or owns
    const userTeams = (db.data.teams || []).filter(
        t => String(t.owner) === String(userId) ||
            (t.members || []).some(m => m.email === userEmail)
    );
    const userTeamIds = userTeams.map(t => String(t.id));

    // Show tasks if:
    // - task.teamId is in user's teams (primary, for team tasks)
    // - OR userAllowedIds includes userId (legacy/personal tasks)
    const tasks = (db.data.tasks || []).filter(t => {
        // If the task has a teamId, show it to all team members/owner
        if (t.teamId && userTeamIds.includes(String(t.teamId))) return true;
        // Otherwise, fallback to userAllowedIds
        if (Array.isArray(t.userAllowedIds) && t.userAllowedIds.map(String).includes(String(userId))) return true;
        return false;
    });
    res.json(tasks);
});

// POST /tasks
router.post("/", authMiddleware, async (req, res) => {
    await db.read();

    // Now accepting priority, dueDate, and teamId
    const { title, description, assignedTo, userAllowedIds, priority, dueDate, teamId } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required." });
    }

    // Always set userAllowedIds to all team members (and owner) if teamId is provided
    let allowedUserIds = [];
    if (teamId) {
        const team = db.data.teams?.find(t => String(t.id) === String(teamId));
        if (team) {
            // Add owner
            allowedUserIds = [String(team.owner)];
            // Add all members (by user id, if found)
            const users = db.data.users || [];
            (team.members || []).forEach(m => {
                const user = users.find(u => u.email === m.email);
                if (user) allowedUserIds.push(String(user.id));
            });
        }
    }

    // Fallback to provided userAllowedIds if no team found
    if (!allowedUserIds.length && Array.isArray(userAllowedIds)) {
        allowedUserIds = userAllowedIds.map(String);
    }

    const currentTaskId = db.data.lastTaskId + 1;
    db.data.lastTaskId = currentTaskId;

    const newTask = new Task({ 
        id: currentTaskId, 
        title, 
        description, 
        status: 'todo',
        assignedTo, 
        userAllowedIds: allowedUserIds,
        priority: priority || 'medium',
        dueDate: dueDate || null,
        teamId: teamId || null
    });

    db.data.tasks.push(newTask);
    await db.write();
    
    res.status(201).json(newTask);
});

// PUT /tasks/:id
router.put("/:id", authMiddleware, async (req, res) => {
    await db.read();
    const taskId = parseInt(req.params.id);
    const { title, description, status, assignedTo, userAllowedIds, priority, dueDate, teamId } = req.body;

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
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (teamId !== undefined) task.teamId = teamId; // <-- ADD THIS LINE

    await db.write();
    res.json(task);
});

// DELETE /tasks/:id
router.delete("/:id", authMiddleware, async (req, res) => {
    await db.read();
    const taskId = parseInt(req.params.id);
    const taskIndex = db.data.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return res.status(404).json({ error: "Task not found." });

    db.data.tasks.splice(taskIndex, 1);
    await db.write();
    res.json({ message: "Task deleted successfully." });
});

module.exports = router;