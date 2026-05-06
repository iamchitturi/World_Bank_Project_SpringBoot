const API='/api/v1';
let user=null,accounts=[],cards=[];
let inactivityTimer=null, isTimedOut=false;

function resetTimer(){
  clearTimeout(inactivityTimer);
  if(user&&!isTimedOut){
    inactivityTimer=setTimeout(()=>{isTimedOut=true;navigator.sendBeacon(API+'/auth/logout');user=null;},120000);
  }
}
document.addEventListener('mousemove',()=>{if(user&&!isTimedOut)resetTimer();});
document.addEventListener('keypress',()=>{if(user&&!isTimedOut)resetTimer();});
document.addEventListener('click',()=>{if(user&&!isTimedOut)resetTimer();});
window.addEventListener('beforeunload',()=>{if(user)navigator.sendBeacon(API+'/auth/logout');});

async function api(p,o={}){
  if(isTimedOut&&p!=='/auth/login'&&p!=='/auth/register'){toast('Session timed out. Please login again.','error');logoutLocally();throw new Error('Session timed out');}
  const h={'Content-Type':'application/json'};
  const r=await fetch(API+p,{...o,headers:h,credentials:'include'});
  const d=await r.json();
  if(!r.ok){if(r.status===401||r.status===403){toast('Session expired. Please login again.','error');logoutLocally();}throw new Error(d.message||'Error');}
  return d;
}

function toast(m,t='info'){const e=document.createElement('div');e.className='toast toast-'+(t==='success'?'ok':t==='error'?'err':'info');e.textContent=m;document.getElementById('toasts').appendChild(e);setTimeout(()=>e.remove(),3500);}
function nav(h){window.location.hash=h;}
function fmt(n){return parseFloat(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtD(d){if(!d)return'-';const dt=new Date(d);return dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+dt.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}
function uuid(){return(typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():Math.random().toString(36).substring(2)+Date.now().toString(36);}
function genCaptcha(){const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1;return{q:`${a} + ${b}`,a:a+b};}
function MI(name,fill){return `<span class="material-symbols-outlined${fill?' fill':''}" style="${fill?`font-variation-settings:'FILL' 1`:''}">${name}</span>`;}

window.addEventListener('hashchange',route);
window.addEventListener('load',()=>{window.history.replaceState(null,null,window.location.pathname);route();});

function route(){
  const h=window.location.hash.slice(1);
  const R={'':pgHome,home:pgHome,login:pgLogin,register:pgRegister,dashboard:pgDash,accounts:pgAccounts,cards:pgCards,transfer:pgTransfer,history:pgHistory,allaccounts:pgAllAccounts,audit:pgAudit,reports:pgReports};
  (R[h]||pgHome)();
}
async function logout(){try{navigator.sendBeacon(API+'/auth/logout');}catch(e){}logoutLocally(true);}
function logoutLocally(goHome=false){user=null;accounts=[];cards=[];clearTimeout(inactivityTimer);isTimedOut=false;if(goHome){window.history.replaceState(null,null,window.location.pathname);route();}else nav('login');}
async function loadUser(){if(!user){try{user=(await api('/auth/me')).data;isTimedOut=false;resetTimer();}catch{nav('login');return false;}}return true;}
async function loadAccounts(){try{accounts=(await api('/accounts/my')).data;}catch{accounts=[];}}
async function loadCards(){try{cards=(await api('/cards/my')).data;}catch{cards=[];}}

/* ── Shared nav bar (pre-login pages) ── */
function siteNav(){
  return `<header class="flex justify-between items-center w-full px-6 lg:px-8 h-[72px] z-30 bg-surface-container-lowest sticky top-0 shadow-sm border-b border-outline-variant">
    <div class="flex items-center gap-8">
      <a href="#" class="text-2xl font-display font-bold text-primary tracking-tight select-none">WorldBank</a>
      <nav class="hidden lg:flex gap-1 items-center">
        <a href="#" class="px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">Accounts</a>
        <a href="#" class="px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">Cards</a>
        <a href="#" class="px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">Loans</a>
        <a href="#" class="px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">Invest</a>
      </nav>
    </div>
    <div class="flex items-center gap-3">
      <button onclick="nav('register')" class="hidden md:inline-flex px-5 py-2 border-2 border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary-fixed/30 transition-colors">Open Account</button>
      <button onclick="nav('login')" class="px-5 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary-container transition-colors shadow-sm">Login</button>
    </div>
  </header>`;
}

function siteFooter(){
  return `<footer class="bg-tertiary w-full"><div class="max-w-6xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
    <div class="md:col-span-1"><span class="text-xl font-display font-bold text-white block mb-3">WorldBank</span><p class="text-sm text-on-tertiary-container leading-relaxed">Serving millions with trust, transparency, and technology.</p></div>
    <div class="flex flex-col gap-2"><h4 class="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Products</h4><a href="#" class="text-sm text-on-tertiary-container hover:text-white">Savings Account</a><a href="#" class="text-sm text-on-tertiary-container hover:text-white">Fixed Deposits</a><a href="#" class="text-sm text-on-tertiary-container hover:text-white">Credit Cards</a></div>
    <div class="flex flex-col gap-2"><h4 class="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Company</h4><a href="#" class="text-sm text-on-tertiary-container hover:text-white">About Us</a><a href="#" class="text-sm text-on-tertiary-container hover:text-white">Careers</a></div>
    <div class="flex flex-col gap-2"><h4 class="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Legal</h4><a href="#" class="text-sm text-on-tertiary-container hover:text-white">Privacy Policy</a><a href="#" class="text-sm text-on-tertiary-container hover:text-white">Terms of Use</a><a href="#" class="text-sm text-on-tertiary-container hover:text-white">Security</a></div>
  </div><div class="border-t border-white/10"><div class="max-w-6xl mx-auto px-6 lg:px-8 py-4"><p class="text-xs text-on-tertiary-container">&copy; ${new Date().getFullYear()} WorldBank Institutional Banking. All rights reserved.</p></div></div></footer>`;
}

/* ── Dashboard shell (post-login) ── */
function shell(pg,c){
  const isA=user&&user.role==='ADMIN';
  const link=(id,icon,label)=>`<a href="#${id}" class="side-link ${pg===id?'active':''} flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all duration-200 ${pg===id?'':'text-on-surface-variant hover:bg-surface-container-highest hover:translate-x-1'}"><span class="material-symbols-outlined">${icon}</span><span>${label}</span></a>`;
  const navItems=!isA?
    link('dashboard','dashboard','Dashboard')+link('accounts','account_balance_wallet','My Accounts')+link('cards','credit_card','Cards')+link('transfer','swap_horiz','Fund Transfer')+link('history','receipt_long','Statement'):
    link('dashboard','dashboard','Dashboard')+link('allaccounts','groups','All Accounts')+link('audit','policy','Audit Logs')+link('reports','bar_chart','Reports');
  return `<div class="flex min-h-screen">
    <aside class="h-screen w-64 fixed left-0 top-0 bg-surface-container border-r border-outline-variant flex flex-col p-6 z-50">
      <div class="mb-8 pl-2"><div class="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4 text-xl font-bold">${(user?.name||'?')[0].toUpperCase()}</div>
        <h2 class="text-xl font-display font-bold text-primary">Welcome back</h2><p class="text-xs font-semibold text-on-surface-variant mt-1">${user?.name||''} · ${user?.role||''}</p></div>
      <nav class="flex-1 space-y-2">${navItems}</nav>
      <div class="pt-4"><button onclick="logout()" class="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border border-outline text-on-surface-variant hover:bg-surface-container-highest transition-colors text-xs font-semibold"><span class="material-symbols-outlined text-[18px]">logout</span><span>Secure Logout</span></button></div>
    </aside>
    <main class="flex-1 ml-64 p-8 min-h-screen"><div class="max-w-[1100px] mx-auto">${c}</div></main>
  </div>`;
}
