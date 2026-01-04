const { db } = require('../db');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'member';
    // New: Avatar URL (can be a link to an image)
    this.avatar = data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=random`;
  }

  static getAll() {
    return db.data ? db.data.users : [];
  }

  static findById(id) {
    const users = this.getAll();
    return users.find(u => u.id === parseInt(id));
  }

  static async create(data) {
    const users = this.getAll();
    
    // Basic Validation
    if (!data.username || data.username.length < 3) throw new Error("Username must be at least 3 chars.");
    if (!data.password || data.password.length < 6) throw new Error("Password must be at least 6 chars.");

    const exists = users.find(u => u.username === data.username || (data.email && u.email === data.email));
    if (exists) throw new Error("Username or email already in use.");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    db.data.lastUserId++;
    
    const newUser = new User({
      id: db.data.lastUserId,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      avatar: data.avatar // Allow setting it initially
    });

    users.push(newUser);
    await db.write();
    return newUser;
  }

  static async update(id, updates) {
    const userId = parseInt(id);
    const users = this.getAll();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) return null;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = { ...users[userIndex], ...updates };
    // Ensure the User class structure is kept
    users[userIndex] = updatedUser;

    await db.write();
    return new User(updatedUser);
  }

  static toSafeObject(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = User;