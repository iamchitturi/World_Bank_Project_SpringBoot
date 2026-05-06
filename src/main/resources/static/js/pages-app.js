/* Dashboard */
async function pgDash(){
  if(!(await loadUser()))return;
  if(user.role==='ADMIN')return pgAdminDash();
  document.getElementById('app').innerHTML=shell('dashboard','<div class="loader"><div class="spin"></div></div>');
  await loadAccounts();await loadCards();
  const total=accounts.reduce((s,a)=>s+parseFloat(a.balance||0),0);
  const accs=accounts.map(a=>`<div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft hover:shadow-md transition-shadow border border-outline-variant/30 flex flex-col relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-1 bg-primary"></div>
    <div class="flex justify-between items-start mb-6"><div><h4 class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">${a.accountType}</h4><p class="text-sm text-on-surface-variant/70 mt-1">${a.accountNumber}</p></div><span class="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">account_balance</span></div>
    <div class="mt-auto"><div class="text-2xl font-semibold text-on-surface mb-4">₹${fmt(a.balance)}</div>
    <div class="flex space-x-3 border-t border-outline-variant/50 pt-4"><button class="text-xs font-semibold text-primary flex items-center" onclick="showModal('deposit')">Deposit <span class="material-symbols-outlined text-[16px] ml-1">arrow_forward</span></button><span class="w-px bg-outline-variant h-4 my-auto"></span><button class="text-xs font-semibold text-on-surface-variant" onclick="showModal('withdraw')">Withdraw</button></div></div></div>`).join('');
  const main=document.querySelector('.max-w-\\[1100px\\]');
  if(!main)return;
  main.innerHTML=`<header class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-8 border-b border-outline-variant">
    <div><h1 class="text-3xl font-display font-bold text-primary mb-2">Good morning, ${user.name}</h1><p class="text-base text-on-surface-variant">Here is a summary of your accounts.</p></div>
    <div class="mt-6 md:mt-0 text-right"><p class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total Net Worth</p><div class="text-4xl font-bold text-on-surface tracking-tight">₹${fmt(total)}</div></div>
  </header>
  <h3 class="text-xl font-display font-semibold text-primary mb-6">Your Accounts</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">${accs||'<p class="text-on-surface-variant">No accounts yet. Create one from the sidebar.</p>'}</div>
  <div class="flex justify-between items-end mb-6"><h3 class="text-xl font-display font-semibold text-primary">Recent Transactions</h3><a href="#history" class="text-xs font-semibold text-primary hover:underline flex items-center">View All <span class="material-symbols-outlined text-[16px] ml-1">arrow_forward</span></a></div>
  <div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden" id="recentTxn"><div class="loader"><div class="spin"></div></div></div>`;
  loadRecent();
}
async function loadRecent(){
  if(!accounts.length){const el=document.getElementById('recentTxn');if(el)el.innerHTML='<p class="p-6 text-on-surface-variant">No transactions.</p>';return;}
  try{
    const r=await api('/transaction/history/'+accounts[0].accountNumber+'?size=5');const t=r.data;const a0=accounts[0].accountNumber;
    document.getElementById('recentTxn').innerHTML=t.length?`<table class="w-full text-left border-collapse"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase">Date</th><th class="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase">Description</th><th class="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Amount</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${t.map(x=>{const s=x.fromAccount===a0;return`<tr class="hover:bg-surface-container-low transition-colors"><td class="py-4 px-6 text-sm text-on-surface-variant">${fmtD(x.date)}</td><td class="py-4 px-6"><div class="text-sm font-semibold text-on-surface">${s?'Transfer to '+x.toAccount:'Transfer from '+x.fromAccount}</div></td><td class="py-4 px-6 text-sm font-semibold text-right ${s?'text-error':'text-surface-tint'}">${s?'-':'+'}₹${fmt(x.amount)}</td></tr>`;}).join('')}</tbody></table>`:'<p class="p-6 text-on-surface-variant">No transactions yet.</p>';
  }catch(e){}
}
/* Admin Dash */
async function pgAdminDash(){
  document.getElementById('app').innerHTML=shell('dashboard','<div class="loader"><div class="spin"></div></div>');
  try{const[a,r]=await Promise.all([api('/admin/accounts/all'),api('/reports/total-balance')]);const accs=a.data,tot=r.data.totalBalance;
  document.querySelector('.max-w-\\[1100px\\]').innerHTML=`<h1 class="text-3xl font-display font-bold text-primary mb-8">Admin Dashboard</h1>
  <div class="grid grid-cols-2 gap-6 mb-8"><div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30"><p class="text-xs font-semibold text-on-surface-variant uppercase mb-2">Total Accounts</p><p class="text-3xl font-bold text-primary">${accs.length}</p></div><div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30"><p class="text-xs font-semibold text-on-surface-variant uppercase mb-2">Total Balance</p><p class="text-3xl font-bold text-surface-tint">₹${fmt(tot)}</p></div></div>
  <div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden"><table class="w-full text-left"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Account</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Type</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Name</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Balance</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${accs.map(a=>`<tr class="hover:bg-surface-container-low"><td class="py-3 px-6 text-sm font-semibold">${a.accountNumber}</td><td class="py-3 px-6 text-sm">${a.accountType}</td><td class="py-3 px-6 text-sm">${a.name}</td><td class="py-3 px-6 text-sm text-right text-surface-tint font-semibold">₹${fmt(a.balance)}</td></tr>`).join('')}</tbody></table></div>`;}catch(e){toast(e.message,'error');}
}
/* Accounts */
async function pgAccounts(){
  if(!(await loadUser()))return;await loadAccounts();
  const rows=accounts.map(a=>`<div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30 mb-4"><div class="flex justify-between items-start"><div><p class="text-xs font-semibold text-on-surface-variant uppercase">${a.accountType} Account</p><p class="font-mono text-sm text-on-surface-variant mt-1">${a.accountNumber}</p></div><p class="text-2xl font-bold text-surface-tint">₹${fmt(a.balance)}</p></div><div class="mt-4 pt-4 border-t border-outline-variant/50 grid grid-cols-2 gap-4 text-sm"><div><span class="text-on-surface-variant">Holder:</span> <strong>${a.name}</strong></div><div><span class="text-on-surface-variant">Branch:</span> WORLD BANK MAIN</div></div></div>`).join('');
  document.getElementById('app').innerHTML=shell('accounts',`<div class="flex justify-between items-center mb-8"><h1 class="text-3xl font-display font-bold text-primary">My Accounts</h1><button onclick="showCreateAccount()" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors">+ New Account</button></div>${rows||'<p>No accounts.</p>'}`);
}
function showCreateAccount(){
  const o=document.createElement('div');o.className='overlay';o.onclick=e=>{if(e.target===o)o.remove();};
  o.innerHTML=`<div class="bg-surface-container-lowest rounded-xl p-8 w-full max-w-md border-t-4 border-primary shadow-2xl"><h3 class="text-xl font-display font-bold text-primary mb-6">Open New Account</h3><form id="cf" class="space-y-5"><div><label class="block text-xs font-semibold mb-2">Account Name</label><input class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary" id="cName" required/></div><div><label class="block text-xs font-semibold mb-2">Type</label><select id="cType" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm"><option value="SAVINGS">Savings</option><option value="CURRENT">Current</option><option value="PREMIUM">Premium</option></select></div><div class="flex justify-end gap-3 pt-4 border-t border-outline-variant"><button type="button" class="px-5 py-2 border border-outline text-on-surface-variant rounded-lg text-sm font-semibold" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Create</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('cf').onsubmit=async e=>{e.preventDefault();try{const r=await api('/accounts/create',{method:'POST',body:JSON.stringify({name:document.getElementById('cName').value,accountType:document.getElementById('cType').value})});toast('Account '+r.data.accountNumber+' created!','success');o.remove();accounts=[];pgAccounts();}catch(err){toast(err.message,'error');}};
}
/* Cards */
async function pgCards(){
  if(!(await loadUser()))return;await loadAccounts();await loadCards();
  const rows=cards.length?`<table class="w-full text-left"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Card</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Type</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Expiry</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Status</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Action</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${cards.map(c=>`<tr class="hover:bg-surface-container-low"><td class="py-3 px-6 text-sm font-semibold">${c.maskedNumber}</td><td class="py-3 px-6 text-sm">${c.cardType}</td><td class="py-3 px-6 text-sm">${c.expiryDate}</td><td class="py-3 px-6 text-sm">${c.status}</td><td class="py-3 px-6">${c.status==='ACTIVE'?`<button class="px-4 py-1.5 bg-error text-white rounded text-xs font-semibold" onclick="blockCard(${c.id})">Block</button>`:`<button class="px-4 py-1.5 bg-primary text-white rounded text-xs font-semibold" onclick="activateCard(${c.id})">Activate</button>`}</td></tr>`).join('')}</tbody></table>`:'<p class="p-6">No cards linked.</p>';
  document.getElementById('app').innerHTML=shell('cards',`<div class="flex justify-between items-center mb-8"><h1 class="text-3xl font-display font-bold text-primary">Cards</h1><button onclick="showIssueCard()" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold">+ Apply for Card</button></div><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden">${rows}</div>`);
}
function showIssueCard(){
  if(!accounts.length){toast('Create an account first','error');return;}
  const o=document.createElement('div');o.className='overlay';o.onclick=e=>{if(e.target===o)o.remove();};
  o.innerHTML=`<div class="bg-surface-container-lowest rounded-xl p-8 w-full max-w-md border-t-4 border-primary shadow-2xl"><h3 class="text-xl font-display font-bold text-primary mb-6">Apply for Card</h3><form id="icf" class="space-y-5"><div><label class="block text-xs font-semibold mb-2">Card Type</label><select id="icType" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm"><option value="DEBIT">Debit</option><option value="CREDIT">Credit</option></select></div><div><label class="block text-xs font-semibold mb-2">Link to Account</label><select id="icAcc" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm">${accounts.map(a=>`<option value="${a.id}">${a.accountNumber}</option>`).join('')}</select></div><div class="flex justify-end gap-3 pt-4 border-t border-outline-variant"><button type="button" class="px-5 py-2 border border-outline rounded-lg text-sm font-semibold" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Issue</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('icf').onsubmit=async e=>{e.preventDefault();try{await api('/cards/issue',{method:'POST',body:JSON.stringify({cardType:document.getElementById('icType').value,accountId:parseInt(document.getElementById('icAcc').value)})});toast('Card issued!','success');o.remove();cards=[];pgCards();}catch(err){toast(err.message,'error');}};
}
async function blockCard(id){try{await api('/cards/block/'+id,{method:'POST'});toast('Card blocked','success');cards=[];pgCards();}catch(e){toast(e.message,'error');}}
async function activateCard(id){try{await api('/cards/activate/'+id,{method:'POST'});toast('Card activated','success');cards=[];pgCards();}catch(e){toast(e.message,'error');}}
/* Deposit/Withdraw */
function showModal(type){
  if(!accounts.length){toast('No accounts','error');return;}
  const t=type==='deposit'?'Deposit':'Withdraw';
  const o=document.createElement('div');o.className='overlay';o.onclick=e=>{if(e.target===o)o.remove();};
  o.innerHTML=`<div class="bg-surface-container-lowest rounded-xl p-8 w-full max-w-md border-t-4 border-${type==='deposit'?'primary':'error'} shadow-2xl"><h3 class="text-xl font-display font-bold text-${type==='deposit'?'primary':'error'} mb-6">${t} Funds</h3><form id="mf" class="space-y-5"><div><label class="block text-xs font-semibold mb-2">Account</label><select id="mAcc" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm">${accounts.map(a=>`<option value="${a.accountNumber}">${a.accountNumber} — ₹${fmt(a.balance)}</option>`).join('')}</select></div><div><label class="block text-xs font-semibold mb-2">Amount (₹)</label><input type="number" id="mAmt" min="1" step="0.01" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm" required/></div><div class="flex justify-end gap-3 pt-4 border-t border-outline-variant"><button type="button" class="px-5 py-2 border border-outline rounded-lg text-sm font-semibold" onclick="this.closest('.overlay').remove()">Cancel</button><button type="submit" class="px-5 py-2 bg-${type==='deposit'?'primary':'secondary'} text-white rounded-lg text-sm font-semibold">Confirm</button></div></form></div>`;
  document.body.appendChild(o);
  document.getElementById('mf').onsubmit=async e=>{e.preventDefault();const acc=document.getElementById('mAcc').value,amt=document.getElementById('mAmt').value;
    try{await api('/accounts/'+type+'?accountNumber='+acc+'&amount='+amt,{method:'POST',headers:{'Idempotency-Key':uuid(),'Content-Type':'application/json'}});toast(t+' successful!','success');o.remove();accounts=[];pgDash();}catch(err){toast(err.message,'error');}};
}
/* Transfer */
async function pgTransfer(){
  if(!(await loadUser()))return;await loadAccounts();if(!accounts.length){nav('accounts');return;}
  document.getElementById('app').innerHTML=shell('transfer',`<h1 class="text-3xl font-display font-bold text-primary mb-8">Fund Transfer</h1>
  <div class="bg-surface-container-lowest rounded-xl p-8 shadow-soft border border-outline-variant/30 max-w-lg"><form id="tf" class="space-y-5">
    <div><label class="block text-xs font-semibold mb-2">From Account</label><select id="tFrom" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm">${accounts.map(a=>`<option value="${a.accountNumber}">${a.accountNumber} — ₹${fmt(a.balance)}</option>`).join('')}</select></div>
    <div><label class="block text-xs font-semibold mb-2">Beneficiary A/C No.</label><input type="text" id="tTo" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm" required/></div>
    <div><label class="block text-xs font-semibold mb-2">Amount (₹)</label><input type="number" id="tAmt" min="1" step="0.01" class="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-sm" required/></div>
    <button type="submit" class="w-full py-3 bg-primary text-white rounded-lg text-sm font-semibold">Initiate Transfer</button>
  </form></div>`);
  document.getElementById('tf').onsubmit=async e=>{e.preventDefault();try{await api('/accounts/transfer',{method:'POST',body:JSON.stringify({fromAcc:document.getElementById('tFrom').value,toAcc:document.getElementById('tTo').value,amount:parseFloat(document.getElementById('tAmt').value),requestId:uuid()})});toast('Transfer successful!','success');accounts=[];nav('history');}catch(err){toast(err.message,'error');}};
}
/* History */
async function pgHistory(){
  if(!(await loadUser()))return;await loadAccounts();if(!accounts.length){nav('dashboard');return;}
  document.getElementById('app').innerHTML=shell('history','<div class="loader"><div class="spin"></div></div>');
  try{const all=[];for(const a of accounts){const r=await api('/transaction/history/'+a.accountNumber+'?size=50');all.push(...r.data.map(t=>({...t,myAcc:a.accountNumber})));}all.sort((a,b)=>new Date(b.date)-new Date(a.date));
  document.querySelector('.max-w-\\[1100px\\]').innerHTML=`<h1 class="text-3xl font-display font-bold text-primary mb-8">Account Statement</h1><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden">${all.length?`<table class="w-full text-left"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Date</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase">Details</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Debit</th><th class="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase text-right">Credit</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${all.map(t=>{const s=accounts.some(a=>a.accountNumber===t.fromAccount);return`<tr class="hover:bg-surface-container-low"><td class="py-3 px-6 text-sm">${fmtD(t.date)}</td><td class="py-3 px-6 text-sm font-semibold">${s?'TRF TO '+t.toAccount:'TRF FROM '+t.fromAccount}</td><td class="py-3 px-6 text-sm text-right text-error font-semibold">${s?'₹'+fmt(t.amount):''}</td><td class="py-3 px-6 text-sm text-right text-surface-tint font-semibold">${!s?'₹'+fmt(t.amount):''}</td></tr>`;}).join('')}</tbody></table>`:'<p class="p-6">No transactions.</p>'}</div>`;}catch(e){toast(e.message,'error');}
}
/* Admin */
async function pgAllAccounts(){
  if(!(await loadUser()))return;
  document.getElementById('app').innerHTML=shell('allaccounts','<div class="loader"><div class="spin"></div></div>');
  try{const r=await api('/admin/accounts/all');
  document.querySelector('.max-w-\\[1100px\\]').innerHTML=`<h1 class="text-3xl font-display font-bold text-primary mb-8">All Accounts</h1><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden"><table class="w-full text-left"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold uppercase">A/C No.</th><th class="py-3 px-6 text-xs font-semibold uppercase">Type</th><th class="py-3 px-6 text-xs font-semibold uppercase">Name</th><th class="py-3 px-6 text-xs font-semibold uppercase text-right">Balance</th><th class="py-3 px-6 text-xs font-semibold uppercase">Action</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${r.data.map(a=>`<tr><td class="py-3 px-6 text-sm font-semibold">${a.accountNumber}</td><td class="py-3 px-6 text-sm">${a.accountType}</td><td class="py-3 px-6 text-sm">${a.name}</td><td class="py-3 px-6 text-sm text-right text-surface-tint font-semibold">₹${fmt(a.balance)}</td><td class="py-3 px-6"><button class="px-4 py-1.5 bg-error text-white rounded text-xs font-semibold" onclick="delAcc('${a.accountNumber}')">Close</button></td></tr>`).join('')}</tbody></table></div>`;}catch(e){toast(e.message,'error');}
}
async function delAcc(n){if(!confirm('Close account '+n+'?'))return;try{await api('/admin/accounts/delete/'+n,{method:'DELETE'});toast('Closed','success');pgAllAccounts();}catch(e){toast(e.message,'error');}}
async function pgAudit(){
  if(!(await loadUser()))return;
  document.getElementById('app').innerHTML=shell('audit','<div class="loader"><div class="spin"></div></div>');
  try{const r=await api('/audit');
  document.querySelector('.max-w-\\[1100px\\]').innerHTML=`<h1 class="text-3xl font-display font-bold text-primary mb-8">Audit Logs</h1><div class="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden"><table class="w-full text-left"><thead><tr class="bg-surface-container border-b border-outline-variant"><th class="py-3 px-6 text-xs font-semibold uppercase">Time</th><th class="py-3 px-6 text-xs font-semibold uppercase">Action</th><th class="py-3 px-6 text-xs font-semibold uppercase">Entity</th><th class="py-3 px-6 text-xs font-semibold uppercase">User</th></tr></thead><tbody class="divide-y divide-outline-variant/50">${r.data.map(l=>`<tr><td class="py-3 px-6 text-sm">${fmtD(l.timestamp)}</td><td class="py-3 px-6 text-sm font-semibold">${l.action}</td><td class="py-3 px-6 text-sm">${l.entity} (${l.entityId||'N/A'})</td><td class="py-3 px-6 text-sm">${l.performedBy}</td></tr>`).join('')}</tbody></table></div>`;}catch(e){toast(e.message,'error');}
}
async function pgReports(){
  if(!(await loadUser()))return;
  document.getElementById('app').innerHTML=shell('reports','<div class="loader"><div class="spin"></div></div>');
  try{const[rr,ar,tv,ac]=await Promise.all([api('/reports/total-balance'),api('/admin/accounts/all'),api('/reports/transaction-volume'),api('/reports/active-accounts')]);const tot=rr.data.totalBalance,accs=ar.data,vol=tv.data.totalVolume,active=ac.data.activeAccounts;
  document.querySelector('.max-w-\\[1100px\\]').innerHTML=`<h1 class="text-3xl font-display font-bold text-primary mb-8">Reports</h1>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">${[['Total Deposits','₹'+fmt(tot),'primary'],['Txn Volume','₹'+fmt(vol),'surface-tint'],['Active Accounts',active,'primary'],['Avg Balance','₹'+(accs.length?fmt(tot/accs.length):'0'),'surface-tint']].map(([l,v,c])=>`<div class="bg-surface-container-lowest rounded-xl p-6 shadow-soft border border-outline-variant/30"><p class="text-xs font-semibold text-on-surface-variant uppercase mb-2">${l}</p><p class="text-2xl font-bold text-${c}">${v}</p></div>`).join('')}</div>`;}catch(e){toast(e.message,'error');}
}
