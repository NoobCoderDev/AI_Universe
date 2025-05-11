function getToken() {
    // Try to get token from localStorage first
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;
    
    // Then try cookies
    const cookieToken = getCookie('access_token');
    if (cookieToken) return cookieToken;
    
    // Finally try query string
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    if (queryToken) {
        // If token is in query string, store it in localStorage for future use
        localStorage.setItem('token', queryToken);
        
        // Clean up the URL by removing the token
        const url = new URL(window.location);
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url);
        
        return queryToken;
    }
    
    return null;
}

function setToken(token) {
    if (!token) return;
    localStorage.setItem('token', token);
    
    // Also set as cookie for server-side authentication
    setCookie('access_token', token, 1); // 1 day expiry
}

function removeToken() {
    localStorage.removeItem('token');
    deleteCookie('access_token');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function isAuthenticated() {
    return getToken() !== null;
}

function logout() {
    removeToken();
    window.location.href = '/logout';
}

function getAuthHeaders() {
    const token = getToken();
    if (!token) return {};
    
    return {
        'Authorization': `Bearer ${token}`
    };
}

function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) return fetch(url, options);
    
    const authOptions = { ...options };
    if (!authOptions.headers) authOptions.headers = {};
    authOptions.headers.Authorization = `Bearer ${token}`;
    
    return fetch(url, authOptions);
}

function setupAuthLinks() {
    const authenticated = isAuthenticated();
    const authLinks = document.getElementById('auth-links');
    
    if (!authLinks) return;
    
    if (authenticated) {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="#" id="logout-link">Logout</a>
            </li>
        `;
        document.getElementById('logout-link').addEventListener('click', logout);
    } else {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/login">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/signup">Sign Up</a>
            </li>
        `;
    }
}

// Check for token on page load and handle query string tokens
document.addEventListener('DOMContentLoaded', function() {
    // This will clean up URL if token is present in query string
    getToken();
    
    // Setup auth links based on authentication status
    setupAuthLinks();
}); 