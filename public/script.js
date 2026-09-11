const API_URL = '/api/routes';

const routeForm = document.getElementById('routeForm');
const routesTableBody = document.getElementById('routesTableBody');

let editingId = null;

// Get the saved token
const token = localStorage.getItem('token');
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
});

// If there's no token, redirect to login immediately
if (!token) {
  window.location.href = 'login.html';
}

// Helper: standard headers including the auth token
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Fetch and display all routes
async function loadRoutes() {
  try {
    const res = await fetch(API_URL, {
      headers: authHeaders()
    });

    if (res.status === 401) {
      // Token invalid/expired - force re-login
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    const routes = await res.json();
    renderTable(routes);
  } catch (err) {
    console.error('Error loading routes:', err);
  }
}

function renderTable(routes) {
  routesTableBody.innerHTML = '';

  routes.forEach(route => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${route.origin}</td>
      <td>${route.destination}</td>
      <td>${route.vehicleType}</td>
      <td>₦${route.fareAmount}</td>
      <td>${route.distanceKm || '-'}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${route._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${route._id}">Delete</button>
      </td>
    `;
    routesTableBody.appendChild(row);
  });
}

routeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const routeData = {
    origin: document.getElementById('origin').value,
    destination: document.getElementById('destination').value,
    vehicleType: document.getElementById('vehicleType').value,
    fareAmount: Number(document.getElementById('fareAmount').value),
    distanceKm: Number(document.getElementById('distanceKm').value) || undefined
  };

  try {
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(routeData)
      });
      editingId = null;
      routeForm.querySelector('button').textContent = 'Add Route';
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(routeData)
      });
    }

    routeForm.reset();
    loadRoutes();
  } catch (err) {
    console.error('Error saving route:', err);
  }
});

routesTableBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Are you sure you want to delete this route?')) {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      loadRoutes();
    }
  }

  if (e.target.classList.contains('edit-btn')) {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: authHeaders()
    });
    const route = await res.json();

    document.getElementById('origin').value = route.origin;
    document.getElementById('destination').value = route.destination;
    document.getElementById('vehicleType').value = route.vehicleType;
    document.getElementById('fareAmount').value = route.fareAmount;
    document.getElementById('distanceKm').value = route.distanceKm || '';

    editingId = id;
    routeForm.querySelector('button').textContent = 'Update Route';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

loadRoutes();