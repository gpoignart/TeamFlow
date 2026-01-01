import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage } from '../services/api';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchChat = async () => {
    try {
      const data = await getMessages();
      // Le backend renvoie du plus récent au plus ancien, on inverse pour l'affichage classique
      setMessages(data.reverse()); 
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000); // Polling rapide
    return () => clearInterval(interval);
  }, []);

  // Scroll automatique vers le bas à l'arrivée d'un message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(text);
    setText('');
    fetchChat();
  };

  return (
    // Container principal avec hauteur fixe (hauteur écran - hauteur header ~80px)
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      
      {/* En-tête du chat */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                💬
            </div>
            <div>
                <h2 className="font-bold text-lg">Discussion d'équipe</h2>
                <p className="text-xs text-blue-100 opacity-90">En ligne</p>
            </div>
        </div>
      </div>

      {/* Zone des messages (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
                <p>Aucun message. Lancez la discussion !</p>
            </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm relative group ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                {!isMe && (
                    <span className="text-[10px] font-bold text-blue-500 block mb-1 uppercase tracking-wider">
                        {msg.sender?.username || 'Utilisateur'}
                    </span>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {/* Heure au survol */}
                <span className={`text-[10px] absolute -bottom-5 w-20 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 ${isMe ? 'text-right right-0' : 'left-0'}`}>
                   {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Zone de saisie */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2 items-center bg-gray-100 rounded-full px-2 py-2 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            className="flex-1 bg-transparent border-none px-4 py-2 text-gray-800 focus:ring-0 placeholder-gray-400 outline-none"
            placeholder="Écrivez votre message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}