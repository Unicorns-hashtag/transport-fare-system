const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

renderNav('settings');

const passwordForm = document.getElementById('passwordForm');
const msg = document.getElementById('msg');

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    msg.textContent = 'New passwords do not match';
    msg.style.color = 'red';
    msg.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || 'Something went wrong';
      msg.style.color = 'red';
      showToast(data.error || 'Password update failed', 'error');
    } else {
      msg.textContent = 'Password updated successfully!';
      msg.style.color = 'green';
      passwordForm.reset();
      showToast('Password updated successfully!');
    }
    msg.style.display = 'block';
  } catch (err) {
    msg.textContent = 'Something went wrong. Try again.';
    msg.style.color = 'red';
    msg.style.display = 'block';
    showToast('Something went wrong. Try again.', 'error');
  }
});
document.getElementById('backupBtn').addEventListener('click', async () => {
  try {
    const res = await fetch('/api/auth/backup', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faresys-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully!');
  } catch (err) {
    showToast('Backup failed. Try again.', 'error');
  }
});