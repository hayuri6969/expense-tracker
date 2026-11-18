// Pennywise Expense Tracker with a simple browser-based demo login.
// Important: this is a front-end learning project, not production-grade authentication.

const authScreen = document.getElementById('auth-screen');
const appShell = document.getElementById('app-shell');
const authForm = document.getElementById('auth-form');
const authName = document.getElementById('auth-name');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authMessage = document.getElementById('auth-message');
const authSwitch = document.getElementById('auth-switch');
const authNameField = document.getElementById('auth-name-field');
const authSubmit = document.getElementById('auth-submit');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authEyebrow = document.getElementById('auth-eyebrow');
const authSwitchText = document.getElementById('auth-switch-text');
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const filterType = document.getElementById('filter-type');
const dateInput = document.getElementById('date');

let isRegisterMode = false;
let currentUser = null;
let transactions = [];

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

function getUsers() {
  try { return JSON.parse(localStorage.getItem('pennywiseUsers')) || []; }
  catch (error) { return []; }
}

function saveUsers(users) {
  localStorage.setItem('pennywiseUsers', JSON.stringify(users));
}

async function hashPassword(password) {
  // Web Crypto is available on localhost/HTTPS. No plain-text password is saved.
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Secure password hashing is unavailable. Open this project with VS Code Live Server or localhost.');
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function setAuthMode(register) {
  isRegisterMode = register;
  authNameField.hidden = !register;
  authName.required = register;
  authPassword.autocomplete = register ? 'new-password' : 'current-password';
  authTitle.textContent = register ? 'Create your account' : 'Sign in to your account';
  authSubtitle.textContent = register ? 'Start building healthier money habits today.' : 'Manage your money with clarity and confidence.';
  authEyebrow.textContent = register ? 'GET STARTED' : 'WELCOME BACK';
  authSubmit.innerHTML = register ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  authSwitchText.textContent = register ? 'Already have an account?' : 'New to Pennywise?';
  authSwitch.textContent = register ? 'Sign in' : 'Create an account';
  authMessage.textContent = '';
  authForm.reset();
}

authSwitch.addEventListener('click', () => setAuthMode(!isRegisterMode));

document.getElementById('show-password').addEventListener('click', event => {
  const visible = authPassword.type === 'text';
  authPassword.type = visible ? 'password' : 'text';
  event.currentTarget.textContent = visible ? 'Show' : 'Hide';
  event.currentTarget.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
});

authForm.addEventListener('submit', async event => {
  event.preventDefault();
  authMessage.textContent = '';
  authSubmit.disabled = true;
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;
  try {
    const users = getUsers();
    const passwordHash = await hashPassword(password);

    if (isRegisterMode) {
      const name = authName.value.trim();
      if (!name) throw new Error('Please enter your name.');
      if (password.length < 6) throw new Error('Use a password with at least 6 characters.');
      if (users.some(user => user.email === email)) throw new Error('An account with this email already exists.');
      const user = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, email, passwordHash };
      users.push(user);
      saveUsers(users);
      startSession(user);
    } else {
      const user = users.find(item => item.email === email);
      if (!user || user.passwordHash !== passwordHash) throw new Error('Incorrect email or password.');
      startSession(user);
    }
  } catch (error) {
    authMessage.textContent = error.message || 'Something went wrong. Please try again.';
  } finally {
    authSubmit.disabled = false;
  }
});

function storageKey(user) {
  return `pennywiseTransactions_${user.id}`;
}

function startSession(user) {
  currentUser = user;
  sessionStorage.setItem('pennywiseSession', user.id);
  localStorage.setItem('pennywiseLastUser', user.id);
  transactions = loadTransactions();
  document.getElementById('user-greeting').textContent = user.name.split(' ')[0];
  authScreen.hidden = true;
  appShell.hidden = false;
  dateInput.value = new Date().toISOString().slice(0, 10);
  document.getElementById('today').textContent = new Date().toLocaleDateString(
    'en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  );
  render();
}

function endSession() {
  sessionStorage.removeItem('pennywiseSession');
  currentUser = null;
  transactions = [];
  appShell.hidden = true;
  authScreen.hidden = false;
  setAuthMode(false);
}

document.getElementById('logout-btn').addEventListener('click', endSession);

function loadTransactions() {
  if (!currentUser) return [];
  try {
    const saved = localStorage.getItem(storageKey(currentUser));
    if (saved !== null) return JSON.parse(saved) || [];
    // One-time compatibility migration from the original single-user version.
    const legacy = localStorage.getItem('pennywiseTransactions');
    if (legacy !== null) {
      const oldTransactions = JSON.parse(legacy) || [];
      localStorage.setItem(storageKey(currentUser), JSON.stringify(oldTransactions));
      localStorage.removeItem('pennywiseTransactions');
      return oldTransactions;
    }
    return [];
  } catch (error) {
    return [];
  }
}

function saveTransactions() {
  if (currentUser) localStorage.setItem(storageKey(currentUser), JSON.stringify(transactions));
}

function addTransaction(transaction) {
  transactions.unshift(transaction);
  saveTransactions();
  render();
}

function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  saveTransactions();
  render();
}

function updateSummary() {
  const income = transactions.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  document.getElementById('income').textContent = currency.format(income);
  document.getElementById('expenses').textContent = currency.format(expenses);
  document.getElementById('balance').textContent = currency.format(income - expenses);
}

function getIcon(category, type) {
  if (type === 'income') return '↗';
  const icons = { Food: '☕', Transport: '↗', Shopping: '◇', Bills: '▤', Education: '✎', Health: '＋', Salary: '₱', Allowance: '☆', Other: '•' };
  return icons[category] || '•';
}

function render() {
  updateSummary();
  transactionList.innerHTML = '';
  const selectedType = filterType.value;
  const visible = transactions.filter(item => selectedType === 'all' || item.type === selectedType);
  document.getElementById('empty-state').hidden = visible.length > 0;

  visible.forEach(item => {
    const row = document.createElement('div');
    row.className = 'transaction-row';
    const icon = document.createElement('div');
    icon.className = `transaction-icon ${item.type}`;
    icon.textContent = getIcon(item.category, item.type);
    const info = document.createElement('div');
    info.className = 'transaction-info';
    const description = document.createElement('strong');
    description.textContent = item.description;
    const meta = document.createElement('span');
    const readableDate = new Date(item.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    meta.textContent = `${item.category} · ${readableDate}`;
    info.append(description, meta);
    const right = document.createElement('div');
    right.className = 'transaction-right';
    const amount = document.createElement('div');
    amount.className = `transaction-amount ${item.type}`;
    amount.textContent = `${item.type === 'income' ? '+' : '−'}${currency.format(item.amount)}`;
    const remove = document.createElement('button');
    remove.className = 'delete-btn';
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${item.description}`);
    remove.addEventListener('click', () => deleteTransaction(item.id));
    right.append(amount, remove);
    row.append(icon, info, right);
    transactionList.appendChild(row);
  });
}

transactionForm.addEventListener('submit', event => {
  event.preventDefault();
  const description = document.getElementById('description').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const date = dateInput.value;

  if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
    document.getElementById('form-hint').textContent = 'Please enter a description, a valid amount, and a date.';
    return;
  }

  addTransaction({ id: Date.now(), description, amount, type, category, date });
  transactionForm.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  document.getElementById('form-hint').textContent = 'Transaction added successfully!';
  document.getElementById('description').focus();
});

filterType.addEventListener('change', render);

// Restore the current browser-tab session if the user has already signed in.
function restoreSession() {
  const sessionId = sessionStorage.getItem('pennywiseSession');
  const user = getUsers().find(item => item.id === sessionId);
  if (user) startSession(user);
  else setAuthMode(false);
}
restoreSession();
