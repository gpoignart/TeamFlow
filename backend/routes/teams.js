const express = require('express');
const router = express.Router();
const { db } = require("../db");
const { authMiddleware } = require("../utils/auth");

// GET /teams - Get teams (all or user's teams based on scope parameter)
router.get("/", authMiddleware, async (req, res) => {
    await db.read();
    const userId = req.user.id;
    const user = db.data.users?.find(u => String(u.id) === String(userId));
    const userEmail = user?.email;
    const scope = req.query.scope; // 'all' or undefined

    let teams;
    if (scope === 'all') {
        // Return all teams for "All Teams" tab
        teams = db.data.teams || [];
    } else {
        // Return only teams where user is owner or member
        teams = (db.data.teams || []).filter(
            t => String(t.owner) === String(userId) ||
                (t.members || []).some(m => m.email === userEmail)
        );
    }
    
    res.json(teams);
});

// POST /teams - Create a new team
router.post("/", authMiddleware, async (req, res) => {
    await db.read();
    const userId = req.user.id;
    const { name, description, industry, size, website, members } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Team name is required." });
    }

    // Generate unique team code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const teamId = Date.now();
    const newTeam = {
        id: teamId,
        name,
        description: description || "",
        industry: industry || "",
        size: size || "",
        website: website || "",
        owner: userId,
        members: members || [],
        code: generateCode(),
        createdAt: new Date().toISOString()
    };

    if (!db.data.teams) {
        db.data.teams = [];
    }

    db.data.teams.push(newTeam);
    await db.write();

    res.status(201).json(newTeam);
});

// PUT /teams/:id - Update team (add/remove members)
router.put("/:id", authMiddleware, async (req, res) => {
    await db.read();
    const teamId = parseInt(req.params.id) || req.params.id;
    const userId = req.user.id;
    
    const team = db.data.teams?.find(t => String(t.id) === String(teamId));
    
    if (!team) {
        return res.status(404).json({ error: "Team not found." });
    }

    // Only owner can update team
    if (String(team.owner) !== String(userId)) {
        return res.status(403).json({ error: "Only team owner can update the team." });
    }

    const { members, name, description, industry, size, website } = req.body;

    // Update team properties
    if (name !== undefined) team.name = name;
    if (description !== undefined) team.description = description;
    if (industry !== undefined) team.industry = industry;
    if (size !== undefined) team.size = size;
    if (website !== undefined) team.website = website;
    if (members !== undefined) team.members = members;

    await db.write();
    res.json(team);
});

// POST /teams/join - Join team by code
router.post("/join", authMiddleware, async (req, res) => {
    await db.read();
    const userId = req.user.id;
    const user = db.data.users?.find(u => String(u.id) === String(userId));
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Team code is required." });
    }

    const team = db.data.teams?.find(t => t.code === code);
    
    if (!team) {
        return res.status(404).json({ error: "Team not found with this code." });
    }

    // Check if already a member
    const isOwner = String(team.owner) === String(userId);
    const isMember = team.members.some(m => m.email === user.email);

    if (isOwner || isMember) {
        return res.status(400).json({ error: "You are already a member of this team." });
    }

    // Add user to team
    team.members.push({ email: user.email });
    
    // Update all tasks in this team to include the new member in userAllowedIds
    if (db.data.tasks) {
        db.data.tasks.forEach(task => {
            if (String(task.teamId) === String(team.id)) {
                // Add new member to userAllowedIds if not already there
                if (!task.userAllowedIds) task.userAllowedIds = [];
                const userIdStr = String(userId);
                if (!task.userAllowedIds.map(String).includes(userIdStr)) {
                    task.userAllowedIds.push(userIdStr);
                }
            }
        });
    }
    
    await db.write();

    res.json(team);
});

// DELETE /teams/:id - Delete team
router.delete("/:id", authMiddleware, async (req, res) => {
    await db.read();
    const teamId = parseInt(req.params.id) || req.params.id;
    const userId = req.user.id;

    const team = db.data.teams?.find(t => String(t.id) === String(teamId));
    
    if (!team) {
        return res.status(404).json({ error: "Team not found." });
    }

    // Only owner can delete team
    if (String(team.owner) !== String(userId)) {
        return res.status(403).json({ error: "Only team owner can delete the team." });
    }

    db.data.teams = db.data.teams.filter(t => String(t.id) !== String(teamId));
    await db.write();

    res.json({ message: "Team deleted successfully." });
});

module.exports = router;
