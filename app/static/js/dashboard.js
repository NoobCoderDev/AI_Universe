document.getElementById('logout-link').addEventListener('click', function(e) {
      e.preventDefault();
      logout();
  });
  
  document.getElementById('send-button').addEventListener('click', function() {
      sendMessage();
  });
  
  document.getElementById('user-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          sendMessage();
      }
  });
  
  document.querySelectorAll('.dropdown-content a').forEach(item => {
      item.addEventListener('click', function(e) {
          e.preventDefault();
          const model = this.getAttribute('data-model');
          const modelDisplay = document.querySelector('.model-display span');
          modelDisplay.textContent = this.textContent;
          console.log(`Selected model: ${model}`);
      });
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
  
  function sendMessage() {
      const messageInput = document.getElementById('user-input');
      const message = messageInput.value.trim();
      
      if (message) {
          addUserMessage(message);
          messageInput.value = '';
          const selectedModel = document.querySelector('.model-display span').textContent;
          setTimeout(() => {
              const responseText = `This is a simulated response from ${selectedModel}. In a real implementation, this would be a response from the actual AI model.`;
              addBotMessage(responseText);
          }, 1000);
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
  }
  
  document.querySelector('.new-chat button').addEventListener('click', function() {
      document.getElementById('chat-messages').innerHTML = `
          <div class="message bot-message">
              <span>Welcome to AI Universe! How can I help you today?</span>
          </div>
      `;
      const chatList = document.querySelector('.chat-list');
      const newChatItem = document.createElement('li');
      newChatItem.className = 'chat-item';
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
  });