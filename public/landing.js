const calcForm = document.getElementById('fareCalcForm');
const calcOrigin = document.getElementById('calcOrigin');
const calcDestination = document.getElementById('calcDestination');
const calcVehicle = document.getElementById('calcVehicle');
const calcResult = document.getElementById('calcResult');
const routesPreviewGrid = document.getElementById('routesPreviewGrid');

let allRoutes = []; // store fetched routes so we can reuse for both calculator + preview

async function loadPublicRoutes() {
  try {
    const res = await fetch('/api/routes/public/all');
    allRoutes = await res.json();

    populateCalculatorDropdowns();
    renderRoutesPreview();
  } catch (err) {
    console.error('Error loading routes:', err);
  }
}

function populateCalculatorDropdowns() {
  // Get unique origins, destinations, vehicle types
  const origins = [...new Set(allRoutes.map(r => r.origin))];
  const destinations = [...new Set(allRoutes.map(r => r.destination))];
  const vehicles = [...new Set(allRoutes.map(r => r.vehicleType))];

  origins.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    calcOrigin.appendChild(opt);
  });

  destinations.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    calcDestination.appendChild(opt);
  });

  vehicles.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    calcVehicle.appendChild(opt);
  });
}

calcForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const origin = calcOrigin.value;
  const destination = calcDestination.value;
  const vehicleType = calcVehicle.value;

  const match = allRoutes.find(r =>
    r.origin === origin &&
    r.destination === destination &&
    r.vehicleType === vehicleType
  );

  if (match) {
    calcResult.textContent = `Fare: ₦${match.fareAmount}`;
    calcResult.style.color = '#1a5c38';
  } else {
    calcResult.textContent = 'No matching route found for that combination.';
    calcResult.style.color = '#dc2626';
  }
});

function renderRoutesPreview() {
  routesPreviewGrid.innerHTML = '';

  // Show up to 6 routes as preview cards
  const preview = allRoutes.slice(0, 6);

  if (preview.length === 0) {
    routesPreviewGrid.innerHTML = '<p style="color:#888;">No routes available yet.</p>';
    return;
  }

  preview.forEach(r => {
    const card = document.createElement('div');
    card.className = 'route-preview-card';
    card.innerHTML = `
      <h4>${r.origin} → ${r.destination}</h4>
      <p>₦${r.fareAmount}</p>
      <span>${r.vehicleType}</span>
    `;
    routesPreviewGrid.appendChild(card);
  });
}

loadPublicRoutes();