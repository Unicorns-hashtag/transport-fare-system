function renderNav(activePage) {
  const username = localStorage.getItem('username') || 'Admin';

  const navHTML = `
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-header">
          <h2>🚍 FareSys</h2>
          <p>${username}</p>
        </div>
        <button id="hamburgerBtn" class="hamburger-btn" aria-label="Toggle menu">☰</button>
      </div>
      <div class="sidebar-collapsible" id="sidebarCollapsible">
        <ul>
          <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
          <li><a href="routes.html" class="${activePage === 'routes' ? 'active' : ''}">Routes & Fares</a></li>
          <li><a href="vehicles.html" class="${activePage === 'vehicles' ? 'active' : ''}">Vehicles</a></li>
          <li><a href="passengers.html" class="${activePage === 'passengers' ? 'active' : ''}">Passengers</a></li>
          <li><a href="records.html" class="${activePage === 'records' ? 'active' : ''}">Records</a></li>
          <li><a href="settings.html" class="${activePage === 'settings' ? 'active' : ''}">Settings</a></li>
        </ul>
        <button id="logoutBtn">Logout</button>
      </div>
    </nav>
  `;

  document.getElementById('nav-container').innerHTML = navHTML;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
  });

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarCollapsible = document.getElementById('sidebarCollapsible');

  hamburgerBtn.addEventListener('click', () => {
    sidebarCollapsible.classList.toggle('open');
    hamburgerBtn.textContent = sidebarCollapsible.classList.contains('open') ? '✕' : '☰';
  });
}