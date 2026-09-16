const API_URL = '/api/vehicles';
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

renderNav('vehicles');

const vehicleForm = document.getElementById('vehicleForm');
const vehiclesTableBody = document.getElementById('vehiclesTableBody');
let editingId = null;

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function loadVehicles() {
  vehiclesTableBody.innerHTML = '<tr><td colspan="5" class="table-loading"><div class="spinner"></div></td></tr>';
  try {
    const res = await fetch(API_URL, { headers: authHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    const vehicles = await res.json();
    renderTable(vehicles);
  } catch (err) {
    console.error('Error loading vehicles:', err);
    vehiclesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Failed to load vehicles.</td></tr>';
  }
}

function renderTable(vehicles) {
  vehiclesTableBody.innerHTML = '';
  vehicles.forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${v.vehicleType}</td>
      <td>${v.plateNumber}</td>
      <td>${v.capacity}</td>
      <td>${v.status}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${v._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${v._id}">Delete</button>
      </td>
    `;
    vehiclesTableBody.appendChild(row);
  });
}

vehicleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const vehicleData = {
    vehicleType: document.getElementById('vehicleType').value,
    plateNumber: document.getElementById('plateNumber').value,
    capacity: Number(document.getElementById('capacity').value),
    status: document.getElementById('status').value
  };

  try {
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(vehicleData)
      });
      editingId = null;
      vehicleForm.querySelector('button').textContent = 'Add Vehicle';
      showToast('Vehicle updated successfully!');
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(vehicleData)
      });
      showToast('Vehicle added successfully!');
    }
    vehicleForm.reset();
    loadVehicles();
  } catch (err) {
    console.error('Error saving vehicle:', err);
    showToast('Something went wrong. Try again.', 'error');
  }
});

vehiclesTableBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Delete this vehicle?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
      loadVehicles();
      showToast('Vehicle deleted.');
    }
  }

  if (e.target.classList.contains('edit-btn')) {
    const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    const v = await res.json();

    document.getElementById('vehicleType').value = v.vehicleType;
    document.getElementById('plateNumber').value = v.plateNumber;
    document.getElementById('capacity').value = v.capacity;
    document.getElementById('status').value = v.status;

    editingId = id;
    vehicleForm.querySelector('button').textContent = 'Update Vehicle';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

loadVehicles();