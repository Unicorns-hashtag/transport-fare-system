const API_URL = '/api/routes';

const routeForm = document.getElementById('routeForm');
const routesTableBody = document.getElementById('routesTableBody');

let editingId = null; // tracks if we're currently editing a route

// Fetch and display all routes
async function loadRoutes() {
  try {
    const res = await fetch(API_URL);
    const routes = await res.json();
    renderTable(routes);
  } catch (err) {
    console.error('Error loading routes:', err);
  }
}

// Build the table rows from route data
function renderTable(routes) {
  routesTableBody.innerHTML = ''; // clear existing rows

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

// Handle form submit (Add OR Update)
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
      // UPDATE existing route
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
      });
      editingId = null;
      routeForm.querySelector('button').textContent = 'Add Route';
    } else {
      // CREATE new route
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
      });
    }

    routeForm.reset();
    loadRoutes(); // refresh table
  } catch (err) {
    console.error('Error saving route:', err);
  }
});

// Handle Edit and Delete button clicks (event delegation)
routesTableBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Are you sure you want to delete this route?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      loadRoutes();
    }
  }

  if (e.target.classList.contains('edit-btn')) {
    // Fetch that route's data and fill the form
    const res = await fetch(`${API_URL}/${id}`);
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

// Load routes when page first opens
loadRoutes();