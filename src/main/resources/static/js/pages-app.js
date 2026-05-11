const skelRow=`<div class="skeleton h-16 w-full rounded mb-2"></div>`;
const skelCard=`<div class="skeleton h-48 w-full rounded-xl"></div>`;

/* Dashboard */
async function pgDash() {
  if (!(await loadUser())) return;
  if (user.role === 'ADMIN') return pgAdminDash();
  document.getElementById('app').innerHTML = shell('dashboard', `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">${skelCard.repeat(2)}</div>`);
  await loadAccounts(); await loadCards();
  const total = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
  const accs = accounts.map(a => `<div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft hover:shadow-md transition-shadow border border-outline-variant/30 flex flex-col relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-1 bg-primary"></div>
    <div class="flex justify-between items-start mb-6"><div><h4 class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">${escapeHTML(a.accountType)}</h4><div class="flex items-center gap-2 mt-1"><p class="text-sm text-on-surface-variant/70">${escapeHTML(a.accountNumber)}</p><button onclick="copyText('${a.accountNumber}')" class="text-primary hover:text-primary-container"><span class="material-symbols-outlined text-[14px]">content_copy</span></button></div></div><span class="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">account_balance</span></div>
    <div class="mt-auto"><div class="text-2xl font-semibold text-on-surface mb-4">₹${fmt(a.balance)}</div>
    <div class="flex space-x-3 border-t border-outline-variant/50 pt-4"><button class="text-xs font-semibold text-primary flex items-center hover:underline" onclick="showModal('deposit')">Deposit <span class="material-symbols-outlined text-[16px] ml-1">arrow_forward</span></button><span class="w-px bg-outline-variant h-4 my-auto"></span><button class="text-xs font-semibold text-on-surface-variant hover:text-on-surface" onclick="showModal('withdraw')">Withdraw</button></div></div></div>`).join('');
  
  const main = document.querySelector('.max-w-\\[1100px\\]');
  if (!main) return;
  main.innerHTML = `<header class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-8 border-b border-outline-variant">
    <div><h1 class="text-3xl font-display font-bold text-primary mb-2">Good morning, ${escapeHTML(user.name)}</h1><p class="text-base text-on-surface-variant">Here is a summary of your accounts.</p></div>
    <div class="mt-6 md:mt-0 text-right"><p class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total Net Worth</p><div class="text-4xl font-bold text-on-surface tracking-tight">₹${fmt(total)}</div></div>
  </header>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
    <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 card-lift">
      <h3 class="text-xl font-display font-semibold text-primary mb-4">Balance Trend</h3>
      <div class="h-56 relative w-full"><canvas id="balChart"></canvas></div>
    </div>
    <div class="flex flex-col gap-4">
      <h3 class="text-xl font-display font-semibold text-primary">Your Accounts</h3>
      ${accs || '<p class="text-on-surface-variant">No accounts yet. Create one from the sidebar.</p>'}
    </div>
  </div>
  <div class="flex justify-between items-end mb-6"><h3 class="text-xl font-display font-semibold text-primary">Recent Transactions</h3><a href="#history" class="text-xs font-semibold text-primary hover:underline flex items-center">View All <span class="material-symbols-outlined text-[16px] ml-1">arrow_forward</span></a></div>
  <div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-x-auto w-full" id="recentTxn"><div class="p-4">${skelRow.repeat(3)}</div></div>`;
  
  // Render Chart
  if(window.Chart) {
    const ctx = document.getElementById('balChart');
    if(ctx) {
      window.balChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
          datasets: [{ label: 'Total Balance', data: [total*0.6, total*0.65, total*0.8, total*0.75, total*0.9, total], borderColor: '#255fa3', backgroundColor: 'rgba(37, 95, 163, 0.1)', fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
  }
  loadRecent();
}
async function loadRecent() {
  if (!accounts.length) { const el = document.getElementById('recentTxn'); if (el) el.innerHTML = '<p class="p-6 text-on-surface-variant">No transactions.</p>'; return; }
  try {
    const r = await api('/transaction/history/' + accounts[0].accountNumber + '?size=5'); const t = r.data; const a0 = accounts[0].accountNumber;
    document.getElementById('recentTxn').innerHTML = t.length ? `<table class="w-full text-left whitespace-nowrap"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase">Date</th><th class="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase">Description</th><th class="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Amount</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${t.map(x => { const s = x.fromAccount === a0; return `<tr class="hover:bg-surface-container-low transition-colors"><td class="py-4 px-6 text-sm text-on-surface-variant">${fmtD(x.date)}</td><td class="py-4 px-6"><div class="text-sm font-semibold text-on-surface">${s ? 'Transfer to ' + escapeHTML(x.toAccount) : 'Transfer from ' + escapeHTML(x.fromAccount)}</div></td><td class="py-4 px-6 text-sm font-semibold text-right ${s ? 'text-error' : 'text-surface-tint'}">${s ? '-' : '+'}₹${fmt(x.amount)}</td></tr>`; }).join('')}</tbody></table>` : '<p class="p-6 text-on-surface-variant">No transactions yet.</p>';
  } catch (e) { }
}

/* Admin Dash */
async function pgAdminDash() {
  document.getElementById('app').innerHTML = shell('dashboard', `<div class="grid grid-cols-2 gap-6 mb-8">${skelCard.repeat(2)}</div>`);
  try {
    const [a, r] = await Promise.all([api('/admin/accounts/all'), api('/reports/total-balance')]); const accs = a.data, tot = r.data.totalBalance;
    document.querySelector('.max-w-\\[1100px\\]').innerHTML = `<h1 class="text-3xl font-display font-bold text-primary mb-8">Admin Dashboard</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 card-lift"><p class="text-xs font-semibold text-on-surface-variant uppercase mb-2">Total Accounts</p><p class="text-3xl font-bold text-primary">${accs.length}</p></div>
    <div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 card-lift"><p class="text-xs font-semibold text-on-surface-variant uppercase mb-2">Total Balance</p><p class="text-3xl font-bold text-surface-tint">₹${fmt(tot)}</p></div>
    <div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 card-lift hidden lg:block"><canvas id="adminChart" class="max-h-24"></canvas></div>
  </div>
  <div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-x-auto w-full"><table class="w-full text-left whitespace-nowrap"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Account</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Type</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Name</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Balance</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${accs.slice(0,5).map(a => `<tr class="hover:bg-surface-container-low"><td class="py-3 px-6 text-sm font-semibold">${escapeHTML(a.accountNumber)}</td><td class="py-3 px-6 text-sm">${escapeHTML(a.accountType)}</td><td class="py-3 px-6 text-sm">${escapeHTML(a.name)}</td><td class="py-3 px-6 text-sm text-right text-surface-tint font-semibold">₹${fmt(a.balance)}</td></tr>`).join('')}</tbody></table><div class="p-4 border-t border-outline-variant text-center"><a href="#allaccounts" class="text-primary text-xs font-semibold hover:underline">View All Accounts</a></div></div>`;
  if(window.Chart && document.getElementById('adminChart')){
    new Chart(document.getElementById('adminChart'), { type:'doughnut', data:{labels:['Savings','Current','Premium'],datasets:[{data:[60,25,15],backgroundColor:['#003567','#255fa3','#94beff']}]}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}} });
  }
  } catch (e) { toast(e.message, 'error'); }
}

/* Accounts */
async function pgAccounts() {
  if (!(await loadUser())) return;
  document.getElementById('app').innerHTML = shell('accounts', `<div class="p-4">${skelCard.repeat(2)}</div>`);
  await loadAccounts();
  const rows = accounts.map(a => `<div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 mb-4 card-lift"><div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4"><div><p class="text-xs font-semibold text-on-surface-variant uppercase">${escapeHTML(a.accountType)} Account</p><div class="flex items-center gap-2 mt-1"><p class="font-mono text-sm text-on-surface-variant">${escapeHTML(a.accountNumber)}</p><button onclick="copyText('${a.accountNumber}')" class="text-primary hover:text-primary-container"><span class="material-symbols-outlined text-[14px]">content_copy</span></button></div></div><p class="text-2xl font-bold text-surface-tint">₹${fmt(a.balance)}</p></div><div class="mt-4 pt-4 border-t border-outline-variant/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div><span class="text-on-surface-variant">Holder:</span> <strong>${escapeHTML(a.name)}</strong></div><div><span class="text-on-surface-variant">Branch:</span> WORLD BANK MAIN</div></div></div>`).join('');
  document.getElementById('app').innerHTML = shell('accounts', `<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4"><h1 class="text-3xl font-display font-bold text-primary">My Accounts</h1><button onclick="showCreateAccount()" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm">+ New Account</button></div>${rows || '<p class="text-on-surface-variant">No accounts.</p>'}`);
}
function showCreateAccount() {
  const o = document.createElement('div'); o.className = 'overlay'; o.onclick = e => { if (e.target === o) o.remove(); };
  o.innerHTML = `<div class="bg-surface-container-lowest rounded-xl p-8 w-full max-w-md border-t-4 border-primary shadow-2xl"><h3 class="text-xl font-display font-bold text-primary mb-6">Open New Account</h3><form id="cf" class="space-y-5"><div><label class="block text-xs font-semibold mb-2">Account Name</label><input class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary" id="cName" required maxlength="50" pattern="[A-Za-z ]+"/></div><div><label class="block text-xs font-semibold mb-2">Type</label><select id="cType" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm"><option value="SAVINGS">Savings</option><option value="CURRENT">Current</option><option value="PREMIUM">Premium</option></select></div><div class="flex justify-end gap-3 pt-4 border-t border-outline-variant"><button type="button" class="px-5 py-2 border border-outline text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container shadow-sm">Create</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('cf').onsubmit = async e => { e.preventDefault(); try { const r = await api('/accounts/create', { method: 'POST', body: JSON.stringify({ name: document.getElementById('cName').value.trim(), accountType: document.getElementById('cType').value }) }); toast('Account ' + r.data.accountNumber + ' created!', 'success'); o.remove(); accounts = []; pgAccounts(); } catch (err) { toast(err.message, 'error'); } };
}

/* Cards */
async function pgCards() {
  if (!(await loadUser())) return;
  document.getElementById('app').innerHTML = shell('cards', `<div class="p-4">${skelRow.repeat(4)}</div>`);
  await loadAccounts(); await loadCards();
  const rows = cards.length ? `<table class="w-full text-left whitespace-nowrap"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Card</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Type</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Expiry</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Status</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Action</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${cards.map(c => `<tr class="hover:bg-surface-container-low"><td class="py-3 px-6 text-sm font-semibold">${escapeHTML(c.maskedNumber)}</td><td class="py-3 px-6 text-sm">${escapeHTML(c.cardType)}</td><td class="py-3 px-6 text-sm">${escapeHTML(c.expiryDate)}</td><td class="py-3 px-6 text-sm"><span class="px-2 py-1 rounded-full text-[10px] font-bold ${c.status==='ACTIVE'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}">${escapeHTML(c.status)}</span></td><td class="py-3 px-6">${c.status === 'ACTIVE' ? `<button class="px-4 py-1.5 bg-error text-white rounded text-xs font-semibold hover:bg-red-800 transition-colors" onclick="blockCard(${c.id})">Block</button>` : `<button class="px-4 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container transition-colors" onclick="activateCard(${c.id})">Activate</button>`}</td></tr>`).join('')}</tbody></table>` : '<p class="p-6 text-on-surface-variant">No cards linked.</p>';
  document.getElementById('app').innerHTML = shell('cards', `<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4"><h1 class="text-3xl font-display font-bold text-primary">Cards</h1><button onclick="showIssueCard()" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm">+ Apply for Card</button></div><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-x-auto w-full">${rows}</div>`);
}
function showIssueCard() {
  if (!accounts.length) { toast('Create an account first', 'error'); return; }
  const o = document.createElement('div'); o.className = 'overlay'; o.onclick = e => { if (e.target === o) o.remove(); };
  o.innerHTML = `<div class="bg-surface-container-lowest rounded-xl p-8 w-full max-w-md border-t-4 border-primary shadow-2xl"><h3 class="text-xl font-display font-bold text-primary mb-6">Apply for Card</h3><form id="icf" class="space-y-5"><div><label class="block text-xs font-semibold mb-2">Card Type</label><select id="icType" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm"><option value="CREDIT">Credit</option><option value="DEBIT">Debit</option></select></div><div><label class="block text-xs font-semibold mb-2">Link to Account</label><select id="icAcc" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm">${accounts.map(a => `<option value="${a.id}">${escapeHTML(a.accountNumber)}</option>`).join('')}</select></div><div class="flex justify-end gap-3 pt-4 border-t border-outline-variant"><button type="button" class="px-5 py-2 border border-outline text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-container">Issue</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('icf').onsubmit = async e => { e.preventDefault(); try { await api('/cards/issue', { method: 'POST', body: JSON.stringify({ cardType: document.getElementById('icType').value, accountId: parseInt(document.getElementById('icAcc').value) }) }); toast('Card issued!', 'success'); o.remove(); cards = []; pgCards(); } catch (err) { toast(err.message, 'error'); } };
}
async function blockCard(id) { if(confirm('Are you sure you want to block this card?')){ try { await api('/cards/block/' + id, { method: 'POST' }); toast('Card blocked', 'success'); cards = []; pgCards(); } catch (e) { toast(e.message, 'error'); } } }
async function activateCard(id) { try { await api('/cards/activate/' + id, { method: 'POST' }); toast('Card activated', 'success'); cards = []; pgCards(); } catch (e) { toast(e.message, 'error'); } }

/* Deposit/Withdraw */
function showModal(type) {
  if (!accounts.length) { toast('No accounts', 'error'); return; }
  const t = type === 'deposit' ? 'Deposit' : 'Withdraw';
  const o = document.createElement('div'); o.className = 'overlay'; o.onclick = e => { if (e.target === o) o.remove(); };
  o.innerHTML = `<div class="bg-surface-container-lowest rounded-xl p-8 w-full max-w-md border-t-4 border-${type === 'deposit' ? 'primary' : 'error'} shadow-2xl"><h3 class="text-xl font-display font-bold text-${type === 'deposit' ? 'primary' : 'error'} mb-6">${t} Funds</h3><form id="mf" class="space-y-5"><div><label class="block text-xs font-semibold mb-2">Account</label><select id="mAcc" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm">${accounts.map(a => `<option value="${escapeHTML(a.accountNumber)}">${escapeHTML(a.accountNumber)} — ₹${fmt(a.balance)}</option>`).join('')}</select></div><div><label class="block text-xs font-semibold mb-2">Amount (₹)</label><input type="number" id="mAmt" min="1" step="0.01" max="1000000" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm" required/></div><div class="flex justify-end gap-3 pt-4 border-t border-outline-variant"><button type="button" class="px-5 py-2 border border-outline text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="px-5 py-2 bg-${type === 'deposit' ? 'primary' : 'secondary'} text-white rounded-lg text-sm font-semibold hover:opacity-90 shadow-sm">Confirm</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('mf').onsubmit = async e => {
    e.preventDefault(); const acc = document.getElementById('mAcc').value, amt = document.getElementById('mAmt').value;
    if(amt<=0){ toast('Amount must be positive','error'); return; }
    try { await api('/accounts/' + type + '?accountNumber=' + encodeURIComponent(acc) + '&amount=' + encodeURIComponent(amt), { method: 'POST', headers: { 'Idempotency-Key': uuid(), 'Content-Type': 'application/json' } }); toast(t + ' successful!', 'success'); o.remove(); accounts = []; pgDash(); } catch (err) { toast(err.message, 'error'); }
  };
}

/* Transfer */
async function pgTransfer() {
  if (!(await loadUser())) return; await loadAccounts(); if (!accounts.length) { nav('accounts'); return; }
  document.getElementById('app').innerHTML = shell('transfer', `<h1 class="text-3xl font-display font-bold text-primary mb-8">Fund Transfer</h1>
  <div class="bg-surface-container-lowest rounded-xl p-8 shadow-soft border border-outline-variant/30 max-w-lg card-lift"><form id="tf" class="space-y-5">
    <div><label class="block text-xs font-semibold mb-2">From Account</label><select id="tFrom" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm">${accounts.map(a => `<option value="${escapeHTML(a.accountNumber)}">${escapeHTML(a.accountNumber)} — ₹${fmt(a.balance)}</option>`).join('')}</select></div>
    <div><label class="block text-xs font-semibold mb-2">Beneficiary A/C No.</label><input type="text" id="tTo" pattern="[A-Z0-9]+" maxlength="20" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm uppercase" placeholder="e.g. ACC123456" required/></div>
    <div><label class="block text-xs font-semibold mb-2">Amount (₹)</label><input type="number" id="tAmt" min="1" step="0.01" max="500000" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm" placeholder="Max ₹5,00,000" required/></div>
    <button type="submit" class="w-full py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container shadow-sm transition-colors">Initiate Transfer</button>
  </form></div>`);
  document.getElementById('tf').onsubmit = async e => { 
    e.preventDefault(); 
    const amt = parseFloat(document.getElementById('tAmt').value);
    if(amt<=0){ toast('Invalid amount','error'); return; }
    try { await api('/accounts/transfer', { method: 'POST', body: JSON.stringify({ fromAcc: document.getElementById('tFrom').value, toAcc: document.getElementById('tTo').value.trim(), amount: amt, requestId: uuid() }) }); toast('Transfer successful!', 'success'); accounts = []; nav('history'); } catch (err) { toast(err.message, 'error'); } 
  };
}

/* History */
let histData=[], histPage=1, histPerPage=10;
async function pgHistory() {
  if (!(await loadUser())) return; await loadAccounts(); if (!accounts.length) { nav('dashboard'); return; }
  document.getElementById('app').innerHTML = shell('history', `<div class="p-4">${skelRow.repeat(6)}</div>`);
  try {
    const all = []; for (const a of accounts) { const r = await api('/transaction/history/' + a.accountNumber + '?size=100'); all.push(...r.data.map(t => ({ ...t, myAcc: a.accountNumber }))); } all.sort((a, b) => new Date(b.date) - new Date(a.date));
    histData = all; histPage = 1;
    renderHistPage();
  } catch (e) { toast(e.message, 'error'); }
}
window.nextH = ()=>{ if(histPage * histPerPage < histData.length) { histPage++; renderHistPage(); } };
window.prevH = ()=>{ if(histPage > 1) { histPage--; renderHistPage(); } };
function renderHistPage() {
  const start = (histPage - 1) * histPerPage;
  const pageData = histData.slice(start, start + histPerPage);
  const totalPages = Math.ceil(histData.length / histPerPage) || 1;
  const rows = pageData.map(t => { const s = accounts.some(a => a.accountNumber === t.fromAccount); return `<tr class="hover:bg-surface-container-low"><td class="py-3 px-6 text-sm text-on-surface-variant">${fmtD(t.date)}</td><td class="py-3 px-6 text-sm font-semibold text-on-surface">${s ? 'TRF TO ' + escapeHTML(t.toAccount) : 'TRF FROM ' + escapeHTML(t.fromAccount)}</td><td class="py-3 px-6 text-sm text-right text-surface-tint font-semibold">${!s ? '₹' + fmt(t.amount) : ''}</td><td class="py-3 px-6 text-sm text-right text-error font-semibold">${s ? '₹' + fmt(t.amount) : ''}</td></tr>`; }).join('');
  
  document.querySelector('.max-w-\\[1100px\\]').innerHTML = `<h1 class="text-3xl font-display font-bold text-primary mb-8">Account Statement</h1><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden">
    <div class="w-full overflow-x-auto">${histData.length ? `<table class="w-full text-left whitespace-nowrap"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Date</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Details</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Credit</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Debit</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${rows}</tbody></table>` : '<p class="p-6 text-on-surface-variant">No transactions.</p>'}</div>
    ${histData.length > histPerPage ? `<div class="flex items-center justify-between p-4 border-t border-outline-variant bg-surface-container-lowest"><span class="text-xs text-on-surface-variant font-semibold">Page ${histPage} of ${totalPages}</span><div class="flex gap-2"><button onclick="prevH()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" ${histPage===1?'disabled':''}>Prev</button><button onclick="nextH()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" ${histPage===totalPages?'disabled':''}>Next</button></div></div>` : ''}
  </div>`;
}

/* Admin */
let adminAccs=[], adminPage=1, adminPerPage=15;
async function pgAllAccounts() {
  if (!(await loadUser())) return;
  document.getElementById('app').innerHTML = shell('allaccounts', `<div class="p-4">${skelRow.repeat(5)}</div>`);
  try {
    const r = await api('/admin/accounts/all');
    adminAccs = r.data; adminPage = 1;
    renderAdminAccs();
  } catch (e) { toast(e.message, 'error'); }
}
window.nextA = ()=>{ if(adminPage * adminPerPage < adminAccs.length) { adminPage++; renderAdminAccs(); } };
window.prevA = ()=>{ if(adminPage > 1) { adminPage--; renderAdminAccs(); } };
window.filterA = (val) => {
  const q = val.toLowerCase();
  const rows = document.querySelectorAll('#admBody tr');
  rows.forEach(r => { r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none'; });
};
function renderAdminAccs() {
  const start = (adminPage - 1) * adminPerPage;
  const pageData = adminAccs.slice(start, start + adminPerPage);
  const totalPages = Math.ceil(adminAccs.length / adminPerPage) || 1;
  const rows = pageData.map(a => `<tr><td class="py-3 px-6 text-sm font-semibold">${escapeHTML(a.accountNumber)}</td><td class="py-3 px-6 text-sm">${escapeHTML(a.accountType)}</td><td class="py-3 px-6 text-sm">${escapeHTML(a.name)}</td><td class="py-3 px-6 text-sm text-right text-surface-tint font-semibold">₹${fmt(a.balance)}</td><td class="py-3 px-6 text-center"><button class="px-3 py-1 bg-error text-white rounded text-[10px] font-bold uppercase hover:bg-red-800 transition-colors" onclick="delAcc('${a.accountNumber}')">Close</button></td></tr>`).join('');
  
  document.querySelector('.max-w-\\[1100px\\]').innerHTML = `<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4"><h1 class="text-3xl font-display font-bold text-primary">All Accounts</h1><input type="text" placeholder="Search accounts..." onkeyup="filterA(this.value)" class="px-4 py-2 border border-outline-variant rounded bg-surface text-sm max-w-xs focus:border-primary"/></div><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden"><div class="w-full overflow-x-auto"><table class="w-full text-left whitespace-nowrap"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">A/C No.</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Type</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Name</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Balance</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-center">Action</th></tr></thead><tbody id="admBody" class="divide-y divide-outline-variant/50">${rows}</tbody></table></div>
  ${adminAccs.length > adminPerPage ? `<div class="flex items-center justify-between p-4 border-t border-outline-variant bg-surface-container-lowest"><span class="text-xs text-on-surface-variant font-semibold">Page ${adminPage} of ${totalPages}</span><div class="flex gap-2"><button onclick="prevA()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" ${adminPage===1?'disabled':''}>Prev</button><button onclick="nextA()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" ${adminPage===totalPages?'disabled':''}>Next</button></div></div>` : ''}
  </div>`;
}

async function delAcc(n) { if (!confirm('DANGER: Close account ' + n + '? This action cannot be undone.')) return; try { await api('/admin/accounts/delete/' + encodeURIComponent(n), { method: 'DELETE' }); toast('Account closed', 'success'); pgAllAccounts(); } catch (e) { toast(e.message, 'error'); } }

let auditLog=[], auditPage=1, auditPerPage=15;
async function pgAudit() {
  if (!(await loadUser())) return;
  document.getElementById('app').innerHTML = shell('audit', `<div class="p-4">${skelRow.repeat(5)}</div>`);
  try {
    const r = await api('/audit');
    auditLog = r.data.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); auditPage = 1;
    renderAudit();
  } catch (e) { toast(e.message, 'error'); }
}
window.nextAu = ()=>{ if(auditPage * auditPerPage < auditLog.length) { auditPage++; renderAudit(); } };
window.prevAu = ()=>{ if(auditPage > 1) { auditPage--; renderAudit(); } };
function renderAudit() {
  const start = (auditPage - 1) * auditPerPage;
  const pageData = auditLog.slice(start, start + auditPerPage);
  const totalPages = Math.ceil(auditLog.length / auditPerPage) || 1;
  const rows = pageData.map(l => `<tr class="hover:bg-surface-container-low"><td class="py-3 px-6 text-sm text-on-surface-variant">${fmtD(l.timestamp)}</td><td class="py-3 px-6 text-sm font-semibold">${escapeHTML(l.action)}</td><td class="py-3 px-6 text-sm">${escapeHTML(l.entity)} <span class="text-xs text-on-surface-variant">(${escapeHTML(l.entityId || 'N/A')})</span></td><td class="py-3 px-6 text-sm">${escapeHTML(l.performedBy)}</td></tr>`).join('');
  
  document.querySelector('.max-w-\\[1100px\\]').innerHTML = `<h1 class="text-3xl font-display font-bold text-primary mb-8">Audit Logs</h1><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden"><div class="w-full overflow-x-auto"><table class="w-full text-left whitespace-nowrap"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Time</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Action</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Entity</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">User</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${rows}</tbody></table></div>
  ${auditLog.length > auditPerPage ? `<div class="flex items-center justify-between p-4 border-t border-outline-variant bg-surface-container-lowest"><span class="text-xs text-on-surface-variant font-semibold">Page ${auditPage} of ${totalPages}</span><div class="flex gap-2"><button onclick="prevAu()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" ${auditPage===1?'disabled':''}>Prev</button><button onclick="nextAu()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" ${auditPage===totalPages?'disabled':''}>Next</button></div></div>` : ''}
  </div>`;
}

async function pgReports() {
  if (!(await loadUser())) return;
  document.getElementById('app').innerHTML = shell('reports', `<div class="grid grid-cols-2 lg:grid-cols-4 gap-6">${skelCard.repeat(4)}</div>`);
  try {
    const [rr, ar, tv, ac] = await Promise.all([api('/reports/total-balance'), api('/admin/accounts/all'), api('/reports/transaction-volume'), api('/reports/active-accounts')]); const tot = rr.data.totalBalance, accs = ar.data, vol = tv.data.totalVolume, active = ac.data.activeAccounts;
    document.querySelector('.max-w-\\[1100px\\]').innerHTML = `<h1 class="text-3xl font-display font-bold text-primary mb-8">Reports</h1>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">${[['Total Deposits', '₹' + fmt(tot), 'primary'], ['Txn Volume', '₹' + fmt(vol), 'surface-tint'], ['Active Accounts', active, 'primary'], ['Avg Balance', '₹' + (accs.length ? fmt(tot / accs.length) : '0'), 'surface-tint']].map(([l, v, c]) => `<div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 card-lift"><p class="text-xs font-semibold text-on-surface-variant uppercase mb-2">${l}</p><p class="text-2xl font-bold text-${c}">${v}</p></div>`).join('')}</div>
  <div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 max-w-2xl"><h3 class="text-xl font-display font-semibold text-primary mb-4">Export Reports</h3><div class="flex gap-4"><button class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container shadow-sm flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">download</span> PDF Report</button><button class="px-5 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary-fixed/20 flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">table</span> CSV Export</button></div></div>`;
  } catch (e) { toast(e.message, 'error'); }
}
