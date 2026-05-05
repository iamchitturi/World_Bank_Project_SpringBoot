const API='/api/v1';
let user=null,accounts=[],cards=[];
let inactivityTimer = null;
let isTimedOut = false;

function resetTimer() {
  clearTimeout(inactivityTimer);
  if(user && !isTimedOut) {
    // 2 minutes of inactivity marks session as timed out
    inactivityTimer = setTimeout(() => {
      isTimedOut = true;
      navigator.sendBeacon(API+'/auth/logout');
      user = null; // Mark locally so next action triggers re-auth
    }, 120000); 
  }
}

// Listen for interactions to reset the inactivity timer
document.addEventListener('mousemove', () => { if(user && !isTimedOut) resetTimer(); });
document.addEventListener('keypress', () => { if(user && !isTimedOut) resetTimer(); });
document.addEventListener('click', () => { if(user && !isTimedOut) resetTimer(); });

// Bank Security: Force logout and session destruction on browser reload/close
window.addEventListener('beforeunload', () => {
  if (user) navigator.sendBeacon(API+'/auth/logout');
});

async function api(p,o={}){
  if (isTimedOut && p !== '/auth/login' && p !== '/auth/register') {
    toast('Session timed out due to inactivity. Please log in again.', 'error');
    logoutLocally();
    throw new Error('Session timed out');
  }
  const h={'Content-Type':'application/json'};
  const r=await fetch(API+p,{...o,headers:h, credentials: 'include'});
  const d=await r.json();
  if(!r.ok) {
    if (r.status === 401 || r.status === 403) {
      toast('Session expired. Please log in again.', 'error');
      logoutLocally();
    }
    throw new Error(d.message||'Error');
  }
  return d;
}

function toast(m,t='info'){const e=document.createElement('div');e.className='toast toast-'+(t==='success'?'ok':t==='error'?'err':'info');e.textContent=m;document.getElementById('toasts').appendChild(e);setTimeout(()=>e.remove(),3000);}
function nav(h){window.location.hash=h;}
function fmt(n){return parseFloat(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtD(d){if(!d)return'-';const dt=new Date(d);return dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+dt.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}

window.addEventListener('hashchange',route);

window.addEventListener('load',()=>{
  // Bank security: Force landing page on reload
  nav('landing'); 
  route();
});

function route(){
  const h=window.location.hash.slice(1)||'landing';
  const R={landing:pgLanding,login:pgLogin,register:pgRegister,dashboard:pgDash,accounts:pgAccounts,cards:pgCards,transfer:pgTransfer,history:pgHistory,allaccounts:pgAllAccounts,audit:pgAudit,reports:pgReports};
  (R[h]||pgLanding)();
}

async function logout(){
  try { await navigator.sendBeacon(API+'/auth/logout'); } catch(e){}
  logoutLocally();
}

function logoutLocally() {
  user=null;accounts=[];cards=[];
  clearTimeout(inactivityTimer);
  isTimedOut = false; // Reset timeout state
  nav('login');
}

async function loadUser(){
  if(!user){
    try{user=(await api('/auth/me')).data; isTimedOut=false; resetTimer();}
    catch{nav('login'); return false;}
  }
  return true;
}
async function loadAccounts(){try{accounts=(await api('/accounts/my')).data;}catch{accounts=[];}}
async function loadCards(){try{cards=(await api('/cards/my')).data;}catch{cards=[];}}

// LANDING PAGE
function pgLanding() {
  document.getElementById('app').innerHTML = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; background: url('https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=1920&q=80') center/cover; position: relative;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(3,3,3,0.4) 0%, var(--bg-color) 100%); z-index: 0;"></div>
      <div style="z-index: 1; max-width: 800px; animation: slideUpFade 1s forwards;">
        <div style="font-size: 72px; margin-bottom: 20px; filter: drop-shadow(0 10px 20px rgba(94, 106, 210, 0.4));">🏦</div>
        <h1 style="font-size: 64px; font-weight: 800; margin-bottom: 24px; letter-spacing: -2px;" class="text-gradient">Welcome to World Bank</h1>
        <p style="font-size: 20px; color: var(--text-muted); margin-bottom: 48px; line-height: 1.6;">Experience the future of enterprise banking. Secure, blazing fast, and designed for professionals.</p>
        <div style="display: flex; gap: 24px; justify-content: center;">
          <button class="btn btn-primary" style="font-size: 18px; padding: 16px 40px;" onclick="nav('login')">Access Account</button>
          <button class="btn btn-ghost" style="font-size: 18px; padding: 16px 40px;" onclick="nav('register')">Open Account</button>
        </div>
      </div>
    </div>
  `;
}

// CAPTCHA helper
function genCaptcha() {
  const n1 = Math.floor(Math.random() * 10) + 1;
  const n2 = Math.floor(Math.random() * 10) + 1;
  return { q: `What is ${n1} + ${n2}?`, a: n1 + n2 };
}

// AUTH
function pgLogin(){
  const captcha = genCaptcha();
  document.getElementById('app').innerHTML=`<div class="auth-bg"><div class="auth-card glass"><div class="auth-brand"><div class="icon">🏦</div><h1>World Bank</h1><p>Secure Portal Login</p></div><form id="f"><div class="field"><label>Email</label><input type="email" id="em" placeholder="admin@bank.com" required></div><div class="field"><label>Password</label><input type="password" id="pw" placeholder="••••••••" required></div><div class="field"><label>Security Verification: ${captcha.q}</label><input type="number" id="cap" required></div><button type="submit" class="btn btn-primary" style="width:100%">Sign In</button></form><div class="auth-footer">Don't have an account? <a href="#register">Register</a></div></div></div>`;
  document.getElementById('f').onsubmit=async e=>{
    e.preventDefault();
    if(parseInt(document.getElementById('cap').value) !== captcha.a) { toast('Invalid security verification', 'error'); return; }
    try{await api('/auth/login',{method:'POST',body:JSON.stringify({email:document.getElementById('em').value,password:document.getElementById('pw').value})});user=null;toast('Login successful','success');nav('dashboard');}catch(err){toast(err.message,'error');}
  };
}

function pgRegister(){
  const captcha = genCaptcha();
  document.getElementById('app').innerHTML=`<div class="auth-bg"><div class="auth-card glass"><div class="auth-brand"><div class="icon">🏦</div><h1>World Bank</h1><p>Create your account</p></div><form id="f"><div class="field"><label>Full Name</label><input type="text" id="nm" required></div><div class="field"><label>Email</label><input type="email" id="em" required></div><div class="field"><label>Password</label><input type="password" id="pw" required></div><div class="field"><label>Security Verification: ${captcha.q}</label><input type="number" id="cap" required></div><button type="submit" class="btn btn-primary" style="width:100%">Register</button></form><div class="auth-footer">Already have an account? <a href="#login">Sign In</a></div></div></div>`;
  document.getElementById('f').onsubmit=async e=>{
    e.preventDefault();
    if(parseInt(document.getElementById('cap').value) !== captcha.a) { toast('Invalid security verification', 'error'); return; }
    try{await api('/auth/register',{method:'POST',body:JSON.stringify({name:document.getElementById('nm').value,email:document.getElementById('em').value,password:document.getElementById('pw').value})});toast('Registration successful!','success');nav('login');}catch(err){toast(err.message,'error');}
  };
}

// SHELL
function shell(pg,c){
  const isA=user&&user.role==='ADMIN';
  return`<div class="shell"><aside class="side"><div class="side-brand"><div class="icon">🏦</div><span>World Bank</span></div><nav class="side-nav"><div class="nav-label">Main</div><a class="nav-btn ${pg==='dashboard'?'on':''}" href="#dashboard"><span class="ico">📊</span>Dashboard</a>${!isA?`<a class="nav-btn ${pg==='accounts'?'on':''}" href="#accounts"><span class="ico">🏦</span>My Accounts</a><a class="nav-btn ${pg==='cards'?'on':''}" href="#cards"><span class="ico">💳</span>Cards</a><a class="nav-btn ${pg==='transfer'?'on':''}" href="#transfer"><span class="ico">💸</span>Transfer</a><a class="nav-btn ${pg==='history'?'on':''}" href="#history"><span class="ico">📋</span>Transactions</a>`:`<div class="nav-label">Administration</div><a class="nav-btn ${pg==='allaccounts'?'on':''}" href="#allaccounts"><span class="ico">👥</span>All Accounts</a><a class="nav-btn ${pg==='audit'?'on':''}" href="#audit"><span class="ico">🔍</span>Audit Logs</a><a class="nav-btn ${pg==='reports'?'on':''}" href="#reports"><span class="ico">📈</span>Reports</a>`}</nav><div class="side-foot"><div class="user-pill"><div class="avatar">${(user?.name||'?')[0].toUpperCase()}</div><div class="info"><div class="nm">${user?.name||''}</div><div class="rl">${user?.role||''}</div></div></div><button class="nav-btn" onclick="logout()" style="margin-top:6px;color:var(--danger)"><span class="ico">🚪</span>Logout</button></div></aside><main class="main">${c}</main></div>`;
}

// DASHBOARD
async function pgDash(){
  if(!(await loadUser()))return;
  if(user.role==='ADMIN') return pgAdminDash();
  document.getElementById('app').innerHTML=shell('dashboard','<div class="loader"><div class="spin"></div></div>');
  await loadAccounts();await loadCards();
  const total=accounts.reduce((s,a)=>s+parseFloat(a.balance||0),0);
  const primary=accounts[0];
  let heroHtml='';
  if(primary){heroHtml=`<div class="hero"><span class="badge type-${primary.accountType} acc-type">${primary.accountType}</span><div class="acc-num">${primary.accountNumber}</div><div class="bal-label">Available Balance</div><div class="bal"><span class="cur">₹</span>${fmt(primary.balance)}</div></div>`;}
  else{heroHtml=`<div class="hero"><div class="bal-label">No accounts yet</div><div class="bal" style="font-size:20px">Create your first account to get started</div></div>`;}
  const cardsHtml=cards.length?`<div class="cards-row">${cards.map(c=>`<div class="v-card ${c.cardType.toLowerCase()} ${c.status==='BLOCKED'?'blocked':''}"><div class="c-type">${c.cardType} Card</div><span class="c-status badge ${c.status}">${c.status}</span><div class="c-num">${c.maskedNumber||'**** **** **** ????'}</div><div class="c-bottom"><div><div class="c-name">${c.cardholderName}</div></div><div class="c-exp">${c.expiryDate}</div></div></div>`).join('')}</div>`:'';
  document.querySelector('.main').innerHTML=`<div class="pg-hdr"><div><h2>Welcome, ${user.name}</h2><p>Manage your finances securely</p></div></div>${heroHtml}${cardsHtml}<div class="actions-grid"><div class="act glass" onclick="showModal('deposit')"><div class="act-ico dot-green">💰</div><div class="act-lbl">Deposit</div></div><div class="act glass" onclick="showModal('withdraw')"><div class="act-ico dot-rose">💸</div><div class="act-lbl">Withdraw</div></div><div class="act glass" onclick="nav('transfer')"><div class="act-ico dot-blue">🔄</div><div class="act-lbl">Transfer</div></div><div class="act glass" onclick="nav('accounts')"><div class="act-ico dot-violet">➕</div><div class="act-lbl">New Account</div></div></div><div id="recentTxn"></div>`;
  loadRecent();
}

async function loadRecent(){
  if(!accounts.length)return;
  try{
    const r=await api('/transaction/history/'+accounts[0].accountNumber+'?size=5');
    const t=r.data;
    const acc0=accounts[0].accountNumber;
    document.getElementById('recentTxn').innerHTML=`<div class="card-panel glass"><div class="card-panel-hdr"><h3>Recent Transactions</h3><a href="#history" class="btn btn-ghost btn-sm">View All</a></div>${t.length?`<table class="tbl"><thead><tr><th>Type</th><th>Account</th><th>Amount</th><th>Date</th></tr></thead><tbody>${t.map(x=>{const s=x.fromAccount===acc0;return`<tr><td><span class="${s?'b-debit':'b-credit'}">${s?'↑ Sent':'↓ Received'}</span></td><td>${s?x.toAccount:x.fromAccount}</td><td class="${s?'amt-neg':'amt-pos'}">${s?'-':'+'}₹${fmt(x.amount)}</td><td style="color:var(--text-muted)">${fmtD(x.date)}</td></tr>`;}).join('')}</tbody></table>`:'<div class="empty"><p>No transactions yet</p></div>'}</div>`;
  }catch(e){}
}

// ADMIN DASH
async function pgAdminDash(){
  document.getElementById('app').innerHTML=shell('dashboard','<div class="loader"><div class="spin"></div></div>');
  try{
    const[a,r]=await Promise.all([api('/admin/accounts/all'),api('/reports/total-balance')]);
    const accs=a.data,tot=r.data.totalBalance;
    document.querySelector('.main').innerHTML=`<div class="pg-hdr"><div><h2>Admin Dashboard</h2><p>System overview</p></div></div><div class="stats"><div class="stat glass"><div class="dot dot-blue">👥</div><div class="lbl">Total Accounts</div><div class="val">${accs.length}</div></div><div class="stat glass"><div class="dot dot-gold">💰</div><div class="lbl">Total Balance</div><div class="val">₹${fmt(tot)}</div></div><div class="stat glass"><div class="dot dot-green">📊</div><div class="lbl">Avg Balance</div><div class="val">₹${accs.length?fmt(tot/accs.length):'0'}</div></div></div><div class="card-panel glass"><div class="card-panel-hdr"><h3>All Accounts</h3></div><table class="tbl"><thead><tr><th>Account</th><th>Type</th><th>Name</th><th>User</th><th>Balance</th></tr></thead><tbody>${accs.map(a=>`<tr><td><strong>${a.accountNumber}</strong></td><td><span class="badge type-${a.accountType}">${a.accountType}</span></td><td>${a.name}</td><td>#${a.userId}</td><td class="amt-pos">₹${fmt(a.balance)}</td></tr>`).join('')}</tbody></table></div>`;
  }catch(e){toast(e.message,'error');}
}

// MY ACCOUNTS
async function pgAccounts(){
  if(!(await loadUser()))return;await loadAccounts();
  document.getElementById('app').innerHTML=shell('accounts',`<div class="pg-hdr"><div><h2>My Accounts</h2><p>${accounts.length} active accounts</p></div><div class="actions"><button class="btn btn-primary" onclick="showCreateAccount()">+ New Account</button></div></div>${accounts.length?`<div class="actions-grid">${accounts.map(a=>`<div class="act glass"><div class="acc-card-top" style="margin-bottom:12px"><span class="badge type-${a.accountType}">${a.accountType}</span></div><div class="val" style="font-size:24px;font-weight:bold;margin-bottom:8px">₹${fmt(a.balance)}</div><div class="acc-card-num" style="font-family:monospace;color:var(--text-muted)">${a.accountNumber}</div><div class="acc-card-name" style="margin-top:8px">${a.name}</div></div>`).join('')}</div>`:'<div class="empty glass"><div class="icon" style="font-size:40px;margin-bottom:10px">🏦</div><p>No accounts yet. Create your first one!</p></div>'}`);
}

function showCreateAccount(){
  const o=document.createElement('div');o.className='overlay';o.onclick=e=>{if(e.target===o)o.remove();};
  o.innerHTML=`<div class="modal"><h3>Create New Account</h3><form id="cf"><div class="field"><label>Account Name</label><input type="text" id="cName" placeholder="My Savings" required></div><div class="field"><label>Account Type</label><select id="cType"><option value="SAVINGS">💰 Savings Account</option><option value="PREMIUM">⭐ Premium Account</option><option value="CURRENT">🏢 Current Account</option></select></div><div class="modal-btns"><button type="button" class="btn btn-ghost" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary" style="width:auto">Create</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('cf').onsubmit=async e=>{e.preventDefault();try{const r=await api('/accounts/create',{method:'POST',body:JSON.stringify({name:document.getElementById('cName').value,accountType:document.getElementById('cType').value})});toast('Account '+r.data.accountNumber+' created!','success');o.remove();accounts=[];pgAccounts();}catch(err){toast(err.message,'error');}};
}

// CARDS
async function pgCards(){
  if(!(await loadUser()))return;await loadAccounts();await loadCards();
  document.getElementById('app').innerHTML=shell('cards',`<div class="pg-hdr"><div><h2>My Cards</h2><p>${cards.length} linked cards</p></div><div class="actions"><button class="btn btn-primary" onclick="showIssueCard()">+ Issue Card</button></div></div>${cards.length?`<div class="cards-row" style="flex-wrap:wrap">${cards.map(c=>`<div class="v-card ${c.cardType.toLowerCase()} ${c.status==='BLOCKED'?'blocked':''}"><div class="c-type">${c.cardType} Card</div><span class="c-status badge type-${c.status}">${c.status}</span><div class="c-num">${c.maskedNumber||'**** ****'}</div><div class="c-bottom"><div><div class="c-name">${c.cardholderName}</div></div><div class="c-exp">${c.expiryDate}</div></div></div>`).join('')}</div><div class="card-panel glass" style="margin-top:16px"><div class="card-panel-hdr"><h3>Card Management</h3></div><table class="tbl"><thead><tr><th>Card</th><th>Type</th><th>Status</th><th>Expiry</th><th>Actions</th></tr></thead><tbody>${cards.map(c=>`<tr><td>${c.maskedNumber}</td><td><span class="badge ${c.cardType==='CREDIT'?'b-credit':'b-debit'}">${c.cardType}</span></td><td><span class="badge" style="background:#333">${c.status}</span></td><td>${c.expiryDate}</td><td>${c.status==='ACTIVE'?`<button class="btn btn-rose btn-sm" onclick="blockCard(${c.id})">Block</button>`:`<button class="btn btn-emerald btn-sm" onclick="activateCard(${c.id})">Activate</button>`}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty glass"><div class="icon" style="font-size:40px;margin-bottom:10px">💳</div><p>No cards yet. Issue your first card!</p></div>'}`);
}

function showIssueCard(){
  if(!accounts.length){toast('Create an account first','error');return;}
  const o=document.createElement('div');o.className='overlay';o.onclick=e=>{if(e.target===o)o.remove();};
  o.innerHTML=`<div class="modal"><h3>Issue New Card</h3><form id="icf"><div class="field"><label>Card Type</label><select id="icType"><option value="DEBIT">💳 Debit Card</option><option value="CREDIT">💎 Credit Card</option></select></div><div class="field"><label>Link to Account</label><select id="icAcc">${accounts.map(a=>`<option value="${a.id}">${a.accountNumber} (${a.accountType})</option>`).join('')}</select></div><div class="modal-btns"><button type="button" class="btn btn-ghost" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="btn btn-primary" style="width:auto">Issue Card</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('icf').onsubmit=async e=>{e.preventDefault();try{await api('/cards/issue',{method:'POST',body:JSON.stringify({cardType:document.getElementById('icType').value,accountId:parseInt(document.getElementById('icAcc').value)})});toast('Card issued!','success');o.remove();cards=[];pgCards();}catch(err){toast(err.message,'error');}};
}

async function blockCard(id){try{await api('/cards/block/'+id,{method:'POST'});toast('Card blocked','success');cards=[];pgCards();}catch(e){toast(e.message,'error');}}
async function activateCard(id){try{await api('/cards/activate/'+id,{method:'POST'});toast('Card activated','success');cards=[];pgCards();}catch(e){toast(e.message,'error');}}

// DEPOSIT/WITHDRAW
function showModal(type){
  if(!accounts.length){toast('No accounts found','error');return;}
  const t=type==='deposit'?'Deposit':'Withdraw';
  const o=document.createElement('div');o.className='overlay';o.onclick=e=>{if(e.target===o)o.remove();};
  o.innerHTML=`<div class="modal"><h3>${t} Funds</h3><form id="mf"><div class="field"><label>Account</label><select id="mAcc">${accounts.map(a=>`<option value="${a.accountNumber}">${a.accountNumber} — ₹${fmt(a.balance)}</option>`).join('')}</select></div><div class="field"><label>Amount (₹)</label><input type="number" id="mAmt" min="1" step="0.01" required></div><div class="modal-btns"><button type="button" class="btn btn-ghost" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="btn ${type==='deposit'?'btn-emerald':'btn-rose'}">${t}</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('mf').onsubmit=async e=>{
    e.preventDefault();
    const acc=document.getElementById('mAcc').value,amt=document.getElementById('mAmt').value;
    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    try{
      await api('/accounts/'+type+'?accountNumber='+acc+'&amount='+amt,{method:'POST', headers: {'Idempotency-Key': uuid, 'Content-Type':'application/json'}});
      toast(t+' of ₹'+amt+' successful!','success');
      o.remove();accounts=[];pgDash();
    }catch(err){toast(err.message,'error');}
  };
}

// TRANSFER
async function pgTransfer(){
  if(!(await loadUser()))return;await loadAccounts();if(!accounts.length){nav('accounts');return;}
  document.getElementById('app').innerHTML=shell('transfer',`<div class="pg-hdr"><div><h2>Transfer Funds</h2><p>Send money instantly</p></div></div><div class="auth-card glass" style="max-width:500px;margin:0;text-align:left"><form id="tf"><div class="field"><label>From Account</label><select id="tFrom">${accounts.map(a=>`<option value="${a.accountNumber}">${a.accountNumber} (${a.accountType}) — ₹${fmt(a.balance)}</option>`).join('')}</select></div><div class="field"><label>To Account Number</label><input type="text" id="tTo" placeholder="e.g. WB4829371056" required></div><div class="field"><label>Amount (₹)</label><input type="number" id="tAmt" min="1" step="0.01" required></div><button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px">Send Money</button></form></div>`);
  document.getElementById('tf').onsubmit=async e=>{
    e.preventDefault();
    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    try{
      await api('/accounts/transfer',{method:'POST',body:JSON.stringify({fromAcc:document.getElementById('tFrom').value,toAcc:document.getElementById('tTo').value,amount:parseFloat(document.getElementById('tAmt').value),requestId:uuid})});
      toast('Transfer successful!','success');
      accounts=[];nav('dashboard');
    }catch(err){toast(err.message,'error');}
  };
}

// HISTORY
async function pgHistory(){
  if(!(await loadUser()))return;await loadAccounts();if(!accounts.length){nav('dashboard');return;}
  document.getElementById('app').innerHTML=shell('history','<div class="loader"><div class="spin"></div></div>');
  try{
    const all=[];
    for(const a of accounts){
      const r=await api('/transaction/history/'+a.accountNumber+'?size=50');
      all.push(...r.data.map(t=>({...t,myAcc:a.accountNumber})));
    }
    all.sort((a,b)=>new Date(b.date)-new Date(a.date));
    document.querySelector('.main').innerHTML=`<div class="pg-hdr"><div><h2>Transaction History</h2><p>Recent activity across accounts</p></div></div><div class="card-panel glass">${all.length?`<table class="tbl"><thead><tr><th>Type</th><th>From</th><th>To</th><th>Amount</th><th>Date</th></tr></thead><tbody>${all.map(t=>{const s=accounts.some(a=>a.accountNumber===t.fromAccount);return`<tr><td><span class="${s?'b-debit':'b-credit'}">${s?'↑ Sent':'↓ Received'}</span></td><td>${t.fromAccount}</td><td>${t.toAccount}</td><td class="${s?'amt-neg':'amt-pos'}">${s?'-':'+'}₹${fmt(t.amount)}</td><td style="color:var(--text-muted)">${fmtD(t.date)}</td></tr>`;}).join('')}</tbody></table>`:'<div class="empty"><p>No transactions yet</p></div>'}</div>`;
  }catch(e){toast(e.message,'error');}
}

// ADMIN PAGES
async function pgAllAccounts(){
  if(!(await loadUser()))return;
  document.getElementById('app').innerHTML=shell('allaccounts','<div class="loader"><div class="spin"></div></div>');
  try{
    const r=await api('/admin/accounts/all');
    document.querySelector('.main').innerHTML=`<div class="pg-hdr"><div><h2>All Accounts</h2><p>${r.data.length} accounts in the system</p></div></div><div class="card-panel glass"><table class="tbl"><thead><tr><th>Account</th><th>Type</th><th>Name</th><th>User</th><th>Balance</th><th>Created</th><th>Actions</th></tr></thead><tbody>${r.data.map(a=>`<tr><td><strong>${a.accountNumber}</strong></td><td><span class="badge type-${a.accountType}">${a.accountType}</span></td><td>${a.name}</td><td>#${a.userId}</td><td class="amt-pos">₹${fmt(a.balance)}</td><td style="color:var(--text-muted)">${fmtD(a.createdAt)}</td><td><button class="btn btn-rose btn-sm" onclick="delAcc('${a.accountNumber}')">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
  }catch(e){toast(e.message,'error');}
}

async function delAcc(n){
  if(!confirm('Delete '+n+'?'))return;
  try{await api('/admin/accounts/delete/'+n,{method:'DELETE'});toast('Deleted','success');pgAllAccounts();}catch(e){toast(e.message,'error');}
}

async function pgAudit(){
  if(!(await loadUser()))return;
  document.getElementById('app').innerHTML=shell('audit','<div class="loader"><div class="spin"></div></div>');
  try{
    const r=await api('/audit');
    document.querySelector('.main').innerHTML=`<div class="pg-hdr"><div><h2>Audit Logs</h2><p>${r.data.length} security entries</p></div></div><div class="card-panel glass">${r.data.length?`<table class="tbl"><thead><tr><th>Action</th><th>Entity</th><th>ID</th><th>User</th><th>Time</th></tr></thead><tbody>${r.data.map(l=>`<tr><td><span class="badge" style="background:rgba(255,255,255,0.1)">${l.action}</span></td><td>${l.entity}</td><td>${l.entityId||'-'}</td><td>${l.performedBy}</td><td style="color:var(--text-muted)">${fmtD(l.timestamp)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty"><p>No audit logs</p></div>'}</div>`;
  }catch(e){toast(e.message,'error');}
}

async function pgReports(){
  if(!(await loadUser()))return;
  document.getElementById('app').innerHTML=shell('reports','<div class="loader"><div class="spin"></div></div>');
  try{
    const[rr,ar,tv,ac]=await Promise.all([api('/reports/total-balance'),api('/admin/accounts/all'),api('/reports/transaction-volume'),api('/reports/active-accounts')]);
    const tot=rr.data.totalBalance,accs=ar.data,vol=tv.data.totalVolume,active=ac.data.activeAccounts;
    document.querySelector('.main').innerHTML=`<div class="pg-hdr"><div><h2>Reports</h2><p>Enterprise analytics</p></div></div><div class="stats"><div class="stat glass"><div class="dot dot-gold">💰</div><div class="lbl">Total Deposits</div><div class="val">₹${fmt(tot)}</div></div><div class="stat glass"><div class="dot dot-blue">👥</div><div class="lbl">Active Accounts</div><div class="val">${active}</div></div><div class="stat glass"><div class="dot dot-green">📊</div><div class="lbl">Total Txn Volume</div><div class="val">₹${fmt(vol)}</div></div><div class="stat glass"><div class="dot dot-violet">📈</div><div class="lbl">Avg Balance</div><div class="val">₹${accs.length?fmt(tot/accs.length):'0'}</div></div></div>`;
  }catch(e){toast(e.message,'error');}
}
