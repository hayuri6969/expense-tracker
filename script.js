// Pennywise Expense Tracker
// Beginner note: transactions are stored in your browser using localStorage.

const form = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const filterType = document.getElementById('filter-type');
const dateInput = document.getElementById('date');

let transactions = loadTransactions();

const currency = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

dateInput.value = new Date().toISOString().slice(0, 10);
document.getElementById('today').textContent = new Date().toLocaleDateString(
  'en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
);

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem('pennywiseTransactions')) || [];
  } catch (error) {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem('pennywiseTransactions', JSON.stringify(transactions));
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
  const income = transactions
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  document.getElementById('income').textContent = currency.format(income);
  document.getElementById('expenses').textContent = currency.format(expenses);
  document.getElementById('balance').textContent = currency.format(income - expenses);
}

function getIcon(category, type) {
  if (type === 'income') return '↗';
  const icons = {
    Food: '☕', Transport: '↗', Shopping: '◇', Bills: '▤',
    Education: '✎', Health: '＋', Salary: '₱', Allowance: '☆', Other: '•'
  };
  return icons[category] || '•';
}

function render() {
  updateSummary();
  transactionList.innerHTML = '';

  const selectedType = filterType.value;
  const visible = transactions.filter(item =>
    selectedType === 'all' || item.type === selectedType
  );

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
    const readableDate = new Date(item.date + 'T00:00:00').toLocaleDateString(
      'en-PH', { month: 'short', day: 'numeric', year: 'numeric' }
    );
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

form.addEventListener('submit', event => {
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

  addTransaction({
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date
  });

  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  document.getElementById('form-hint').textContent = 'Transaction added successfully!';
  document.getElementById('description').focus();
});

filterType.addEventListener('change', render);

// Display saved transactions when the page opens.
render();
