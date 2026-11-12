import { useEffect, useState } from 'react';
import './App.css';
import { apiRequest, clearToken } from './api';
import Login from './Login';
import Register from './Register';

const initialTransactions = [];
const initialCategories = [];

const navigation = [
  { label: 'Dashboard', icon: '▦' },
  { label: 'Transactions', icon: '⇄' },
  { label: 'Categories', icon: '◈' },
  { label: 'Budgets', icon: '▤' },
  { label: 'Goals', icon: '◎' },
  { label: 'Reports', icon: '▥' },
];

const currency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function mapApiTransaction(tx) {
  const dateKey = tx.transactionDate || tx.date || "";
  const dateObject = dateKey ? new Date(`${dateKey}T12:00:00`) : null;

  const categoryName =
      tx.category?.name ||
      tx.categoryName ||
      tx.category?.id?.toString() ||
      "Uncategorised";

  return {
    id: tx.id,
    name: tx.description?.trim() || categoryName || "Transaction",
    category: categoryName,
    categoryId: tx.category?.id ?? tx.categoryId ?? null,
    date:
        dateObject && !Number.isNaN(dateObject.getTime())
            ? dateObject.toLocaleDateString("en-IN", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
            : dateKey,
    dateKey,
    amount: Math.abs(Number(tx.amount) || 0),
    type: tx.type,
    paymentMethod: tx.paymentMethod || "",
    icon: "💳",
  };
}

function mapApiCategory(category) {
  return { ...category, icon: category.type === 'INCOME' ? '💰' : '◈' };
}

function Sidebar({ activePage, setActivePage, onLogout, currentUser }) {
  return (
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <span>Fin<span className="brand-accent">Track</span></span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => (
              <button
                  key={item.label}
                  className={`nav-item ${activePage === item.label ? 'active' : ''}`}
                  onClick={() => setActivePage(item.label)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Transactions' && (
                    <span className="nav-count">All</span>
                )}
              </button>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="profile">
            <div className="avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="profile-info">
              <strong>{currentUser?.name || 'FinTrack User'}</strong>
              <span>{currentUser?.email || 'Personal account'}</span>
            </div>

            <button
                type="button"
                className="profile-menu"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
            >
              ⇥
            </button>
          </div>
        </div>
      </aside>
  );
}


function StatCard({
                    title,
                    value,
                    icon,
                    color,
                    foot,
                    trend,
                    decoration,
                    progress,
                    isCount = false,
                  }) {
  const isSavingsRate = title === "Savings rate";

  return (
      <article className={`stat-card ${decoration ? "balance-card" : ""}`}>
        <div className="stat-top">
          <span>{title}</span>
          <span className={`stat-icon ${color}`}>{icon}</span>
        </div>

        <div className="stat-value">
          {isCount
              ? Number(value || 0).toLocaleString('en-IN')
              : isSavingsRate
                  ? `${Number.isFinite(Number(value)) ? Number(value) : 0}%`
                  : currency(value)}
        </div>

        {progress !== undefined && (
            <div className="savings-progress">
          <span
              style={{
                width: `${Math.min(
                    Math.max(Number(progress) || 0, 0),
                    100
                )}%`,
              }}
          />
            </div>
        )}

        <div className="stat-foot">
          {trend && (
              <span className={`trend ${trend.positive ? "positive" : "negative"}`}>
            {trend.label}
          </span>
          )}
          <span>{foot}</span>
        </div>

        {decoration && (
            <>
              <div className="card-decoration" />
              <div className="card-decoration decoration-two" />
            </>
        )}

        {decoration === "income" && (
            <div className="mini-bars income-bars">
              {[12, 20, 14, 25, 17, 29, 22].map((height, i) => (
                  <i key={i} style={{ height }} />
              ))}
            </div>
        )}

        {decoration === "expense" && (
            <div className="mini-bars expense-bars">
              {[24, 14, 20, 12, 26, 17, 22].map((height, i) => (
                  <i key={i} style={{ height }} />
              ))}
            </div>
        )}
      </article>
  );
}

function CashFlowChart({ transactions, month }) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const [year, monthNumber] = month.split('-').map(Number);
    return new Date(year, monthNumber - 5 + index, 1);
  });

  const chartData = months.map((date) => {
    const key = getMonthKey(date);
    const items = transactions.filter((tx) => tx.dateKey?.startsWith(key));

    return {
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      income: items.filter((tx) => tx.type === 'INCOME').reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      expense: items.filter((tx) => tx.type === 'EXPENSE').reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    };
  });

  const maxValue = Math.max(10000, ...chartData.flatMap((item) => [item.income, item.expense])) * 1.15;

  return (
      <section className="panel cash-flow-panel">
        <div className="panel-header">
          <div>
            <h3>Cash flow</h3>
            <p>Your income vs expenses over time</p>
          </div>
          <span className="health-info" title="Based on available transaction data">i</span>
        </div>

        <div className="chart-legend">
          <span><i className="legend-income" /> Income</span>
          <span><i className="legend-expense" /> Expenses</span>
        </div>

        <div className="chart">
          <div className="chart-grid">
            {[100, 75, 50, 25, 0].map((value) => (
                <div className="grid-line" key={value}>
                  <span>{value === 0 ? '₹0' : `₹${Math.round((maxValue * value) / 100 / 1000)}k`}</span>
                </div>
            ))}
          </div>

          <div className="chart-bars">
            {chartData.map((item) => (
                <div className="chart-column" key={item.label}>
                  <div className="bar-pair">
                    <div
                        className="bar income-bar"
                        title={`Income: ${currency(item.income)}`}
                        style={{ height: `${Math.max(3, (item.income / maxValue) * 100)}%` }}
                    />
                    <div
                        className="bar expense-bar"
                        title={`Expenses: ${currency(item.expense)}`}
                        style={{ height: `${Math.max(3, (item.expense / maxValue) * 100)}%` }}
                    />
                  </div>
                  <span>{item.label}</span>
                </div>
            ))}
          </div>
        </div>

        <div className="chart-caption">
          <span>Last 6 months</span>
          <span>INR · Based on saved transactions</span>
        </div>
      </section>
  );
}

function HealthPanel({ income, expenses }) {
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const score = income > 0 ? Math.max(0, Math.min(100, Math.round(savingsRate * 1.5 + 25))) : 0;

  return (
      <section className="panel health-panel">
        <div className="panel-header">
          <div>
            <h3>Financial health</h3>
            <p>A snapshot of your financial habits</p>
          </div>
          <span className="health-info" title="An illustrative score based on income and spending">i</span>
        </div>

        <div className="health-score">
          <svg viewBox="0 0 180 120" role="img" aria-label={`Financial health score ${score} out of 100`}>
            <circle cx="90" cy="90" r="69" fill="none" stroke="var(--border)" strokeWidth="12" strokeDasharray={`${Math.PI * 69} ${Math.PI * 69}`} strokeDashoffset="0" strokeLinecap="round" transform="rotate(180 90 90)" />
            <circle
                cx="90"
                cy="90"
                r="69"
                fill="none"
                stroke="var(--purple)"
                strokeWidth="12"
                strokeDasharray={`${Math.PI * 69} ${Math.PI * 69}`}
                strokeDashoffset={Math.PI * 69 * (1 - score / 100)}
                strokeLinecap="round"
                transform="rotate(180 90 90)"
            />
          </svg>
          <div className="health-number">{score}<span>/100</span></div>
          <div className="health-label">{income > 0 ? (score >= 70 ? 'Looking healthy' : 'Room to improve') : 'Add income to begin'}</div>
        </div>

        <div className="health-checks">
          <div>
            <span className="check green-check">✓</span>
            <span>Income recorded</span>
            <strong>{income > 0 ? 'Tracked' : 'Not yet'}</strong>
          </div>
          <div>
            <span className="check yellow-check">↗</span>
            <span>Savings rate</span>
            <strong>{income > 0 ? `${savingsRate}%` : '—'}</strong>
          </div>
          <div>
            <span className="check green-check">✓</span>
            <span>Expenses recorded</span>
            <strong>{currency(expenses)}</strong>
          </div>
        </div>

        <p className="demo-note">Illustrative score based on available data, not financial advice.</p>
      </section>
  );
}

function TransactionRows({ transactions }) {
  if (!transactions.length) {
    return (
        <div className="placeholder-panel">
          <div className="placeholder-icon">⇄</div>
          <h2>No transactions yet</h2>
          <p>Add your first income or expense to see it here.</p>
        </div>
    );
  }

  return (
      <>
        <div className="transaction-table">
          <div className="table-row table-head">
            <span>TRANSACTION</span>
            <span>CATEGORY</span>
            <span>DATE</span>
            <span>AMOUNT</span>
            <span>STATUS</span>
          </div>

          {transactions.map((tx) => (
              <div className="table-row" key={tx.id}>
                <div className="transaction-name">
                  <div className={`transaction-icon ${tx.type === 'INCOME' ? 'income-tx' : ''}`}>{tx.icon || '💳'}</div>
                  <div>
                    <strong>{tx.name}</strong>
                    <span>{tx.type === 'INCOME' ? 'Money received' : 'Money spent'}</span>
                  </div>
                </div>
                <span><span className="category-pill">{tx.category}</span></span>
                <span className="transaction-date">{tx.date}</span>
                <strong className={tx.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>
                  {tx.type === 'INCOME' ? '+' : '−'}{currency(Math.abs(tx.amount))}
                </strong>
                <span className="status-pill"><i /> Completed</span>
              </div>
          ))}
        </div>

        <div className="mobile-transactions">
          {transactions.map((tx) => (
              <div className="mobile-transaction" key={tx.id}>
                <div className={`transaction-icon ${tx.type === 'INCOME' ? 'income-tx' : ''}`}>{tx.icon || '💳'}</div>
                <div className="mobile-tx-info">
                  <strong>{tx.name}</strong>
                  <span>{tx.category} · {tx.date}</span>
                </div>
                <strong className={tx.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>
                  {tx.type === 'INCOME' ? '+' : '−'}{currency(Math.abs(tx.amount))}
                </strong>
              </div>
          ))}
        </div>
      </>
  );
}

function AddTransactionModal({ categories, onClose, onAdd }) {
  const [type, setType] = useState('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [error, setError] = useState('');

  const filteredCategories = categories.filter((category) => category.type === type);

  function handleSubmit(event) {
    event.preventDefault();

    if (!categoryId || !amount || Number(amount) <= 0 || !date) {
      setError('Please fill in all required fields with valid values.');
      return;
    }

    onAdd({
      categoryId: Number(categoryId),
      type,
      amount: Number(amount),
      description: description.trim(),
      transactionDate: date,
      paymentMethod,
    });
  }

  return (
      <div className="modal-overlay" onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
        <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-heading">
            <div>
              <h2 id="modal-title">Add transaction</h2>
              <p>Record money coming in or going out.</p>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="transaction-type-switch">
              <button type="button" className={type === 'EXPENSE' ? 'selected expense-selected' : ''} onClick={() => { setType('EXPENSE'); setCategoryId(''); }}>
                − Expense
              </button>
              <button type="button" className={type === 'INCOME' ? 'selected income-selected' : ''} onClick={() => { setType('INCOME'); setCategoryId(''); }}>
                + Income
              </button>
            </div>

            <label className="form-field">
              <span>Amount (₹) *</span>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 1500" required />
            </label>

            <label className="form-field">
              <span>Category *</span>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                <option value="">Select a category</option>
                {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Description</span>
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Monthly groceries" maxLength={500} />
            </label>

            <div className="form-two-columns">
              <label className="form-field">
                <span>Date *</span>
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </label>
              <label className="form-field">
                <span>Payment method</span>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-button">Save transaction</button>
            </div>
          </form>
        </section>
      </div>
  );
}

function CategoriesPage({ categories, onAddCategory }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onAddCategory({ name: name.trim(), type });
    setName('');
    setShowForm(false);
  }

  return (
      <section className="panel page-panel">
        <div className="panel-header">
          <div>
            <h3>Your categories</h3>
            <p>Organize your income and expenses.</p>
          </div>
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>+ Add category</button>
        </div>

        {showForm && (
            <form className="inline-category-form" onSubmit={submit}>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" maxLength={100} required />
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
              <button className="primary-button" type="submit">Save</button>
            </form>
        )}

        <div className="category-grid">
          {categories.map((category) => (
              <article className="category-card" key={category.id}>
                <div className={`transaction-icon ${category.type === 'INCOME' ? 'income-tx' : ''}`}>{category.icon || '◈'}</div>
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.type === 'INCOME' ? 'Income' : 'Expense'}</span>
                </div>
                <span className="category-arrow">↗</span>
              </article>
          ))}
        </div>
      </section>
  );
}


function BudgetsPage({ categories, selectedMonth }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const [year, month] = selectedMonth.split('-').map(Number);

  const expenseCategories = categories.filter(
      (category) => category.type === 'EXPENSE'
  );

  async function loadBudgets() {
    try {
      const data = await apiRequest(
          `/budgets?month=${month}&year=${year}`
      );

      setBudgets(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load budgets.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchBudgets() {
      try {
        const data = await apiRequest(
            `/budgets?month=${month}&year=${year}`
        );

        if (!cancelled) {
          setBudgets(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load budgets.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBudgets();

    return () => {
      cancelled = true;
    };
  }, [month, year]);

  async function createBudget(event) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!categoryId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Select a category and enter a valid budget amount.');
      return;
    }

    try {
      await apiRequest('/budgets', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: Number(categoryId),
          amount: numericAmount,
          month,
          year,
        }),
      });

      setCategoryId('');
      setAmount('');
      setShowForm(false);
      await loadBudgets();
    } catch (err) {
      setError(err.message || 'Could not create budget.');
    }
  }

  async function updateBudget(budget) {
    const newAmount = window.prompt(
        'Enter the new budget amount:',
        String(budget.amount)
    );

    if (newAmount === null) return;

    const numericAmount = Number(newAmount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Budget amount must be greater than zero.');
      return;
    }

    try {
      await apiRequest(`/budgets/${budget.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ amount: numericAmount }),
      });

      await loadBudgets();
    } catch (err) {
      setError(err.message || 'Could not update budget.');
    }
  }

  async function deleteBudget(id) {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await apiRequest(`/budgets/${id}`, {
        method: 'DELETE',
      });

      await loadBudgets();
    } catch (err) {
      setError(err.message || 'Could not delete budget.');
    }
  }

  const totalBudget = budgets.reduce(
      (sum, budget) => sum + Number(budget.amount || 0),
      0
  );

  const totalSpent = budgets.reduce(
      (sum, budget) => sum + Number(budget.spent || 0),
      0
  );

  return (
      <section>
        <div className="section-heading">
          <div>
            <h2>Monthly budgets</h2>
            <p>Track your spending limits for {formatMonth(selectedMonth)}.</p>
          </div>

          <button
              className="primary-button"
              onClick={() => setShowForm((previous) => !previous)}
          >
            {showForm ? 'Cancel' : '+ Add budget'}
          </button>
        </div>

        {error && (
            <div role="alert" className="form-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
        )}

        {showForm && (
            <form
                className="panel"
                onSubmit={createBudget}
                style={{ padding: 20, marginBottom: 20 }}
            >
              <h3>Create a budget</h3>

              <label className="form-field">
                <span>Expense category</span>
                <select
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Monthly budget (₹)</span>
                <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="e.g. 5000"
                    required
                />
              </label>

              <button className="primary-button" type="submit">
                Save budget
              </button>
            </form>
        )}

        <div className="stats-grid">
          <StatCard
              title="Total budget"
              value={totalBudget}
              icon="₹"
              color="purple"
              foot="Planned spending"
          />
          <StatCard
              title="Total spent"
              value={totalSpent}
              icon="↘"
              color="orange"
              foot="Across budget categories"
          />
          <StatCard
              title="Budget remaining"
              value={totalBudget - totalSpent}
              icon="◎"
              color="green"
              foot="Budget minus spending"
          />
        </div>

        {loading ? (
            <p>Loading budgets…</p>
        ) : budgets.length === 0 ? (
            <section className="panel placeholder-panel">
              <div className="placeholder-icon">▤</div>
              <h2>No budgets for this month</h2>
              <p>Create a budget to start tracking your expenses.</p>
            </section>
        ) : (
            <div className="category-grid" style={{ marginTop: 20 }}>
              {budgets.map((budget) => {
                const budgetAmount = Number(budget.amount || 0);
                const spent = Number(budget.spent || 0);
                const remaining = Number(budget.remaining || 0);
                const progress = budgetAmount > 0
                    ? Math.min((spent / budgetAmount) * 100, 100)
                    : 0;

                return (
                    <article
                        className="panel"
                        key={budget.id}
                        style={{ padding: 20 }}
                    >
                      <div className="panel-header">
                        <div>
                          <h3>{budget.categoryName}</h3>
                          <p>Monthly spending limit</p>
                        </div>
                        <strong>{Math.round(progress)}%</strong>
                      </div>

                      <div style={{
                        height: 9,
                        background: 'var(--border)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        margin: '16px 0',
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: progress >= 100
                              ? '#ef4444'
                              : 'var(--purple)',
                          borderRadius: 20,
                        }} />
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 8,
                      }}>
                        <span>Spent</span>
                        <strong>{currency(spent)}</strong>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 16,
                      }}>
                        <span>Budget</span>
                        <strong>{currency(budgetAmount)}</strong>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 16,
                      }}>
                        <span>{remaining < 0 ? 'Over budget' : 'Remaining'}</span>
                        <strong style={{
                          color: remaining < 0 ? '#ef4444' : 'inherit',
                        }}>
                          {currency(Math.abs(remaining))}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            className="primary-button"
                            onClick={() => updateBudget(budget)}
                        >
                          Edit
                        </button>

                        <button
                            className="primary-button"
                            onClick={() => deleteBudget(budget.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                );
              })}
            </div>
        )}
      </section>
  );
}

function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const [contributionGoal, setContributionGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionDate, setContributionDate] = useState(
      () => {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today.toISOString().slice(0, 10);
      }
  );
  const [contributionNote, setContributionNote] = useState('');

  const [historyGoal, setHistoryGoal] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function loadGoals() {
    try {
      const data = await apiRequest('/goals');
      setGoals(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load your goals.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    apiRequest('/goals')
        .then((data) => {
          if (!cancelled) {
            setGoals(Array.isArray(data) ? data : []);
            setError('');
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || 'Could not load your goals.');
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });

    return () => {
      cancelled = true;
    };
  }, []);

  async function createGoal(event) {
    event.preventDefault();

    const amount = Number(targetAmount);

    if (!name.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid goal name and target amount.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          targetAmount: amount,
          deadline: deadline || null,
        }),
      });

      setName('');
      setDescription('');
      setTargetAmount('');
      setDeadline('');
      setShowForm(false);

      await loadGoals();
    } catch (err) {
      setError(err.message || 'Could not create the goal.');
    } finally {
      setSaving(false);
    }
  }

  async function addContribution(event) {
    event.preventDefault();

    const amount = Number(contributionAmount);

    if (
        !contributionGoal ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
      setError('Enter a valid contribution amount.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await apiRequest(
          `/goals/${contributionGoal.id}/contributions`,
          {
            method: 'POST',
            body: JSON.stringify({
              amount,
              contributionDate,
              note: contributionNote.trim(),
            }),
          }
      );

      setContributionGoal(null);
      setContributionAmount('');
      setContributionNote('');

      await loadGoals();

      if (historyGoal === contributionGoal.id) {
        await loadHistory(contributionGoal.id);
      }
    } catch (err) {
      setError(err.message || 'Could not add the contribution.');
    } finally {
      setSaving(false);
    }
  }

  async function loadHistory(goalId) {
    setHistoryLoading(true);
    setError('');

    try {
      const data = await apiRequest(
          `/goals/${goalId}/contributions`
      );

      setContributions(Array.isArray(data) ? data : []);
      setHistoryGoal(goalId);
    } catch (err) {
      setError(err.message || 'Could not load contribution history.');
    } finally {
      setHistoryLoading(false);
    }
  }

  async function deleteGoal(goalId) {
    if (!window.confirm('Are you sure you want to delete this goal and its contribution history?')) {
      return;
    }

    setError('');

    try {
      await apiRequest(`/goals/${goalId}`, {
        method: 'DELETE',
      });

      setGoals((previous) =>
          previous.filter((goal) => goal.id !== goalId)
      );

      if (historyGoal === goalId) {
        setHistoryGoal(null);
        setContributions([]);
      }

      if (contributionGoal?.id === goalId) {
        setContributionGoal(null);
      }
    } catch (err) {
      setError(err.message || 'Could not delete the goal.');
    }
  }

  const totalTarget = goals.reduce(
      (sum, goal) => sum + Number(goal.targetAmount || 0),
      0
  );

  const totalSaved = goals.reduce(
      (sum, goal) => sum + Number(goal.savedAmount || 0),
      0
  );

  const completedGoals = goals.filter(
      (goal) => goal.status === 'COMPLETED'
  ).length;

  return (
      <section className="goals-page">
        <div className="section-heading">
          <div>
            <h2>Your savings goals</h2>
            <p>Turn your financial plans into achievable milestones.</p>
          </div>

          <button
              className="primary-button"
              onClick={() => setShowForm((previous) => !previous)}
          >
            {showForm ? 'Cancel' : '+ Create goal'}
          </button>
        </div>

        {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
        )}

        <div className="stats-grid goals-stats">
          <StatCard
              title="Total target"
              value={totalTarget}
              icon="◎"
              color="purple"
              foot="Across all goals"
          />
          <StatCard
              title="Total saved"
              value={totalSaved}
              icon="↗"
              color="green"
              foot="Your accumulated savings"
          />
          <StatCard
              title="Remaining"
              value={Math.max(0, totalTarget - totalSaved)}
              icon="₹"
              color="orange"
              foot="Amount left to save"
          />
          <StatCard
              title="Completed goals"
              value={completedGoals}
              icon="✓"
              color="blue"
              foot={`Out of ${goals.length} goals`}
              isCount
          />
        </div>

        {showForm && (
            <form className="panel goal-form" onSubmit={createGoal}>
              <h3>Create a savings goal</h3>

              <label className="form-field">
                <span>Goal name *</span>
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Emergency fund"
                    maxLength={150}
                    required
                />
              </label>

              <label className="form-field">
                <span>Description</span>
                <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What are you saving for?"
                    maxLength={255}
                />
              </label>

              <div className="form-two-columns">
                <label className="form-field">
                  <span>Target amount (₹) *</span>
                  <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={targetAmount}
                      onChange={(event) => setTargetAmount(event.target.value)}
                      placeholder="50000"
                      required
                  />
                </label>

                <label className="form-field">
                  <span>Deadline (optional)</span>
                  <input
                      type="date"
                      value={deadline}
                      onChange={(event) => setDeadline(event.target.value)}
                  />
                </label>
              </div>

              <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
              >
                {saving ? 'Creating…' : 'Create goal'}
              </button>
            </form>
        )}

        {loading ? (
            <p>Loading your goals…</p>
        ) : goals.length === 0 ? (
            <section className="panel placeholder-panel">
              <div className="placeholder-icon">◎</div>
              <h2>No savings goals yet</h2>
              <p>Create your first goal and start tracking your savings.</p>
              <button
                  className="primary-button"
                  onClick={() => setShowForm(true)}
              >
                + Create your first goal
              </button>
            </section>
        ) : (
            <div className="goals-grid">
              {goals.map((goal) => {
                const target = Number(goal.targetAmount || 0);
                const saved = Number(goal.savedAmount || 0);
                const remaining = Number(goal.remainingAmount || 0);
                const progress = Math.min(
                    Math.max(Number(goal.progressPercentage) || 0, 0),
                    100
                );

                return (
                    <article className="panel goal-card" key={goal.id}>
                      <div className="goal-card-header">
                        <div>
                          <span className="goal-icon">◎</span>
                          <h3>{goal.name}</h3>
                        </div>

                        <span className={`goal-status ${goal.status === 'COMPLETED' ? 'completed' : ''}`}>
                    {goal.status}
                  </span>
                      </div>

                      {goal.description && (
                          <p className="goal-description">
                            {goal.description}
                          </p>
                      )}

                      <div className="goal-amounts">
                        <div>
                          <span>Saved so far</span>
                          <strong>{currency(saved)}</strong>
                        </div>
                        <div>
                          <span>Target amount</span>
                          <strong>{currency(target)}</strong>
                        </div>
                      </div>

                      <div className="goal-progress-track">
                        <div
                            className="goal-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="goal-progress-label">
                        <strong>{progress.toFixed(1)}% completed</strong>
                        <span>{currency(remaining)} remaining</span>
                      </div>

                      <div className="goal-deadline">
                        Deadline: {goal.deadline || 'Not set'}
                      </div>

                      {contributionGoal?.id === goal.id && (
                          <form
                              className="goal-contribution-form"
                              onSubmit={addContribution}
                          >
                            <h4>Add savings</h4>

                            <label className="form-field">
                              <span>Amount (₹)</span>
                              <input
                                  type="number"
                                  min="0.01"
                                  max={remaining}
                                  step="0.01"
                                  value={contributionAmount}
                                  onChange={(event) =>
                                      setContributionAmount(event.target.value)
                                  }
                                  placeholder="e.g. 2000"
                                  required
                              />
                            </label>

                            <label className="form-field">
                              <span>Date</span>
                              <input
                                  type="date"
                                  value={contributionDate}
                                  onChange={(event) =>
                                      setContributionDate(event.target.value)
                                  }
                                  required
                              />
                            </label>

                            <label className="form-field">
                              <span>Note (optional)</span>
                              <input
                                  value={contributionNote}
                                  onChange={(event) =>
                                      setContributionNote(event.target.value)
                                  }
                                  placeholder="Monthly savings"
                                  maxLength={255}
                              />
                            </label>

                            <div className="goal-actions">
                              <button
                                  className="primary-button"
                                  type="submit"
                                  disabled={saving || remaining <= 0}
                              >
                                {saving ? 'Saving…' : 'Save contribution'}
                              </button>
                              <button
                                  type="button"
                                  className="modal-cancel"
                                  onClick={() => setContributionGoal(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                      )}

                      <div className="goal-actions">
                        {goal.status !== 'COMPLETED' && (
                            <button
                                className="primary-button"
                                onClick={() => {
                                  setContributionGoal(goal);
                                  setError('');
                                }}
                            >
                              + Add savings
                            </button>
                        )}

                        <button
                            className="goal-secondary-button"
                            onClick={() =>
                                historyGoal === goal.id
                                    ? setHistoryGoal(null)
                                    : loadHistory(goal.id)
                            }
                        >
                          {historyGoal === goal.id ? 'Hide history' : 'History'}
                        </button>

                        <button
                            className="goal-delete-button"
                            onClick={() => deleteGoal(goal.id)}
                        >
                          Delete
                        </button>
                      </div>

                      {historyGoal === goal.id && (
                          <div className="goal-history">
                            <h4>Contribution history</h4>

                            {historyLoading ? (
                                <p>Loading contributions…</p>
                            ) : contributions.length === 0 ? (
                                <p>No contributions recorded yet.</p>
                            ) : (
                                contributions.map((item) => (
                                    <div className="contribution-row" key={item.id}>
                                      <div>
                                        <strong>{currency(item.amount)}</strong>
                                        <span>{item.note || 'Savings contribution'}</span>
                                      </div>
                                      <span>{item.contributionDate}</span>
                                    </div>
                                ))
                            )}
                          </div>
                      )}
                    </article>
                );
              })}
            </div>
        )}
      </section>
  );
}


function ReportsPage() {
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      setError('');

      try {
        const data = await apiRequest(
            `/reports/monthly?month=${month}`
        );

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load report.');
          setReport(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [month]);

  const income = Number(report?.totalIncome || 0);
  const expenses = Number(report?.totalExpenses || 0);
  const savings = Number(report?.savings || 0);
  const count = Number(report?.transactionCount || 0);

  const savingsRate = income > 0
      ? (savings / income) * 100
      : 0;

  return (
      <section className="reports-page">
        <div className="section-heading">
          <div>
            <h2>Financial reports</h2>
            <p>Understand your income, expenses and savings.</p>
          </div>

          <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              aria-label="Select report month"
          />
        </div>

        {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
        )}

        {loading ? (
            <section className="panel placeholder-panel">
              <p>Loading your monthly report...</p>
            </section>
        ) : report ? (
            <>
              <div className="stats-grid">
                <StatCard
                    title="Total income"
                    value={income}
                    icon="↗"
                    color="green"
                    foot="Money received this month"
                />

                <StatCard
                    title="Total expenses"
                    value={expenses}
                    icon="↘"
                    color="orange"
                    foot="Money spent this month"
                />

                <StatCard
                    title="Net savings"
                    value={savings}
                    icon="₹"
                    color="purple"
                    foot="Income minus expenses"
                />

                <StatCard
                    title="Transactions"
                    value={count}
                    icon="⇄"
                    color="blue"
                    foot="Recorded this month"
                    isCount
                />
              </div>

              <section className="panel report-details">
                <h3>Monthly financial summary</h3>
                <p>{formatMonth(report.month)}</p>

                <div className="report-row">
                  <span>Total income</span>
                  <strong>{currency(income)}</strong>
                </div>

                <div className="report-row">
                  <span>Total expenses</span>
                  <strong>{currency(expenses)}</strong>
                </div>

                <div className="report-row">
                  <span>Net savings</span>
                  <strong>{currency(savings)}</strong>
                </div>

                <div className="report-row">
                  <span>Savings rate</span>
                  <strong>{savingsRate.toFixed(1)}%</strong>
                </div>

                <div className="report-row">
                  <span>Transaction count</span>
                  <strong>{count}</strong>
                </div>
              </section>
            </>
        ) : (
            <section className="panel placeholder-panel">
              <div className="placeholder-icon">▥</div>
              <h2>No report available</h2>
              <p>There is no report data for this month.</p>
            </section>
        )}
      </section>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [authScreen, setAuthScreen] = useState('login');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [categories, setCategories] = useState(initialCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLight, setIsLight] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [isLoading, setIsLoading] = useState(
      () => Boolean(localStorage.getItem('fintrack_token'))
  );
  const [pageError, setPageError] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(
      () => Boolean(localStorage.getItem('fintrack_token'))
  );
  const [currentUser, setCurrentUser] = useState(null);

  async function loadData() {
    setPageError('');
    setIsLoading(true);

    try {
      const [transactionData, categoryData] = await Promise.all([
        apiRequest('/transactions'),
        apiRequest('/categories'),
      ]);

      setTransactions(
          Array.isArray(transactionData)
              ? transactionData.map(mapApiTransaction)
              : []
      );

      setCategories(
          Array.isArray(categoryData)
              ? categoryData.map(mapApiCategory)
              : []
      );
    } catch (error) {
      setPageError(
          error.message ||
          'Could not load your FinTrack data. Please sign in and try again.'
      );

      if (
          error.message?.includes('Session expired') ||
          error.message?.includes('Access forbidden')
      ) {
        clearToken();
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  const monthTransactions = transactions.filter((tx) => tx.dateKey?.startsWith(selectedMonth));
  const totalIncome = monthTransactions.filter((tx) => tx.type === 'INCOME').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalExpenses = monthTransactions.filter((tx) => tx.type === 'EXPENSE').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  async function addTransaction(request) {
    const category = categories.find((item) => item.id === request.categoryId);

    if (!category || category.type !== request.type) {
      window.alert('Please select a category matching the transaction type.');
      return;
    }

    try {
      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      setShowAddModal(false);
      await loadData();
    } catch (error) {
      window.alert(error.message || 'Could not save the transaction.');
    }
  }

  async function addCategory(request) {
    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      await loadData();
    } catch (error) {
      window.alert(error.message || 'Could not save the category.');
    }
  }

  function handleLogout() {
    clearToken();

    setIsAuthenticated(false);
    setIsLoading(false);
    setActivePage('Dashboard');
    setTransactions([]);
    setCategories([]);
    setPageError('');
    setAuthScreen('login');
    setCurrentUser(null);
  }

  const currentMonthTransactions = monthTransactions
      .slice()
      .sort((a, b) => (b.dateKey || '').localeCompare(a.dateKey || ''));

  if (!isAuthenticated) {
    return authScreen === 'register' ? (
        <Register
            onRegistered={() => setAuthScreen('login')}
            onSwitchToLogin={() => setAuthScreen('login')}
        />
    ) : (
        <Login
            onLogin={(user) => {
              setCurrentUser(user);
              setIsLoading(true);
              setIsAuthenticated(true);
            }}
            onSwitchToRegister={() => setAuthScreen('register')}
        />
    );
  }

  return (
      <div className={`app ${isLight ? 'light' : ''}`}>
        <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            onLogout={handleLogout}
            currentUser={currentUser}
        />

        <main className="main-content">
          {pageError && (
              <div role="alert" style={{ margin: '16px 0', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                {pageError} <button className="view-all" onClick={loadData}>Retry</button>
              </div>
          )}
          {isLoading && <p style={{ padding: '12px 0', color: 'var(--muted)' }}>Loading your financial data…</p>}
          <header className="topbar">
            <div>
              <div className="breadcrumb">Workspace <span>/</span> {activePage}</div>
              <h1>{activePage === 'Dashboard' ? 'Your Financial Overview' : activePage}</h1>
            </div>

            <div className="topbar-actions">
              {/* Theme button */}
              <button
                  className="icon-button"
                  onClick={() => setIsLight((previous) => !previous)}
                  title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                  aria-label="Toggle theme"
              >
                {isLight ? '☾' : '☼'}
              </button>

              {/* Notifications */}
              <div className="topbar-menu-wrapper">
                <button
                    type="button"
                    className="notification-button"
                    onClick={() => {
                      setShowNotifications((previous) => !previous);
                      setShowProfileMenu(false);
                    }}
                    title="Notifications"
                    aria-label="Notifications"
                    aria-expanded={showNotifications}
                >
                  ♧
                  <span />
                </button>

                {showNotifications && (
                    <div className="topbar-dropdown">
                      <strong>Notifications</strong>
                      <p>You're all caught up!</p>
                      <small>No new notifications.</small>
                    </div>
                )}
              </div>

              {/* Profile */}
              <div className="topbar-menu-wrapper">
                <button
                    type="button"
                    className="top-avatar"
                    onClick={() => {
                      setShowProfileMenu((previous) => !previous);
                      setShowNotifications(false);
                    }}
                    aria-label="Open profile menu"
                    aria-expanded={showProfileMenu}
                >
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                </button>

                {showProfileMenu && (
                    <div className="topbar-dropdown profile-dropdown">
                      <strong>{currentUser?.name || 'FinTrack User'}</strong>
                      <small>{currentUser?.email || 'Personal account'}</small>

                      <button
                          type="button"
                          className="dropdown-logout"
                          onClick={handleLogout}
                      >
                        ⇥ Logout
                      </button>
                    </div>
                )}
              </div>
            </div>
          </header>

          {activePage === 'Dashboard' && (
              <>
                <div className="section-heading">
                  <div>
                    <h2>Overview</h2>
                    <p>Your financial performance at a glance.</p>
                  </div>
                  <select className="period-select" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                    {Array.from({ length: 12 }, (_, index) => {
                      const date = new Date(new Date().getFullYear(), new Date().getMonth() - index, 1);
                      const value = getMonthKey(date);
                      return <option key={value} value={value}>{formatMonth(value)}</option>;
                    })}
                  </select>
                </div>

                <div className="stats-grid">
                  <StatCard title="Total balance" value={balance} icon="₹" color="purple" foot="Income minus expenses" decoration />
                  <StatCard title="Total income" value={totalIncome} icon="↗" color="green" foot="Money received" decoration="income" />
                  <StatCard title="Total expenses" value={totalExpenses} icon="↘" color="orange" foot="Money spent" decoration="expense" />
                  <StatCard
                      title="Savings rate"
                      value={Number.isFinite(savingsRate) ? Math.max(0, savingsRate) : 0}
                      icon="⊙"
                      color="blue"
                      foot="Of monthly income"
                      progress={Number.isFinite(savingsRate) ? Math.max(0, savingsRate) : 0}
                  />
                </div>

                <div className="middle-grid">
                  <CashFlowChart transactions={transactions} month={selectedMonth} />
                  <HealthPanel income={totalIncome} expenses={totalExpenses} />
                </div>

                <section className="panel transactions-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Recent transactions</h3>
                      <p>Your latest income and expenses for {formatMonth(selectedMonth)}.</p>
                    </div>
                    <button className="view-all" onClick={() => setActivePage('Transactions')}>View all <span>→</span></button>
                  </div>
                  <TransactionRows transactions={currentMonthTransactions.slice(0, 5)} />
                </section>
              </>
          )}

          {activePage === 'Transactions' && (
              <>
                <div className="section-heading">
                  <div>
                    <h2>All transactions</h2>
                    <p>Review your recorded income and expenses.</p>
                  </div>
                  <button className="primary-button" onClick={() => setShowAddModal(true)}>+ Add transaction</button>
                </div>
                <section className="panel transactions-panel">
                  <TransactionRows transactions={transactions.slice().sort((a, b) => (b.dateKey || '').localeCompare(a.dateKey || ''))} />
                </section>
              </>
          )}

          {activePage === 'Categories' && (
              <CategoriesPage categories={categories} onAddCategory={addCategory} />
          )}

          {activePage === 'Budgets' && (
              <BudgetsPage
                  categories={categories}
                  transactions={transactions}
                  selectedMonth={selectedMonth}
              />
          )}

          {activePage === 'Goals' && <GoalsPage />}

          {activePage === 'Reports' && <ReportsPage />}

          <footer className="footer">
            <span>© 2026 FinTrack. Made with <b>♥</b> for better money habits.</span>
            <span>Personal finance, made clearer.</span>
          </footer>
        </main>

        {showAddModal && (
            <AddTransactionModal
                categories={categories}
                onClose={() => setShowAddModal(false)}
                onAdd={addTransaction}
            />
        )}
      </div>
  );
}