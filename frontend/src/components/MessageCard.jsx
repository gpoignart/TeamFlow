import React from 'react';

/*
 * Component to display an individual chat message.
 * Uses TailwindCSS for clean styling.
 */
const MessageCard = ({ message }) => {
    if (!message) return null;

    // Safely get the sender's username
    const senderName = message.sender?.username || 'Unknown User'; 
    
    // Format the timestamp for display
    const time = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 transition duration-100 hover:shadow-md">
            <div className="flex justify-between items-center mb-1">
                {/* Sender name */}
                <span className="font-semibold text-sm text-indigo-600">
                    {senderName}
                </span>
                {/* time */}
                <span className="text-xs text-gray-500">
                    {time}
                </span>
            </div>
            {/* content */}
            <p className="text-gray-800 text-sm whitespace-pre-wrap">
                {message.content}
            </p>
        </div>
    );
};

export default MessageCard;
