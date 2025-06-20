import React, { useState } from 'react';
import { Send, MessageCircle, Search } from 'lucide-react';
import { AppState } from '../types';

interface MessagesProps {
  state: AppState;
  onSendMessage: (receiverId: string, content: string) => void;
  onSelectConversation: (conversationId: string) => void;
}

export const Messages: React.FC<MessagesProps> = ({ 
  state, 
  onSendMessage, 
  onSelectConversation 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const { currentUser, users, conversations, selectedConversationId } = state;
  
  if (!currentUser) return null;

  const userConversations = conversations.filter(c => 
    c.participants.includes(currentUser.id)
  );

  const selectedConversation = userConversations.find(c => 
    c.id === selectedConversationId
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.participants.find(id => id !== currentUser.id);
    if (receiverId) {
      onSendMessage(receiverId, newMessage);
      setNewMessage('');
    }
  };

  const startNewConversation = (userId: string) => {
    const existingConversation = userConversations.find(c => 
      c.participants.includes(userId)
    );
    
    if (existingConversation) {
      onSelectConversation(existingConversation.id);
    } else {
      // Send a message to create new conversation
      onSendMessage(userId, "Hello! 👋");
    }
    setSearchUser('');
  };

  const filteredUsers = users.filter(user => 
    user.id !== currentUser.id &&
    (user.displayName.toLowerCase().includes(searchUser.toLowerCase()) ||
     user.username.toLowerCase().includes(searchUser.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-96">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-full">
              {/* Search Results */}
              {searchUser && (
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 px-2 mb-2">USERS</p>
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startNewConversation(user.id)}
                      className="w-full p-3 hover:bg-gray-50 transition-colors text-left rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Existing Conversations */}
              {userConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="text-sm text-gray-400">Search for users to start messaging</p>
                </div>
              ) : (
                userConversations.map((conversation) => {
                  const otherUserId = conversation.participants.find(id => id !== currentUser.id);
                  const otherUser = users.find(u => u.id === otherUserId);
                  
                  if (!otherUser) return null;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`w-full p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                        selectedConversationId === conversation.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{otherUser.displayName}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  {(() => {
                    const otherUserId = selectedConversation.participants.find(id => id !== currentUser.id);
                    const otherUser = users.find(u => u.id === otherUserId);
                    
                    return otherUser ? (
                      <div className="flex items-center space-x-3">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{otherUser.displayName}</h3>
                          <p className="text-sm text-gray-500">@{otherUser.username}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => {
                    const isOwn = message.senderId === currentUser.id;
                    const sender = users.find(u => u.id === message.senderId);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};