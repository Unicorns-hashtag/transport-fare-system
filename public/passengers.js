const API_URL = '/api/passengers';
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

renderNav('passengers');

const passengerForm = document.getElementById('passengerForm');
const passengersTableBody = document.getElementById('passengersTableBody');
let editingId = null;

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function loadPassengers() {
  passengersTableBody.innerHTML = '<tr><td colspan="5" class="table-loading"><div class="spinner"></div></td></tr>';
  try {
    const res = await fetch(API_URL, { headers: authHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    const passengers = await res.json();
    renderTable(passengers);
  } catch (err) {
    console.error('Error loading passengers:', err);
    passengersTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Failed to load passengers.</td></tr>';
  }
}

function renderTable(passengers) {
  passengersTableBody.innerHTML = '';
  passengers.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.fullName}</td>
      <td>${p.phone}</td>
      <td>${p.email || '-'}</td>
      <td>${p.idNumber || '-'}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${p._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${p._id}">Delete</button>
      </td>
    `;
    passengersTableBody.appendChild(row);
  });
}

passengerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const passengerData = {
    fullName: document.getElementById('fullName').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value || undefined,
    idNumber: document.getElementById('idNumber').value || undefined
  };

  try {
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(passengerData)
      });
      editingId = null;
      passengerForm.querySelector('button').textContent = 'Add Passenger';
      showToast('Passenger updated successfully!');
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(passengerData)
      });
      showToast('Passenger added successfully!');
    }
    passengerForm.reset();
    loadPassengers();
  } catch (err) {
    console.error('Error saving passenger:', err);
    showToast('Something went wrong. Try again.', 'error');
  }
});

passengersTableBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Delete this passenger?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
      loadPassengers();
      showToast('Passenger deleted.');
    }
  }

  if (e.target.classList.contains('edit-btn')) {
    const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    const p = await res.json();

    document.getElementById('fullName').value = p.fullName;
    document.getElementById('phone').value = p.phone;
    document.getElementById('email').value = p.email || '';
    document.getElementById('idNumber').value = p.idNumber || '';

    editingId = id;
    passengerForm.querySelector('button').textContent = 'Update Passenger';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

loadPassengers();