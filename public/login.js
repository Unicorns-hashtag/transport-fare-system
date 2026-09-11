const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || 'Login failed';
      errorMsg.style.display = 'block';
      return;
    }

    // Save the token so we can use it on other pages
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    // Redirect to the dashboard
    window.location.href = 'index.html';
  } catch (err) {
    errorMsg.textContent = 'Something went wrong. Try again.';
    errorMsg.style.display = 'block';
  }
});