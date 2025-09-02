import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { isCurrentUserAdmin } from './firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyCeCjerHDeNeskBzVMMcz82UDy4v7-gHCM",
  authDomain: "ramika-safaris.firebaseapp.com",
  projectId: "ramika-safaris",
  storageBucket: "ramika-safaris.firebasestorage.app",
  messagingSenderId: "684999593043",
  appId: "1:684999593043:web:21d91f59dfb4bca9818aa6"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let usersRef = ref(db, 'users');
const usersList = document.getElementById('usersList');
const status = document.getElementById('status');
const filterInput = document.getElementById('filter');

let allUsers = {};

// pagination state
let pageSize = 10;
let currentPage = 1;

// modal state
let currentDeleteUid = null;

function formatTs(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleString();
}

function renderList(filter) {
  usersList.innerHTML = '';
  const entries = Object.entries(allUsers || {});
  const filtered = entries.filter(([uid, data]) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (data.fullName && data.fullName.toLowerCase().includes(q)) || (data.email && data.email.toLowerCase().includes(q));
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  if (pageItems.length === 0) {
    usersList.innerHTML = '<div class="list-group-item">No users</div>';
    return;
  }
  for (const [uid, data] of pageItems) {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    const createdAt = data.createdAt ? formatTs(data.createdAt) : '-';
    const lastLogin = data.lastLogin ? formatTs(data.lastLogin) : '-';
    item.innerHTML = `
      <div class="me-3">
        <div class="fw-semibold">${escapeHtml(data.fullName || '')}</div>
        <div class="text-muted small">${escapeHtml(data.email || '')}</div>
        <div class="text-muted small">Created: ${createdAt} · Last login: ${lastLogin}</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary edit-btn" data-uid="${uid}">Edit</button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-uid="${uid}">Delete</button>
      </div>
    `;
    usersList.appendChild(item);
  }
  // update pagination UI
  const paginationInfo = document.getElementById('paginationInfo');
  if (paginationInfo) paginationInfo.textContent = `Page ${currentPage} of ${totalPages} — ${total} users`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

// Only subscribe to users if current user is admin according to DB rules
async function trySubscribeUsers() {
  const admin = await isCurrentUserAdmin();
  if (!admin) {
    status.innerHTML = '<span class="text-danger">Access denied: admin only.</span>';
    usersList.innerHTML = '<div class="list-group-item">Admin access required</div>';
    return;
  }
  status.innerHTML = '<span class="text-success">Admin access granted</span>';
  usersRef = ref(db, 'users');
  onValue(usersRef, (snap) => {
    allUsers = snap.val() || {};
    renderList(filterInput.value);
  });
}

trySubscribeUsers();

filterInput.addEventListener('input', (e) => { currentPage = 1; renderList(e.target.value); });

// pagination button handlers
prevPageBtn.addEventListener('click', (e) => { if (currentPage > 1) { currentPage--; renderList(filterInput.value); } });
nextPageBtn.addEventListener('click', (e) => { currentPage++; renderList(filterInput.value); });

usersList.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('.edit-btn');
  const delBtn = e.target.closest('.delete-btn');
  if (editBtn) {
    const uid = editBtn.dataset.uid;
    const data = allUsers[uid];
    const newName = prompt('Edit full name for ' + (data.email || uid), data.fullName || '');
    if (newName !== null) {
      try {
        await update(ref(db, `users/${uid}`), { fullName: newName });
        status.textContent = 'Updated ' + uid;
      } catch (err) {
        console.error(err);
        status.textContent = 'Update failed';
      }
    }
  } else if (delBtn) {
    const uid = delBtn.dataset.uid;
    currentDeleteUid = uid;
    const user = allUsers[uid] || {};
    confirmMessage.textContent = `Delete user record for ${user.email || uid}? This removes only the Realtime Database record.`;
    // show bootstrap modal
    const modal = new bootstrap.Modal(confirmModalEl);
    modal.show();
  }
});

// confirm modal OK handler
confirmOk.addEventListener('click', async (e) => {
  if (!currentDeleteUid) return;
  try {
    await remove(ref(db, `users/${currentDeleteUid}`));
    status.textContent = 'Deleted ' + currentDeleteUid;
  } catch (err) {
    console.error(err);
    status.textContent = 'Delete failed';
  }
  // hide modal
  const modal = bootstrap.Modal.getInstance(confirmModalEl);
  if (modal) modal.hide();
  currentDeleteUid = null;
});

// Basic auth check: show warning if not signed in as admin (here we just require any signed-in user)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    status.innerHTML = '<span class="text-danger">Not signed in. Please sign in via sign-in.html</span>';
  } else {
    status.innerHTML = '<span class="text-success">Signed in as ' + escapeHtml(user.email || '') + '</span>';
  }
});

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function(m){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];});
}
