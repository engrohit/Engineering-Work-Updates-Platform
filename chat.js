// Chat System for Engineering Platform

class ChatSystem {
    constructor() {
        this.currentUser = null;
        this.currentGroup = null;
        this.messages = [];
        this.isOpen = false;
        this.unreadCount = 0;
        this.init();
    }

    init() {
        // Get current user session
        const session = JSON.parse(localStorage.getItem('userSession') || '{}');
        if (session.userId) {
            this.currentUser = session;
            this.currentGroup = session.groupId;
            this.loadMessages();
            this.createChatInterface();
            this.startMessagePolling();
        }
    }

    createChatInterface() {
        // Create chat toggle button
        const chatToggle = document.createElement('div');
        chatToggle.className = 'chat-toggle';
        chatToggle.innerHTML = `
            <div class="chat-icon">💬</div>
            <div class="chat-badge" id="chatBadge" style="display: none;">0</div>
        `;
        chatToggle.onclick = () => this.toggleChat();
        
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.id = 'chatContainer';
        chatContainer.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <h4>Group Chat</h4>
                    <small>${this.currentUser.groupName}</small>
                </div>
                <div class="chat-controls">
                    <button class="chat-minimize" onclick="chatSystem.toggleChat()">−</button>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="chat-welcome">
                    <div class="welcome-icon">👋</div>
                    <p>Welcome to the group chat!</p>
                    <small>Start chatting with your team members</small>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="chat-input-group">
                    <input type="text" id="chatInput" class="chat-input" placeholder="Type your message..." onkeypress="chatSystem.handleKeyPress(event)">
                    <button class="chat-send" onclick="chatSystem.sendMessage()">
                        <span class="send-icon">📤</span>
                    </button>
                </div>
                <div class="chat-typing" id="chatTyping" style="display: none;">
                    <small>Someone is typing...</small>
                </div>
            </div>
        `;

        // Add chat styles
        this.addChatStyles();
        
        // Append to body
        document.body.appendChild(chatToggle);
        document.body.appendChild(chatContainer);
        
        // Load existing messages
        this.renderMessages();
    }

    addChatStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chat-toggle {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                z-index: 1000;
                user-select: none;
            }

            .chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
            }

            .chat-icon {
                font-size: 24px;
                position: relative;
            }

            .chat-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #f56565;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .chat-container {
                position: fixed;
                bottom: 30px;
                right: 100px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(102, 126, 234, 0.2);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
            }

            .chat-container.open {
                display: flex;
                animation: chatSlideIn 0.3s ease;
            }

            @keyframes chatSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chat-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-title h4 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .chat-title small {
                opacity: 0.9;
                font-size: 0.8rem;
            }

            .chat-minimize {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }

            .chat-minimize:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .chat-messages::-webkit-scrollbar {
                width: 4px;
            }

            .chat-messages::-webkit-scrollbar-track {
                background: #e2e8f0;
            }

            .chat-messages::-webkit-scrollbar-thumb {
                background: #cbd5e0;
                border-radius: 2px;
            }

            .chat-welcome {
                text-align: center;
                padding: 40px 20px;
                color: #718096;
            }

            .welcome-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }

            .welcome-icon + p {
                font-weight: 600;
                color: #4a5568;
                margin-bottom: 5px;
            }

            .message {
                max-width: 80%;
                margin-bottom: 8px;
                animation: messageSlideIn 0.3s ease;
            }

            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .message.own {
                align-self: flex-end;
            }

            .message.own .message-bubble {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 18px 18px 4px 18px;
            }

            .message:not(.own) .message-bubble {
                background: white;
                color: #2d3748;
                border-radius: 18px 18px 18px 4px;
                border: 1px solid #e2e8f0;
            }

            .message-bubble {
                padding: 10px 15px;
                word-wrap: break-word;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .message-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
                font-size: 0.75rem;
            }

            .message.own .message-info {
                flex-direction: row-reverse;
            }

            .message-author {
                font-weight: 600;
                color: #4a5568;
            }

            .message.own .message-author {
                color: #667eea;
            }

            .message-time {
                color: #a0aec0;
                font-size: 0.7rem;
            }

            .message.own .message-time {
                color: rgba(102, 126, 234, 0.7);
            }

            .chat-input-area {
                padding: 15px;
                background: white;
                border-top: 1px solid #e2e8f0;
            }

            .chat-input-group {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .chat-input {
                flex: 1;
                padding: 10px 15px;
                border: 2px solid #e2e8f0;
                border-radius: 20px;
                font-size: 0.9rem;
                outline: none;
                transition: border-color 0.3s ease;
            }

            .chat-input:focus {
                border-color: #667eea;
            }

            .chat-send {
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
            }

            .chat-send:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .chat-send:active {
                transform: scale(0.95);
            }

            .send-icon {
                font-size: 14px;
            }

            .chat-typing {
                margin-top: 8px;
                padding: 0 15px;
                color: #718096;
                font-style: italic;
            }

            .system-message {
                text-align: center;
                color: #718096;
                font-size: 0.8rem;
                font-style: italic;
                margin: 10px 0;
                padding: 8px;
                background: rgba(113, 128, 150, 0.1);
                border-radius: 12px;
            }

            .online-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: #48bb78;
                border-radius: 50%;
                margin-right: 5px;
                animation: blink 2s infinite;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }

            @media (max-width: 768px) {
                .chat-container {
                    bottom: 20px;
                    right: 20px;
                    left: 20px;
                    width: auto;
                    height: 400px;
                }

                .chat-toggle {
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('chatContainer');
        if (this.isOpen) {
            container.classList.add('open');
            this.scrollToBottom();
            this.markMessagesAsRead();
            document.getElementById('chatInput').focus();
        } else {
            container.classList.remove('open');
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        const newMessage = {
            id: Date.now(),
            text: message,
            author: this.currentUser.name,
            authorId: this.currentUser.userId,
            groupId: this.currentGroup,
            timestamp: new Date().toISOString(),
            isOwn: true
        };

        this.messages.push(newMessage);
        this.saveMessages();
        this.renderMessage(newMessage);
        this.scrollToBottom();
        
        input.value = '';
        
        // Simulate response from other users (for demo purposes)
        if (Math.random() > 0.7) {
            setTimeout(() => this.simulateResponse(), 1000 + Math.random() * 2000);
        }
    }

    simulateResponse() {
        const responses = [
            "Got it, thanks for the update!",
            "I'll check on that site tomorrow.",
            "Can you share the coordinates?",
            "Status looks good from my end.",
            "I'm heading to that location now.",
            "Let me know if you need any help.",
            "Site maintenance completed successfully.",
            "All systems are operational."
        ];

        const authors = [
            { name: 'Rohit Rajput', id: 'ENG001' },
            { name: 'Sanjay Kumar', id: 'ENG002' },
            { name: 'Network Admin', id: 'ADMIN' }
        ];

        const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        if (randomAuthor.id !== this.currentUser.userId) {
            const responseMessage = {
                id: Date.now(),
                text: randomResponse,
                author: randomAuthor.name,
                authorId: randomAuthor.id,
                groupId: this.currentGroup,
                timestamp: new Date().toISOString(),
                isOwn: false
            };

            this.messages.push(responseMessage);
            this.saveMessages();
            this.renderMessage(responseMessage);
            this.scrollToBottom();
            
            if (!this.isOpen) {
                this.showNewMessageNotification();
            }
        }
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        const welcome = container.querySelector('.chat-welcome');
        
        if (this.messages.length > 0 && welcome) {
            welcome.remove();
        }

        this.messages.forEach(message => {
            this.renderMessage(message, false);
        });
        
        this.scrollToBottom();
    }

    renderMessage(message, animate = true) {
        const container = document.getElementById('chatMessages');
        const welcome = container.querySelector('.chat-welcome');
        
        if (welcome) {
            welcome.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.authorId === this.currentUser.userId ? 'own' : ''}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageEl.innerHTML = `
            <div class="message-info">
                <span class="message-author">${message.author}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-bubble">
                ${message.text}
            </div>
        `;

        container.appendChild(messageEl);
        
        if (animate) {
            messageEl.style.animation = 'messageSlideIn 0.3s ease';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('chatMessages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }

    showNewMessageNotification() {
        this.unreadCount++;
        const badge = document.getElementById('chatBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'flex';
        }
    }

    markMessagesAsRead() {
        this.unreadCount = 0;
        const badge = document.getElementById('chatBadge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    loadMessages() {
        const stored = localStorage.getItem(`chat_messages_${this.currentGroup}`);
        if (stored) {
            this.messages = JSON.parse(stored);
        }
    }

    saveMessages() {
        localStorage.setItem(`chat_messages_${this.currentGroup}`, JSON.stringify(this.messages));
    }

    startMessagePolling() {
        // In a real application, this would poll the server for new messages
        // For demo purposes, we'll just check local storage periodically
        setInterval(() => {
            this.checkForNewMessages();
        }, 5000);
    }

    checkForNewMessages() {
        const stored = localStorage.getItem(`chat_messages_${this.currentGroup}`);
        if (stored) {
            const storedMessages = JSON.parse(stored);
            if (storedMessages.length > this.messages.length) {
                const newMessages = storedMessages.slice(this.messages.length);
                newMessages.forEach(message => {
                    this.messages.push(message);
                    this.renderMessage(message);
                    if (!this.isOpen && message.authorId !== this.currentUser.userId) {
                        this.showNewMessageNotification();
                    }
                });
                this.scrollToBottom();
            }
        }
    }

    addSystemMessage(text) {
        const container = document.getElementById('chatMessages');
        if (container) {
            const systemEl = document.createElement('div');
            systemEl.className = 'system-message';
            systemEl.textContent = text;
            container.appendChild(systemEl);
            this.scrollToBottom();
        }
    }
}

// Initialize chat system
let chatSystem;

// Check if user is logged in and initialize chat
document.addEventListener('DOMContentLoaded', function() {
    const session = localStorage.getItem('userSession');
    if (session) {
        setTimeout(() => {
            chatSystem = new ChatSystem();
        }, 1000); // Delay to ensure page is fully loaded
    }
});

// Add chat notification when user logs in
function initializeChat() {
    if (typeof chatSystem === 'undefined') {
        chatSystem = new ChatSystem();
        setTimeout(() => {
            chatSystem.addSystemMessage(`${chatSystem.currentUser.name} joined the chat`);
        }, 500);
    }
}
