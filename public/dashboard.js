const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

renderNav('dashboard');

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function animateNumber(elementId, targetValue) {
    const el = document.getElementById(elementId);
    const duration = 800;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(progress * targetValue);
        el.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = targetValue;
        }
    }

    requestAnimationFrame(update);
}

async function loadStats() {

    document.getElementById('statRoutes').textContent = '...';
    document.getElementById('statVehicles').textContent = '...';
    document.getElementById('statPassengers').textContent = '...';
    document.getElementById('statTrips').textContent = '...';

    try {
        const routesRes = await fetch('/api/routes', { headers: authHeaders() });
        if (routesRes.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }
        const routes = await routesRes.json();
        animateNumber('statRoutes', routes.length);

        const vehiclesRes = await fetch('/api/vehicles', { headers: authHeaders() });
        const vehicles = await vehiclesRes.json();
        animateNumber('statVehicles', vehicles.length);

        const passengersRes = await fetch('/api/passengers', { headers: authHeaders() });
        const passengers = await passengersRes.json();
        animateNumber('statPassengers', passengers.length);

        const tripsRes = await fetch('/api/trips', { headers: authHeaders() });
        const trips = await tripsRes.json();
        animateNumber('statTrips', trips.length);

        renderRevenueChart(trips);
        renderActivityFeed(trips);

    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

function renderRevenueChart(trips) {
    const days = [];
    const dayTotals = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const label = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
        days.push(label);

        const total = trips
            .filter(t => {
                const tripDate = new Date(t.tripDate);
                return tripDate.toDateString() === date.toDateString();
            })
            .reduce((sum, t) => sum + t.fareCharged, 0);

        dayTotals.push(total);
    }

    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Revenue (₦)',
                data: dayTotals,
                borderColor: '#1a5c38',
                backgroundColor: 'rgba(26, 92, 56, 0.1)',
                tension: 0,
                fill: true
            }]
        },
        options: {
            responsive: true,
            animation: {
                x: {
                    type: 'number',
                    easing: 'linear',
                    duration: 1000,
                    from: NaN,
                    delay(ctx) {
                        if (ctx.type === 'data' && ctx.mode === 'default' && !ctx.dropped) {
                            ctx.dropped = true;
                            return ctx.dataIndex * 150;
                        }
                    }
                },
                y: {
                    type: 'number',
                    easing: 'linear',
                    duration: 1000,
                    from: (ctx) => {
                        if (ctx.index === 0) return ctx.chart.scales.y.getPixelForValue(0);
                        const meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                        return meta.data[ctx.index - 1] ? meta.data[ctx.index - 1].getProps(['y'], true).y : ctx.chart.scales.y.getPixelForValue(0);
                    },
                    delay(ctx) {
                        if (ctx.type === 'data' && ctx.mode === 'default' && !ctx.dropped) {
                            ctx.dropped = true;
                            return ctx.dataIndex * 150;
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => '₦' + value
                    }
                }
            }
        }
    });
}

function renderActivityFeed(trips) {
    const activityList = document.getElementById('activityList');

    if (trips.length === 0) {
        activityList.innerHTML = '<li class="activity-empty">No recent activity yet.</li>';
        return;
    }

    const recent = trips.slice(0, 6);

    activityList.innerHTML = '';
    recent.forEach(t => {
        const li = document.createElement('li');
        const passengerName = t.passenger ? t.passenger.fullName : 'Unknown passenger';
        const routeInfo = t.route ? `${t.route.origin} → ${t.route.destination}` : 'Unknown route';
        const timeAgo = new Date(t.tripDate).toLocaleString();

        li.innerHTML = `
      ${passengerName} traveled ${routeInfo} — ₦${t.fareCharged}
      <span class="activity-time">${timeAgo}</span>
    `;
        activityList.appendChild(li);
    });
}

loadStats();