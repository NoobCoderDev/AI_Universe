document.addEventListener('DOMContentLoaded', function() {
    initSidebarStrip();
    initModelSelector();
    initChatInteraction();
    initSearchFunctionality();
    fetchChatHistory();
});

function initSidebarStrip() {
    const stripItems = document.querySelectorAll('.strip-item');
    stripItems.forEach(item => {
        item.addEventListener('click', function() {
            stripItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initModelSelector() {
    const modelItems = document.querySelectorAll('.dropdown-content a');
    const modelDisplay = document.querySelector('.model-display span');
    
    modelItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const modelName = this.textContent;
            const modelId = this.getAttribute('data-model');
            modelDisplay.textContent = modelName;
            sessionStorage.setItem('selected_model', modelId);
            console.log(`Selected model: ${modelId}`);
        });
    });
}

function initChatInteraction() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    // Add initial bot message if chat is empty
    if (chatMessages.children.length === 0) {
        addBotMessage("Welcome to AI Universe! How can I help you today?");
    }
    
    // Send message on button click
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
    
    // Send message on Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Chat item selection
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.chat-item').forEach(i => {
                i.classList.remove('active');
            });
            this.classList.add('active');
            // In a real app, you would load this chat's history
            console.log(`Selected chat: ${this.querySelector('span').textContent}`);
        });
    });
    
    // New chat button
    document.querySelector('.new-chat button').addEventListener('click', createNewChat);
}

function createNewChat() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    addBotMessage("Welcome to AI Universe! How can I help you today?");
    
    const chatList = document.querySelector('.chat-list');
    const newChatItem = document.createElement('li');
    newChatItem.className = 'chat-item';
    const newChatIcon = document.createElement('i');
    newChatIcon.className = 'bi bi-chat-dots';
    const newChatSpan = document.createElement('span');
    const chatNumber = chatList.children.length + 1;
    newChatSpan.textContent = `Chat ${chatNumber}`;
    
    newChatItem.appendChild(newChatIcon);
    newChatItem.appendChild(newChatSpan);
    
    newChatItem.addEventListener('click', function() {
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        this.classList.add('active');
    });
    
    chatList.appendChild(newChatItem);
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    newChatItem.classList.add('active');
    
    // Reset the active chat ID
    sessionStorage.removeItem('active_chat_id');
}

function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-input input');
    const chatItems = document.querySelectorAll('.chat-item');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('span').textContent.toLowerCase();
            if (chatName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function fetchChatHistory() {
    fetch('/api/chat_history')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateChatList(data.chats);
            }
        })
        .catch(error => {
            console.error('Error fetching chat history:', error);
        });
}

function updateChatList(chats) {
    const chatList = document.querySelector('.chat-list');
    chatList.innerHTML = '';
    
    chats.forEach(chat => {
        const chatItem = document.createElement('li');
        chatItem.className = 'chat-item';
        chatItem.setAttribute('data-id', chat.id);
        
        const icon = document.createElement('i');
        icon.className = 'bi bi-chat-dots';
        
        const span = document.createElement('span');
        span.textContent = chat.title;
        
        chatItem.appendChild(icon);
        chatItem.appendChild(span);
        
        chatItem.addEventListener('click', function() {
            const chatId = this.getAttribute('data-id');
            loadChat(chatId);
            
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        chatList.appendChild(chatItem);
    });
    
    // Select the first chat by default
    if (chats.length > 0) {
        const firstChat = chatList.querySelector('.chat-item');
        firstChat.classList.add('active');
        loadChat(chats[0].id);
    }
}

function loadChat(chatId) {
    fetch(`/chat/${chatId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Loaded chat:', data);
            // In a real app, you would display the chat messages
            sessionStorage.setItem('active_chat_id', chatId);
        })
        .catch(error => {
            console.error('Error loading chat:', error);
        });
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message !== '') {
        addUserMessage(message);
        userInput.value = '';
        
        const selectedModel = sessionStorage.getItem('selected_model') || 'claude-3-5-sonnet';
        
        // Make API request to send message
        fetch('/api/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                model: selectedModel,
                chat_id: sessionStorage.getItem('active_chat_id')
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                addBotMessage(data.response);
            } else {
                addBotMessage('Sorry, there was an error processing your request.');
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            addBotMessage('Sorry, there was an error communicating with the server.');
        });
    }
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    messageElement.appendChild(textSpan);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Hide the center logo when messages are present
    document.querySelector('.center-logo').style.display = 'none';
}

function addBotMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    messageElement.appendChild(textSpan);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Hide the center logo when messages are present
    document.querySelector('.center-logo').style.display = 'none';
}