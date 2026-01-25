/**
 * User Management Frontend
 */

let users = [];
let editingUser = null;

// ==
// INITIALIZATION
// ==

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadUsers();
  await loadStats();
});

// ==
// AUTHENTICATION
// ==

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check');
    if (!response.ok) {
      window.location.href = '/login.html';
    }
  } catch (error) {
    window.location.href = '/login.html';
  }
}

// ==
// LOAD DATA
// ==

async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    users = await response.json();
    displayUsers(users);
  } catch (error) {
    console.error('Failed to load users:', error);
    showToast('Failed to load users', 'error');
  }
}

async function loadStats() {
  try {
    const response = await fetch('/api/users/stats');
    const stats = await response.json();

    document.getElementById('total-users').textContent = stats.total || 0;
    document.getElementById('active-users').textContent = stats.active || 0;
    document.getElementById('admin-count').textContent = stats.admins || 0;
    document.getElementById('active-sessions').textContent = stats.sessions || 0;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// ==
// DISPLAY USERS
// ==

function displayUsers(users) {
  const tbody = document.getElementById('users-tbody');

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-state-icon">👤</div>
          <div>No users found</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td><strong>${user.username}</strong></td>
      <td>${user.email}</td>
      <td>
        <span class="user-role ${user.role}">${user.role}</span>
      </td>
      <td>
        <span class="user-status ${user.isActive ? 'active' : 'inactive'}">
          ${user.isActive ? '✓ Active' : '✗ Inactive'}
        </span>
      </td>
      <td>${user.twoFactorEnabled ? '🔐 Enabled' : '—'}</td>
      <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
      <td>
        <div class="user-actions">
          <button class="btn-icon btn-edit" onclick="editUser('${user.username}')" title="Edit">
            ✏️
          </button>
          ${user.username !== 'admin' ? `
            <button class="btn-icon btn-toggle" onclick="toggleUserStatus('${user.username}', ${!user.isActive})" title="${user.isActive ? 'Deactivate' : 'Activate'}">
              ${user.isActive ? '🔒' : '🔓'}
            </button>
            <button class="btn-icon btn-delete" onclick="deleteUser('${user.username}')" title="Delete">
              🗑️
            </button>
          ` : '<span style="color: #cbd5e0; font-size: 12px;">Protected</span>'}
        </div>
      </td>
    </tr>
  `).join('');
}

// ==
// USER MODAL
// ==

function openCreateUserModal() {
  editingUser = null;
  document.getElementById('modal-title').textContent = 'Create User';
  document.getElementById('user-form').reset();
  document.getElementById('edit-username').value = '';
  document.getElementById('username').disabled = false;
  document.getElementById('password').required = true;
  document.getElementById('user-modal').classList.add('active');
}

function editUser(username) {
  editingUser = users.find(u => u.username === username);
  
  if (!editingUser) return;

  document.getElementById('modal-title').textContent = 'Edit User';
  document.getElementById('edit-username').value = username;
  document.getElementById('username').value = editingUser.username;
  document.getElementById('username').disabled = true;
  document.getElementById('email').value = editingUser.email;
  document.getElementById('password').value = '';
  document.getElementById('password').required = false;
  document.getElementById('role').value = editingUser.role;

  document.getElementById('user-modal').classList.add('active');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.remove('active');
  editingUser = null;
}

// ==
// SAVE USER
// ==

async function saveUser(event) {
  event.preventDefault();

  const editUsername = document.getElementById('edit-username').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  const isEdit = !!editUsername;

  try {
    const endpoint = isEdit ? `/api/users/${editUsername}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';
    
    const body = {
      username,
      email,
      role
    };

    // Only include password if provided
    if (password) {
      body.password = password;
    }

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save user');
    }

    showToast(`User ${isEdit ? 'updated' : 'created'} successfully`, 'success');
    closeUserModal();
    await loadUsers();
    await loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==
// DELETE USER
// ==

async function deleteUser(username) {
  if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/users/${username}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete user');
    }

    showToast('User deleted successfully', 'success');
    await loadUsers();
    await loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==
// TOGGLE USER STATUS
// ==

async function toggleUserStatus(username, newStatus) {
  try {
    const response = await fetch(`/api/users/${username}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: newStatus })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update user status');
    }

    showToast(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    await loadUsers();
    await loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==
// UTILITIES
// ==

function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
