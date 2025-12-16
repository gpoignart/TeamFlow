//User Page

import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    email: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Charger la liste des users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/users`);
        if (!res.ok) {
          throw new Error("Failed to load users");
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Error while loading users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Quand on choisit un user, remplir le formulaire
  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setFormData({
      id: user.id,
      username: user.username || "",
      email: user.email || "",
      role: user.role || "member"
    });
  };

  // Changement dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Enregistrer les modifications (PUT /users/:id)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/users/${selectedUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          role: formData.role
        })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Failed to update user");
      }

      const updated = await res.json();

      // Mettre à jour la liste localement
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (err) {
      setError(err.message || "Error while saving user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <section className="lg:w-1/2 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Users list</h2>
        {loading && <p>Loading users…</p>}
        {error && (
          <p className

