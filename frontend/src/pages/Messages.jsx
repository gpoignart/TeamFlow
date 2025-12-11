
// ----------------------------------------------------------------------------
// BETA VERSION, NEEDS TO BE VERIFIED AND REWORKED BY MEMBER 12
// This part was coded to test the whole system.
// The main.jsx was locally modified to display the Message page as it was not coded yet.
// ----------------------------------------------------------------------------

// frontend/pages/Messages.jsx

import React, { useState, useEffect, useRef } from 'react';
import MessageCard from '../components/MessageCard';
import { getMessages, sendMessage } from '../services/api'; 
// NOTE: Must ensure 'react-router-dom' is available if redirection is needed

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null); // Ref to enable auto-scrolling

    // Auto-scrolls the chat area to the bottom (latest message)
    const scrollToBottom = () => {
        // Ensures the scroll happens after new messages are rendered
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); 
    }

    // Function to fetch messages from the API
    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMessages();
            
            // Member 5's task specifies sorting newest to oldest. 
            // For a chat UI (bottom-up), we reverse to display oldest on top, newest on bottom.
            setMessages(data.reverse()); 
            
        } catch (err) {
            console.error('Error fetching messages:', err.message);
            // Display an error message if the token failed or API is down
            setError(err.message.includes('Unauthorized') 
                ? 'Your session has expired. Please log in.' 
                : 'Could not load messages.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Handler for sending a new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const contentToSend = newMessageContent.trim();
        if (!contentToSend) return;

        setLoading(true); // Disable input while sending

        try {
            // 1. Send via API
            await sendMessage(contentToSend);
            
            // 2. Clear input
            setNewMessageContent('');
            
            // 3. Refresh list to display the new message
            await fetchMessages(); 
            
        } catch (err) {
            console.error('Error sending message:', err.message);
            setError('Failed to send message: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial load of messages when the component mounts
    useEffect(() => {
        fetchMessages();
    }, []);

    // Effect to auto-scroll after messages state changes (new message arrives)
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    return (
        <div className="flex flex-col h-full max-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-4 border-b pb-2">Team Chat</h1>

            {/* Message List Area (scrollable) */}
            <div className="flex-grow overflow-y-auto p-4 bg-white rounded-lg shadow-xl mb-4 space-y-3">
                {loading && <p className="text-center text-gray-500">Loading messages...</p>}
                {error && <p className="text-center text-red-500 font-medium p-2 border border-red-200 rounded-md">{error}</p>}
                
                {/* Rendering the messages */}
                {!loading && messages && messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageCard key={message.id || message.createdAt} message={message} />
                    ))
                ) : (
                    !loading && !error && <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
                )}
                <div ref={messagesEndRef} /> {/* Scroll anchor point */}
            </div>

            {/* Message Submission Form */}
            <form onSubmit={handleSendMessage} className="flex space-x-3 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
                <textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none h-14"
                    rows="1" 
                    disabled={loading}
                    // Submit on Enter key press
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            handleSendMessage(e);
                        }
                    }}
                />
                <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out disabled:bg-gray-400"
                    disabled={!newMessageContent.trim() || loading}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default Messages;
