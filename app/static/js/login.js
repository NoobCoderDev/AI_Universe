function showToast(message, isError = false) {
      Toastify({
          text: message,
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: isError ? "#dc3545" : "#28a745",
          stopOnFocus: true
      }).showToast();
  }
  
  function validateUsername(username) {
      if (!username || username.trim() === '') {
          return 'Username is required';
      }
      return null;
  }
  
  function validatePassword(password) {
      if (!password || password.trim() === '') {
          return 'Password is required';
      }
      return null;
  }
  
  function validateForm() {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      let isValid = true;
  
      const usernameError = validateUsername(username);
      const usernameInput = document.getElementById('username');
      const usernameFeedback = document.getElementById('username-feedback');
  
      if (usernameError) {
          usernameInput.classList.add('is-invalid');
          usernameFeedback.textContent = usernameError;
          usernameFeedback.style.display = 'block';
          isValid = false;
          showToast(usernameError, true);
      } else {
          usernameInput.classList.remove('is-invalid');
          usernameFeedback.style.display = 'none';
      }
  
      const passwordError = validatePassword(password);
      const passwordInput = document.getElementById('password');
      const passwordFeedback = document.getElementById('password-feedback');
  
      if (passwordError) {
          passwordInput.classList.add('is-invalid');
          passwordFeedback.textContent = passwordError;
          passwordFeedback.style.display = 'block';
          isValid = false;
          showToast(passwordError, true);
      } else {
          passwordInput.classList.remove('is-invalid');
          passwordFeedback.style.display = 'none';
      }
  
      return isValid;
  }
  
  document.getElementById('username').addEventListener('blur', function() {
      const error = validateUsername(this.value);
      const feedback = document.getElementById('username-feedback');
  
      if (error) {
          this.classList.add('is-invalid');
          feedback.textContent = error;
          feedback.style.display = 'block';
      } else {
          this.classList.remove('is-invalid');
          feedback.style.display = 'none';
      }
  });
  
  document.getElementById('password').addEventListener('blur', function() {
      const error = validatePassword(this.value);
      const feedback = document.getElementById('password-feedback');
  
      if (error) {
          this.classList.add('is-invalid');
          feedback.textContent = error;
          feedback.style.display = 'block';
      } else {
          this.classList.remove('is-invalid');
          feedback.style.display = 'none';
      }
  });
  
  document.getElementById('loginForm').addEventListener('submit', async function(event) {
      event.preventDefault();
  
      if (!validateForm()) {
          return;
      }
  
      const formData = new FormData(this);
      const statusMessage = document.getElementById('status-message');
  
      try {
          statusMessage.style.display = 'block';
          statusMessage.className = 'alert alert-info';
          statusMessage.textContent = 'Logging in...';
  
          const response = await fetch('/login', {
              method: 'POST',
              body: formData
          });
  
          if (!response.ok) {
              if (response.status === 400 || response.status === 401) {
                  const errorData = await response.json();
                  const errorMessage = errorData.error || 'Login failed';
                  statusMessage.className = 'alert alert-danger';
                  statusMessage.textContent = errorMessage;
                  showToast(errorMessage, true);
                  return;
              }
              throw new Error('Server error');
          }
  
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
              const result = await response.json();
              if (result.access_token) {
                  localStorage.setItem('token', result.access_token);
                  statusMessage.className = 'alert alert-success';
                  statusMessage.textContent = 'Login successful! Redirecting...';
                  showToast('Login successful! Redirecting...');
  
                  setTimeout(() => {
                      window.location.href = '/dashboard?token=' + result.access_token;
                  }, 1000);
              }
          } else {
              showToast('Login successful! Redirecting...');
              window.location.href = response.url;
          }
      } catch (error) {
          console.error('Error:', error);
          statusMessage.className = 'alert alert-danger';
          const errorMessage = 'An error occurred. Please try again.';
          statusMessage.textContent = errorMessage;
          showToast(errorMessage, true);
      }
  });