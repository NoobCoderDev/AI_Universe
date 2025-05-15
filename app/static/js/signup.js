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
      if (username.trim().length < 3) {
          return 'Username must be at least 3 characters long';
      }
      return null;
  }
  
  function validateEmail(email) {
      if (!email || email.trim() === '') {
          return 'Email is required';
      }
      const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
      if (!emailRegex.test(email)) {
          return 'Please enter a valid email address';
      }
      return null;
  }
  
  function validatePassword(password) {
      if (!password || password.trim() === '') {
          return 'Password is required';
      }
      if (password.length < 8) {
          return 'Password must be at least 8 characters long';
      }
      if (!/[a-z]/.test(password)) {
          return 'Password must include lowercase letters';
      }
      if (!/[A-Z]/.test(password)) {
          return 'Password must include uppercase letters';
      }
      if (!/\d/.test(password)) {
          return 'Password must include numbers';
      }
      return null;
  }
  
  function validateForm() {
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
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
  
      const emailError = validateEmail(email);
      const emailInput = document.getElementById('email');
      const emailFeedback = document.getElementById('email-feedback');
  
      if (emailError) {
          emailInput.classList.add('is-invalid');
          emailFeedback.textContent = emailError;
          emailFeedback.style.display = 'block';
          isValid = false;
          showToast(emailError, true);
      } else {
          emailInput.classList.remove('is-invalid');
          emailFeedback.style.display = 'none';
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
  
  document.getElementById('email').addEventListener('blur', function() {
      const error = validateEmail(this.value);
      const feedback = document.getElementById('email-feedback');
  
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
  
  document.getElementById('signupForm').addEventListener('submit', async function(event) {
      event.preventDefault();
  
      if (!validateForm()) {
          return;
      }
  
      const formData = new FormData(this);
      const statusMessage = document.getElementById('status-message');
  
      try {
          statusMessage.style.display = 'block';
          statusMessage.className = 'alert alert-info';
          statusMessage.textContent = 'Creating account...';
  
          const response = await fetch('/signup', {
              method: 'POST',
              body: formData
          });
  
          if (!response.ok) {
              if (response.status === 400) {
                  const errorData = await response.json();
                  const errorMessage = errorData.error || 'Signup failed';
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
                  statusMessage.textContent = 'Account created successfully! Redirecting...';
                  showToast('Account created successfully! Redirecting...', false);
  
                  setTimeout(() => {
                      window.location.href = '/dashboard?token=' + result.access_token;
                  }, 1000);
              }
          } else {
              showToast('Account created successfully! Redirecting...', false);
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