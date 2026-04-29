// ===== World Bank SPA =====
const API = '/api/v1';
let token = localStorage.getItem('token');
let user = null;
let myAccount = null;

// ===== API Helper =====
async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
}

// ===== Toast =====
function toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${msg}`;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// ===== Router =====
function navigate(hash) {
    window.location.hash = hash;
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
    if (!window.location.hash) window.location.hash = token ? '#dashboard' : '#login';
    route();
});

function route() {
    const hash = window.location.hash.slice(1) || 'login';
    if (!token && hash !== 'login' && hash !== 'register') {
        navigate('login');
        return;
    }
    const routes = { login: renderLogin, register: renderRegister, dashboard: renderDashboard,
        transfer: renderTransfer, history: renderHistory, accounts: renderAllAccounts,
        audit: renderAudit, reports: renderReports };
    (routes[hash] || renderDashboard)();
}

// ===== Auth =====
function renderLogin() {
    document.getElementById('app').innerHTML = `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-logo">
                <div class="logo-icon">🏦</div>
                <h1>World Bank</h1>
                <p>Sign in to your account</p>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" placeholder="admin@bank.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-primary">Sign In</button>
            </form>
            <div class="auth-link">Don't have an account? <a href="#register">Register</a></div>
        </div>
    </div>`;
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })});
            token = res.data.token;
            localStorage.setItem('token', token);
            toast('Login successful', 'success');
            navigate('dashboard');
        } catch (err) { toast(err.message, 'error'); }
    };
}

function renderRegister() {
    document.getElementById('app').innerHTML = `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-logo">
                <div class="logo-icon">🏦</div>
                <h1>World Bank</h1>
                <p>Create a new account</p>
            </div>
            <form id="regForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="name" placeholder="John Doe" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" placeholder="john@bank.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-primary">Create Account</button>
            </form>
            <div class="auth-link">Already have an account? <a href="#login">Sign In</a></div>
        </div>
    </div>`;
    document.getElementById('regForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            await api('/auth/register', { method: 'POST', body: JSON.stringify({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })});
            toast('Registration successful! Please login.', 'success');
            navigate('login');
        } catch (err) { toast(err.message, 'error'); }
    };
}

// ===== Layout =====
function appShell(activePage, content) {
    const isAdmin = user && user.role === 'ADMIN';
    return `
    <div class="app-layout">
        <aside class="sidebar">
            <div class="sidebar-logo">
                <div class="logo-icon">🏦</div>
                <span>World Bank</span>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-section">Main</div>
                <a class="nav-item ${activePage === 'dashboard' ? 'active' : ''}" href="#dashboard">
                    <span class="nav-icon">📊</span> Dashboard
                </a>
                ${!isAdmin ? `
                <a class="nav-item ${activePage === 'transfer' ? 'active' : ''}" href="#transfer">
                    <span class="nav-icon">💸</span> Transfer
                </a>
                <a class="nav-item ${activePage === 'history' ? 'active' : ''}" href="#history">
                    <span class="nav-icon">📋</span> Transactions
                </a>
                ` : `
                <div class="nav-section">Administration</div>
                <a class="nav-item ${activePage === 'accounts' ? 'active' : ''}" href="#accounts">
                    <span class="nav-icon">👥</span> All Accounts
                </a>
                <a class="nav-item ${activePage === 'audit' ? 'active' : ''}" href="#audit">
                    <span class="nav-icon">🔍</span> Audit Logs
                </a>
                <a class="nav-item ${activePage === 'reports' ? 'active' : ''}" href="#reports">
                    <span class="nav-icon">📈</span> Reports
                </a>
                `}
            </nav>
            <div class="sidebar-footer">
                <div class="user-badge">
                    <div class="user-avatar">${(user?.name || '?')[0].toUpperCase()}</div>
                    <div class="user-info">
                        <div class="name">${user?.name || ''}</div>
                        <div class="role">${user?.role || ''}</div>
                    </div>
                </div>
                <button class="nav-item" onclick="logout()" style="margin-top:8px;color:var(--error)">
                    <span class="nav-icon">🚪</span> Logout
                </button>
            </div>
        </aside>
        <main class="main-content">${content}</main>
    </div>`;
}

function logout() {
    token = null; user = null; myAccount = null;
    localStorage.removeItem('token');
    navigate('login');
}

// ===== Load User =====
async function loadUser() {
    if (!user) {
        try {
            const res = await api('/auth/me');
            user = res.data;
        } catch { logout(); return false; }
    }
    return true;
}

// ===== Dashboard =====
async function renderDashboard() {
    if (!(await loadUser())) return;
    if (user.role === 'ADMIN') return renderAdminDashboard();
    return renderCustomerDashboard();
}

async function renderAdminDashboard() {
    document.getElementById('app').innerHTML = appShell('dashboard', `
        <div class="page-header"><h2>Admin Dashboard</h2><p>Overview of all banking operations</p></div>
        <div class="page-loader"><div class="spinner"></div></div>
    `);
    try {
        const [accsRes, reportRes] = await Promise.all([
            api('/account/all'), api('/reports/total-balance')
        ]);
        const accounts = accsRes.data;
        const totalBal = reportRes.data.totalBalance;
        document.querySelector('.main-content').innerHTML = `
            <div class="page-header"><h2>Admin Dashboard</h2><p>Overview of all banking operations</p></div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon blue">👥</div>
                    <div class="stat-label">Total Accounts</div>
                    <div class="stat-value">${accounts.length}</div></div>
                <div class="stat-card"><div class="stat-icon gold">💰</div>
                    <div class="stat-label">Total Balance</div>
                    <div class="stat-value">₹${fmt(totalBal)}</div></div>
                <div class="stat-card"><div class="stat-icon green">📊</div>
                    <div class="stat-label">Avg Balance</div>
                    <div class="stat-value">₹${accounts.length ? fmt(totalBal / accounts.length) : '0'}</div></div>
            </div>
            <div class="data-card">
                <div class="data-card-header"><h3>All Accounts</h3></div>
                <table class="data-table">
                    <thead><tr><th>Account</th><th>Name</th><th>User ID</th><th>Balance</th></tr></thead>
                    <tbody>${accounts.map(a => `<tr>
                        <td><strong>${a.accountNumber}</strong></td>
                        <td>${a.name}</td>
                        <td>#${a.userId}</td>
                        <td class="amount-positive">₹${fmt(a.balance)}</td>
                    </tr>`).join('')}</tbody>
                </table>
                ${accounts.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><p>No accounts yet</p></div>' : ''}
            </div>`;
    } catch (err) { toast(err.message, 'error'); }
}

async function renderCustomerDashboard() {
    document.getElementById('app').innerHTML = appShell('dashboard', `
        <div class="page-header"><h2>Welcome back, ${user.name}</h2><p>Manage your finances</p></div>
        <div class="page-loader"><div class="spinner"></div></div>
    `);
    try {
        const accRes = await api('/account/my');
        myAccount = accRes.data;
        const intRes = await api(`/account/interest/${myAccount.accountNumber}`);
        document.querySelector('.main-content').innerHTML = `
            <div class="page-header"><h2>Welcome back, ${user.name}</h2><p>Manage your finances</p></div>
            <div class="balance-hero">
                <div class="account-number">Account: ${myAccount.accountNumber}</div>
                <div class="balance-label">Available Balance</div>
                <div class="balance-amount"><span class="currency">₹</span>${fmt(myAccount.balance)}</div>
                <div class="interest-info">Annual Interest: <span class="badge">₹${fmt(intRes.data)} @ 3.5%</span></div>
            </div>
            <div class="quick-actions">
                <div class="action-card" onclick="showModal('deposit')">
                    <div class="action-icon deposit">💰</div>
                    <div class="action-label">Deposit</div></div>
                <div class="action-card" onclick="showModal('withdraw')">
                    <div class="action-icon withdraw">💸</div>
                    <div class="action-label">Withdraw</div></div>
                <div class="action-card" onclick="navigate('transfer')">
                    <div class="action-icon transfer">🔄</div>
                    <div class="action-label">Transfer</div></div>
                <div class="action-card" onclick="navigate('history')">
                    <div class="action-icon history">📋</div>
                    <div class="action-label">History</div></div>
            </div>
            <div id="recentTxn"></div>`;
        loadRecentTransactions();
    } catch (err) {
        document.querySelector('.main-content').innerHTML = `
            <div class="page-header"><h2>Welcome, ${user.name}</h2><p>Manage your finances</p></div>
            <div class="empty-state" style="margin-top:40px">
                <div class="empty-icon">🏦</div>
                <p>No bank account found. Please contact an administrator to create one for you.</p>
            </div>`;
    }
}

async function loadRecentTransactions() {
    if (!myAccount) return;
    try {
        const res = await api(`/transaction/history/${myAccount.accountNumber}`);
        const txns = res.data.slice(0, 5);
        document.getElementById('recentTxn').innerHTML = `
        <div class="data-card">
            <div class="data-card-header"><h3>Recent Transactions</h3>
                <a href="#history" class="btn btn-secondary btn-sm">View All</a></div>
            ${txns.length ? `<table class="data-table">
                <thead><tr><th>Type</th><th>Account</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>${txns.map(t => {
                    const isSent = t.fromAccount === myAccount.accountNumber;
                    return `<tr>
                        <td><span class="${isSent ? 'badge-debit' : 'badge-credit'}">${isSent ? '↑ Sent' : '↓ Received'}</span></td>
                        <td>${isSent ? t.toAccount : t.fromAccount}</td>
                        <td class="${isSent ? 'amount-negative' : 'amount-positive'}">${isSent ? '-' : '+'}₹${fmt(t.amount)}</td>
                        <td style="color:var(--text-muted)">${fmtDate(t.date)}</td>
                    </tr>`;
                }).join('')}</tbody>
            </table>` : '<div class="empty-state"><div class="empty-icon">📭</div><p>No transactions yet</p></div>'}
        </div>`;
    } catch {}
}

// ===== Modals =====
function showModal(type) {
    const title = type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
    <div class="modal">
        <h3>${title}</h3>
        <form id="modalForm">
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="modalAmount" min="1" step="0.01" placeholder="Enter amount" required>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button type="submit" class="btn ${type === 'deposit' ? 'btn-success' : 'btn-danger'}">${title}</button>
            </div>
        </form>
    </div>`;
    document.body.appendChild(overlay);
    document.getElementById('modalForm').onsubmit = async (e) => {
        e.preventDefault();
        const amount = document.getElementById('modalAmount').value;
        try {
            await api(`/account/${type}?accountNumber=${myAccount.accountNumber}&amount=${amount}`, { method: 'POST' });
            toast(`${title} of ₹${amount} successful!`, 'success');
            overlay.remove();
            renderDashboard();
        } catch (err) { toast(err.message, 'error'); }
    };
}

// ===== Transfer =====
async function renderTransfer() {
    if (!(await loadUser())) return;
    if (!myAccount) { try { myAccount = (await api('/account/my')).data; } catch { navigate('dashboard'); return; } }
    document.getElementById('app').innerHTML = appShell('transfer', `
        <div class="page-header"><h2>Transfer Funds</h2><p>Send money to another account</p></div>
        <div class="auth-card" style="max-width:480px">
            <form id="transferForm">
                <div class="form-group">
                    <label>From Account</label>
                    <input type="text" value="${myAccount.accountNumber}" disabled>
                </div>
                <div class="form-group">
                    <label>To Account Number</label>
                    <input type="text" id="toAcc" placeholder="e.g. ACC1002" required>
                </div>
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" id="transferAmt" min="1" step="0.01" placeholder="Enter amount" required>
                </div>
                <button type="submit" class="btn btn-primary">Send Money</button>
            </form>
        </div>
    `);
    document.getElementById('transferForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            await api('/account/transfer', { method: 'POST', body: JSON.stringify({
                fromAcc: myAccount.accountNumber,
                toAcc: document.getElementById('toAcc').value,
                amount: parseFloat(document.getElementById('transferAmt').value),
                requestId: crypto.randomUUID()
            })});
            toast('Transfer successful!', 'success');
            myAccount = null;
            navigate('dashboard');
        } catch (err) { toast(err.message, 'error'); }
    };
}

// ===== Transaction History =====
async function renderHistory() {
    if (!(await loadUser())) return;
    if (!myAccount) { try { myAccount = (await api('/account/my')).data; } catch { navigate('dashboard'); return; } }
    document.getElementById('app').innerHTML = appShell('history', `
        <div class="page-header"><h2>Transaction History</h2><p>All your transactions</p></div>
        <div class="page-loader"><div class="spinner"></div></div>
    `);
    try {
        const res = await api(`/transaction/history/${myAccount.accountNumber}`);
        const txns = res.data;
        document.querySelector('.main-content').innerHTML = `
            <div class="page-header"><h2>Transaction History</h2><p>${txns.length} transactions found</p></div>
            <div class="data-card">
                ${txns.length ? `<table class="data-table">
                    <thead><tr><th>Type</th><th>From</th><th>To</th><th>Amount</th><th>Date</th><th>Request ID</th></tr></thead>
                    <tbody>${txns.map(t => {
                        const isSent = t.fromAccount === myAccount.accountNumber;
                        return `<tr>
                            <td><span class="${isSent ? 'badge-debit' : 'badge-credit'}">${isSent ? '↑ Sent' : '↓ Received'}</span></td>
                            <td>${t.fromAccount}</td><td>${t.toAccount}</td>
                            <td class="${isSent ? 'amount-negative' : 'amount-positive'}">${isSent ? '-' : '+'}₹${fmt(t.amount)}</td>
                            <td style="color:var(--text-muted)">${fmtDate(t.date)}</td>
                            <td style="color:var(--text-muted);font-size:12px">${t.requestId?.slice(0, 8)}...</td>
                        </tr>`;
                    }).join('')}</tbody>
                </table>` : '<div class="empty-state"><div class="empty-icon">📭</div><p>No transactions yet</p></div>'}
            </div>`;
    } catch (err) { toast(err.message, 'error'); }
}

// ===== Admin: All Accounts =====
async function renderAllAccounts() {
    if (!(await loadUser())) return;
    document.getElementById('app').innerHTML = appShell('accounts', `
        <div class="page-header"><h2>All Accounts</h2><p>Manage bank accounts</p></div>
        <div class="page-loader"><div class="spinner"></div></div>
    `);
    try {
        const res = await api('/account/all');
        document.querySelector('.main-content').innerHTML = `
            <div class="page-header"><h2>All Accounts</h2><p>${res.data.length} accounts</p></div>
            <div class="data-card">
                <div class="data-card-header"><h3>Accounts</h3>
                    <button class="btn btn-gold btn-sm" onclick="showCreateAccountModal()">+ Create Account</button></div>
                <table class="data-table">
                    <thead><tr><th>Account #</th><th>Name</th><th>User ID</th><th>Balance</th><th>Actions</th></tr></thead>
                    <tbody>${res.data.map(a => `<tr>
                        <td><strong>${a.accountNumber}</strong></td>
                        <td>${a.name}</td>
                        <td>#${a.userId}</td>
                        <td class="amount-positive">₹${fmt(a.balance)}</td>
                        <td><button class="btn btn-danger btn-sm" onclick="deleteAccount('${a.accountNumber}')">Delete</button></td>
                    </tr>`).join('')}</tbody>
                </table>
            </div>`;
    } catch (err) { toast(err.message, 'error'); }
}

function showCreateAccountModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
    <div class="modal">
        <h3>Create Account</h3>
        <form id="createAccForm">
            <div class="form-group"><label>Account Number</label>
                <input type="text" id="newAccNum" placeholder="e.g. ACC1003" required></div>
            <div class="form-group"><label>User ID</label>
                <input type="number" id="newUserId" placeholder="User ID" required></div>
            <div class="form-group"><label>Account Holder Name</label>
                <input type="text" id="newAccName" placeholder="Full name" required></div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button type="submit" class="btn btn-gold">Create</button>
            </div>
        </form>
    </div>`;
    document.body.appendChild(overlay);
    document.getElementById('createAccForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            await api('/account/create', { method: 'POST', body: JSON.stringify({
                accountNumber: document.getElementById('newAccNum').value,
                userId: parseInt(document.getElementById('newUserId').value),
                name: document.getElementById('newAccName').value
            })});
            toast('Account created!', 'success');
            overlay.remove();
            renderAllAccounts();
        } catch (err) { toast(err.message, 'error'); }
    };
}

async function deleteAccount(accNum) {
    if (!confirm(`Delete account ${accNum}? This cannot be undone.`)) return;
    try {
        await api(`/account/delete/${accNum}`, { method: 'DELETE' });
        toast('Account deleted', 'success');
        renderAllAccounts();
    } catch (err) { toast(err.message, 'error'); }
}

// ===== Admin: Audit =====
async function renderAudit() {
    if (!(await loadUser())) return;
    document.getElementById('app').innerHTML = appShell('audit', `
        <div class="page-header"><h2>Audit Logs</h2><p>Track all operations</p></div>
        <div class="page-loader"><div class="spinner"></div></div>
    `);
    try {
        const res = await api('/audit');
        document.querySelector('.main-content').innerHTML = `
            <div class="page-header"><h2>Audit Logs</h2><p>${res.data.length} entries</p></div>
            <div class="data-card">
                ${res.data.length ? `<table class="data-table">
                    <thead><tr><th>Action</th><th>Entity</th><th>ID</th><th>User</th><th>Time</th></tr></thead>
                    <tbody>${res.data.map(l => `<tr>
                        <td><span class="badge-role badge-admin">${l.action}</span></td>
                        <td>${l.entity}</td>
                        <td>${l.entityId || '-'}</td>
                        <td>${l.performedBy}</td>
                        <td style="color:var(--text-muted)">${fmtDate(l.timestamp)}</td>
                    </tr>`).join('')}</tbody>
                </table>` : '<div class="empty-state"><div class="empty-icon">🔍</div><p>No audit logs yet</p></div>'}
            </div>`;
    } catch (err) { toast(err.message, 'error'); }
}

// ===== Admin: Reports =====
async function renderReports() {
    if (!(await loadUser())) return;
    document.getElementById('app').innerHTML = appShell('reports', `
        <div class="page-header"><h2>Reports</h2><p>Banking analytics</p></div>
        <div class="page-loader"><div class="spinner"></div></div>
    `);
    try {
        const [reportRes, accsRes] = await Promise.all([
            api('/reports/total-balance'), api('/account/all')
        ]);
        const total = reportRes.data.totalBalance;
        const accs = accsRes.data;
        document.querySelector('.main-content').innerHTML = `
            <div class="page-header"><h2>Reports</h2><p>Banking analytics</p></div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon gold">💰</div>
                    <div class="stat-label">Total Deposits</div>
                    <div class="stat-value">₹${fmt(total)}</div></div>
                <div class="stat-card"><div class="stat-icon blue">👥</div>
                    <div class="stat-label">Active Accounts</div>
                    <div class="stat-value">${accs.length}</div></div>
                <div class="stat-card"><div class="stat-icon green">📊</div>
                    <div class="stat-label">Average Balance</div>
                    <div class="stat-value">₹${accs.length ? fmt(total / accs.length) : '0'}</div></div>
                <div class="stat-card"><div class="stat-icon purple">📈</div>
                    <div class="stat-label">Projected Interest</div>
                    <div class="stat-value">₹${fmt(total * 0.035)}</div></div>
            </div>`;
    } catch (err) { toast(err.message, 'error'); }
}

// ===== Helpers =====
function fmt(n) { return parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(d) {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
