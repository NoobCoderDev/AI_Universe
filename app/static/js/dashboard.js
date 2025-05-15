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
    let defaultModel = 'claude-3-5-sonnet';
    sessionStorage.setItem('selected_model', defaultModel);
    
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
    
    if (chatMessages.children.length === 0) {
        addBotMessage("Welcome to AI Universe! How can I help you today?");
    }
    
    sendButton.addEventListener('click', function() {
        sendMessageWithPuter();
    });
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessageWithPuter();
        }
    });
    
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.chat-item').forEach(i => {
                i.classList.remove('active');
            });
            this.classList.add('active');
            console.log(`Selected chat: ${this.querySelector('span').textContent}`);
        });
    });
    
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
    
    sessionStorage.removeItem('active_chat_id');
    sessionStorage.removeItem('conversation_history');
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
    const chats = [
        {id: 1, title: 'Chat 1', last_message: 'Welcome to AI Universe!', timestamp: '2023-05-15 14:30'},
        {id: 2, title: 'Chat 2', last_message: 'How does AI work?', timestamp: '2023-05-14 10:15'},
        {id: 3, title: 'Chat 3', last_message: 'Tell me about quantum computing', timestamp: '2023-05-12 16:45'},
    ];
    updateChatList(chats);
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
    
    if (chats.length > 0) {
        const firstChat = chatList.querySelector('.chat-item');
        firstChat.classList.add('active');
    }
}

function loadChat(chatId) {
    console.log(`Loading chat: ${chatId}`);
    sessionStorage.setItem('active_chat_id', chatId);
}

function getConversationHistory() {
    const history = sessionStorage.getItem('conversation_history');
    return history ? JSON.parse(history) : [];
}

function saveConversationHistory(history) {
    sessionStorage.setItem('conversation_history', JSON.stringify(history));
}

function addToConversationHistory(role, content) {
    const history = getConversationHistory();
    history.push({ role: role, content: content });
    saveConversationHistory(history);
    return history;
}

async function sendMessageWithPuter() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    addUserMessage(message);
    userInput.value = '';
    
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'flex';
    
    const conversationHistory = addToConversationHistory('user', message);
    
    const selectedModel = sessionStorage.getItem('selected_model') || 'claude-3-5-sonnet';
    
    try {
        const botMessageElement = createEmptyBotMessage();
        
        const supportsStreaming = ['claude-3-5-sonnet', 'claude-3-7-sonnet', 'gpt-4', 'gpt-3.5-turbo'].includes(selectedModel);
        
        const formattedMessages = formatMessagesForPuter(conversationHistory);
        
        if (supportsStreaming) {
            const response = await puter.ai.chat(formattedMessages, {
                model: selectedModel,
                stream: true
            });
            
            let fullResponse = '';
            
            const streamingIndicator = document.createElement('span');
            streamingIndicator.className = 'streaming-indicator';
            streamingIndicator.textContent = '...';
            botMessageElement.querySelector('span').appendChild(streamingIndicator);
            
            for await (const part of response) {
                if (part?.text) {
                    fullResponse += part.text;
                    botMessageElement.querySelector('span').textContent = fullResponse;
                    botMessageElement.querySelector('span').appendChild(streamingIndicator);
                    
                    const chatMessages = document.getElementById('chat-messages');
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }
            
            botMessageElement.querySelector('span').textContent = fullResponse;
            addToConversationHistory('assistant', fullResponse);
        } else {
            const response = await puter.ai.chat(formattedMessages, {
                model: selectedModel
            });
            
            const responseText = response.message.content[0].text;
            botMessageElement.querySelector('span').textContent = responseText;
            addToConversationHistory('assistant', responseText);
        }
    } catch (error) {
        console.error('Error from LLM API:', error);
        addBotMessage('Sorry, there was an error communicating with the AI model. Please try again.');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function formatMessagesForPuter(conversationHistory) {
    if (conversationHistory.length === 1) {
        return conversationHistory[0].content;
    }
    
    return conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
}

function createEmptyBotMessage() {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    const textSpan = document.createElement('span');
    textSpan.textContent = '';
    messageElement.appendChild(textSpan);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    document.querySelector('.center-logo').style.display = 'none';
    
    return messageElement;
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
    
    document.querySelector('.center-logo').style.display = 'none';
}