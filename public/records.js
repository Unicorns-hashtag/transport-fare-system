const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

renderNav('records');

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

const tripForm = document.getElementById('tripForm');
const tripsTableBody = document.getElementById('tripsTableBody');
const passengerSelect = document.getElementById('passengerSelect');
const routeSelect = document.getElementById('routeSelect');
const vehicleSelect = document.getElementById('vehicleSelect');

// Load dropdown options
async function loadDropdowns() {
  try {
    const [passengersRes, routesRes, vehiclesRes] = await Promise.all([
      fetch('/api/passengers', { headers: authHeaders() }),
      fetch('/api/routes', { headers: authHeaders() }),
      fetch('/api/vehicles', { headers: authHeaders() })
    ]);

    const passengers = await passengersRes.json();
    const routes = await routesRes.json();
    const vehicles = await vehiclesRes.json();

    passengers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p._id;
      opt.textContent = `${p.fullName} (${p.phone})`;
      passengerSelect.appendChild(opt);
    });

    routes.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r._id;
      opt.textContent = `${r.origin} → ${r.destination} (₦${r.fareAmount})`;
      opt.dataset.fare = r.fareAmount; // store fare for auto-fill
      routeSelect.appendChild(opt);
    });

    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v._id;
      opt.textContent = `${v.vehicleType} - ${v.plateNumber}`;
      vehicleSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error loading dropdowns:', err);
  }
}

// Auto-fill fare amount when a route is selected
routeSelect.addEventListener('change', () => {
  const selectedOption = routeSelect.options[routeSelect.selectedIndex];
  const fare = selectedOption.dataset.fare;
  if (fare) {
    document.getElementById('fareCharged').value = fare;
  }
});

// Load and display all trips
async function loadTrips() {
  tripsTableBody.innerHTML = '<tr><td colspan="6" class="table-loading"><div class="spinner"></div></td></tr>';
  try {
    const res = await fetch('/api/trips', { headers: authHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    const trips = await res.json();
    renderTable(trips);
  } catch (err) {
    console.error('Error loading trips:', err);
    tripsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999;">Failed to load trips.</td></tr>';
  }
}

function renderTable(trips) {
  tripsTableBody.innerHTML = '';
  trips.forEach(t => {
    const row = document.createElement('tr');
    const dateStr = new Date(t.tripDate).toLocaleDateString();
    row.innerHTML = `
      <td>${t.passenger ? t.passenger.fullName : 'Unknown'}</td>
      <td>${t.route ? `${t.route.origin} → ${t.route.destination}` : 'Unknown'}</td>
      <td>${t.vehicle ? `${t.vehicle.vehicleType} (${t.vehicle.plateNumber})` : 'Unknown'}</td>
      <td>₦${t.fareCharged}</td>
      <td>${dateStr}</td>
      <td><button class="action-btn delete-btn" data-id="${t._id}">Delete</button></td>
    `;
    tripsTableBody.appendChild(row);
  });
}

// Handle form submit
tripForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tripData = {
    passenger: passengerSelect.value,
    route: routeSelect.value,
    vehicle: vehicleSelect.value,
    fareCharged: Number(document.getElementById('fareCharged').value)
  };

  try {
    await fetch('/api/trips', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(tripData)
    });
    tripForm.reset();
    loadTrips();
    showToast('Trip logged successfully!');
  } catch (err) {
    console.error('Error logging trip:', err);
    showToast('Something went wrong. Try again.', 'error');
  }
});

// Handle delete
tripsTableBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Delete this trip record?')) {
      await fetch(`/api/trips/${id}`, { method: 'DELETE', headers: authHeaders() });
      loadTrips();
      showToast('Trip record deleted.');
    }
  }
});

loadDropdowns();
loadTrips();