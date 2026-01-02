import React, { useState } from "react";

export default function CreateTaskModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreate({ title, description });
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay background
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Clickable zone to close */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
        >
          Close
        </button>
      </div>

      {/* Glassmorphism */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 transform transition-all scale-100">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">New task</h2>
            <p className="text-sm text-gray-500 mt-1">Add an element to the dashboard.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Task title</label>
            <input
              autoFocus
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              placeholder="Ex: Update doc..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description<span className="text-gray-400 font-normal">(Optional)</span></label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm resize-none"
              placeholder="More details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 px-5 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02]"
            >
              {loading ? "Creating..." : "Add the task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}