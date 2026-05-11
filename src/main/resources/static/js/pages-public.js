/* ═══════════════════════════════════════
   HOME PAGE (TrustBank Main Website)
   ═══════════════════════════════════════ */
function pgHome(){
  document.getElementById('app').innerHTML=`
  ${siteNav()}
  <div class="w-full bg-primary text-on-primary text-xs font-medium py-2 overflow-hidden select-none">
    <div class="ticker-inner flex whitespace-nowrap gap-12"><span class="flex gap-12">
      <span>🏠 Home Loan: <strong>8.40% p.a.</strong></span><span>💳 Personal Loan: <strong>10.5% p.a.</strong></span><span>📈 FD Rate: <strong>7.25% p.a.</strong></span><span>💰 Savings: <strong>4.0% p.a.</strong></span><span>📊 Sensex: <strong>82,345 ▲ 0.42%</strong></span>
    </span><span class="flex gap-12" aria-hidden="true">
      <span>🏠 Home Loan: <strong>8.40% p.a.</strong></span><span>💳 Personal Loan: <strong>10.5% p.a.</strong></span><span>📈 FD Rate: <strong>7.25% p.a.</strong></span><span>💰 Savings: <strong>4.0% p.a.</strong></span><span>📊 Sensex: <strong>82,345 ▲ 0.42%</strong></span>
    </span></div>
  </div>
  <section class="relative w-full min-h-[520px] hero-bg overflow-hidden flex items-center">
    <div class="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
    <div class="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 py-20">
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80 font-medium mb-6 backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>Trusted by Millions
        </div>
        <h1 class="font-display text-5xl sm:text-6xl leading-tight text-white mb-5">Banking Redefined<br/>for <span class="text-primary-fixed-dim">Professionals</span></h1>
        <p class="text-lg text-white/80 mb-8 leading-relaxed max-w-lg">Experience secure, blazing fast, and reliable digital banking. Open an account in minutes.</p>
        <div class="flex flex-wrap gap-4">
          <button onclick="nav('register')" class="px-8 py-3 bg-secondary text-white rounded-lg text-sm font-semibold shadow-lg hover:bg-secondary-container transition-colors">Open Account</button>
          <button onclick="nav('login')" class="px-8 py-3 bg-white/10 border border-white/30 text-white rounded-lg text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors">NetBanking Login</button>
        </div>
      </div>
    </div>
    <div class="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 flex-col gap-4 z-10">
      <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 w-56 text-white"><p class="text-xs text-white/60 mb-1">Avg Savings Growth</p><p class="text-2xl font-bold font-display">↑ 12.4%</p><p class="text-xs text-green-300 mt-1">Year over year</p></div>
      <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 w-56 text-white"><p class="text-xs text-white/60 mb-1">Account Opening</p><p class="text-2xl font-bold font-display">2 Mins</p><p class="text-xs text-white/60 mt-1">Fully digital process</p></div>
    </div>
  </section>
  <section class="w-full max-w-6xl mx-auto px-6 lg:px-8 -mt-8 relative z-20">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      ${['computer|NetBanking|24/7 secure access','account_balance|Open Account|Start in minutes','credit_card|Credit Card|Apply instantly','location_on|Find ATM|Nearest locations'].map(x=>{const[i,t,d]=x.split('|');return`
      <a href="#login" class="bg-surface-container-lowest p-5 rounded-xl shadow-md border border-surface-variant flex flex-col items-start gap-3 card-lift group">
        <div class="w-11 h-11 rounded-lg bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><span class="material-symbols-outlined fill" style="font-variation-settings:'FILL' 1">${i}</span></div>
        <div><h3 class="text-sm font-semibold text-on-surface mb-0.5">${t}</h3><p class="text-xs text-on-surface-variant">${d}</p></div>
      </a>`;}).join('')}
    </div>
  </section>
  <section class="w-full bg-surface py-20 mt-12">
    <div class="max-w-6xl mx-auto px-6 lg:px-8">
      <div class="flex items-end justify-between mb-10"><div><p class="text-secondary text-xs font-semibold uppercase tracking-widest mb-2">Our Offerings</p><h2 class="font-display text-4xl text-on-surface">Explore Our Products</h2></div></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        ${[
          ['savings','Savings Accounts','High-yield options to grow your money safely.','https://lh3.googleusercontent.com/aida-public/AB6AXuCvsom0DoqDwx0Q_DferEQCwJvXCF6R3kGg_nU8G3vGJG06iWbvygA_8GjcYrYeb0J5jkO4NDeFqhnJfi_LPKF80F8Z-odnsWMe1HoyTkC1ORg1EUN7san3RNxtC6LW9EOyMzsPmMgP6CydP4YZQRPrF_IOyqhuSyGgJ2opmxdnFXrPT8g5LisB5p0auc5Jl2ZIt1bJbcgjDI0t3oQc3uxPAwCF1DDw14Gf7pOd6aargvM88E7TkCagzJz7rjHK0YzhPz_QDuhLZ0o'],
          ['credit_card','Credit Cards','Exclusive rewards and global acceptance.','https://lh3.googleusercontent.com/aida-public/AB6AXuAh-N8-NeaSt1ca1CsJFUnsBelsrVdLysQ0TEe5_uZhX7eDuiSGDrxZjEaebGIFjjkph1XezxwSMTzk8GSMQgj0iY8gVQBjFSj-xbvlGn-juV_4Xh40jzEFmDiUmLivDwnZ39mR_2KT3qhb-8sItOWgJT--jHvkpzA33yQW8pC1NffcRE9OfhGjEM9dAIhdW2mEjQHMgj1mjpJNmLgn_gHB8Hj0mi_fRnGiorylGXpbuUJUSN87vpNbleN7_aHZGRl_nUgYRLhS6_4'],
          ['real_estate_agent','Home Loans','Attractive rates for your dream home.','https://lh3.googleusercontent.com/aida-public/AB6AXuDfyxtfHP-oStqi4WJaW3gR_WHpB6A7QtqneVqXJ_aiL2HOMwwFlRcfGXzBD1H1_Yi3oyTR-TSDmv4OrLgFNr7mhcxeE2bUYWGljHQl0yzAQ2FQr02_WBxOPQOZk8Hr8i1IkGQpyL3MeOYZrMGomR_-qJP5WkvgkUnd1LyBnluZmRJ8IneuzAWrKZCIztRtcZFnuBQiOoThc5JruJ3kMR1chJ_eiwWS8aJISUYL0kIa4G_PsxdzkvsHNqBnzWeyLMuIsB4url9TwVg'],
          ['trending_up','Term Deposits','Guaranteed returns with flexible tenures.','https://lh3.googleusercontent.com/aida-public/AB6AXuBnaQ4jRb4po3jgMCQUDWz9VxugIipdr1nszEm4M770JLE7P1SJM8btaofhSueQIlWZIg80b0QjM0dKJu_hSkf8i9OwkEiu0MDNVbrjMhxzfTMtsHDCmxOd_BbuDas6Ftm5uyM1eQODbZJahjrEK_OKFoL7GxxjroW-dqYGowu1wjsgK1u8kKHDmX05lGc8FKIi2p2n-1c56IDT2mqdmcJYzgh8-5UNR4YxFcJbESkeUd-sferb92OvoZScOfXAlxdzzOhHKtzlVZg']
        ].map(([icon,title,desc,img])=>`
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-variant flex flex-col card-lift">
          <div class="h-44 w-full relative overflow-hidden"><img src="${img}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"/><div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm"><span class="material-symbols-outlined text-primary text-[20px]">${icon}</span></div><div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div></div>
          <div class="p-5 flex flex-col flex-grow"><h3 class="font-semibold text-base text-on-surface mb-2">${title}</h3><p class="text-sm text-on-surface-variant mb-5 flex-grow leading-relaxed">${desc}</p><a href="#register" class="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">Know More <span class="material-symbols-outlined text-[16px]">chevron_right</span></a></div>
        </div>`).join('')}
      </div>
    </div>
  </section>
  <section class="w-full bg-primary py-12">
    <div class="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
      ${[['₹2.4L Cr','Assets Under Management'],['42M+','Happy Customers'],['6,200+','ATMs Nationwide'],['4.8★','App Store Rating']].map(([v,l])=>`<div class="text-center fade-up"><p class="font-display text-4xl text-white mb-1">${v}</p><p class="text-sm text-white/60">${l}</p></div>`).join('')}
    </div>
  </section>
  <section class="w-full max-w-6xl mx-auto px-6 lg:px-8 py-20">
    <div class="text-center mb-14"><p class="text-secondary text-xs font-semibold uppercase tracking-widest mb-2">Our Promise</p><h2 class="font-display text-4xl text-on-surface mb-4">Why WorldBank</h2></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${[['shield','Secure Banking','State-of-the-art encryption and multi-factor authentication.'],['support_agent','24/7 Support','Dedicated customer care teams around the clock.'],['language','Global Reach','Seamless international transactions across major hubs.']].map(([i,t,d])=>`
      <div class="flex flex-col items-center text-center p-8 rounded-xl border border-surface-variant bg-surface-container-lowest card-lift fade-up">
        <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5"><span class="material-symbols-outlined fill" style="font-variation-settings:'FILL' 1;font-size:28px">${i}</span></div>
        <h3 class="font-semibold text-base text-on-surface mb-3">${t}</h3><p class="text-sm text-on-surface-variant leading-relaxed">${d}</p>
      </div>`).join('')}
    </div>
  </section>
  ${siteFooter()}`;
  // Fade-up observer
  const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible')}),{threshold:0.15});
  document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));
}

/* ═══════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════ */
function pgLogin(){
  const cap=genCaptcha();
  document.getElementById('app').innerHTML=`
  <nav class="flex justify-between items-center w-full px-8 h-20 z-50 bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0">
    <div class="flex items-center gap-2"><span class="text-2xl font-display font-bold text-primary tracking-tight">WorldBank</span></div>
    <div class="hidden md:flex items-center gap-6 text-xs font-semibold"><a class="text-on-surface-variant hover:text-primary px-3 py-2" href="#">Help Center</a><a class="text-on-surface-variant hover:text-primary px-3 py-2" href="#">Security</a></div>
    <button onclick="nav('register')" class="text-xs font-semibold text-primary px-4 py-2 border border-primary rounded-lg hover:bg-primary-fixed/30">Open Account</button>
  </nav>
  <main class="flex-grow flex relative overflow-hidden">
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20"><div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed-dim rounded-full blur-3xl"></div><div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-fixed-dim rounded-full blur-3xl opacity-50"></div></div>
    <div class="flex-grow flex flex-col items-center justify-center py-8 px-8 z-10">
      <div class="w-full max-w-md">
        <div class="bg-surface-container-lowest rounded-xl shadow-soft p-8 border border-outline-variant/50">
          <div class="mb-8 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-container text-on-primary-container rounded-full mb-4"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;font-size:24px">lock</span></div>
            <h1 class="text-2xl font-semibold text-primary">Secure Login</h1>
            <p class="text-sm text-on-surface-variant mt-2">Access your WorldBank NetBanking account.</p>
          </div>
          <form id="loginForm" class="space-y-6">
            <div><label class="block text-xs font-semibold text-on-surface mb-2" for="em">Customer ID / Email</label><div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span><input class="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" id="em" type="email" placeholder="Enter your email" required/></div></div>
            <div><div class="flex justify-between items-center mb-2"><label class="block text-xs font-semibold text-on-surface" for="pw">Password</label></div><div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">key</span><input class="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant rounded text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" id="pw" type="password" placeholder="Enter your password" required/></div></div>
            <div class="bg-surface-container-low p-4 rounded-lg border border-outline-variant"><div class="flex items-center justify-between"><div class="flex items-center space-x-3"><span class="text-sm text-on-surface">Verify: <strong>${cap.q}</strong> = </span><input type="number" id="cap" class="w-16 py-1 px-2 border border-outline-variant rounded text-sm text-center" required/></div><div class="flex flex-col items-center"><span class="material-symbols-outlined text-outline" style="font-size:28px">sync_problem</span><span class="text-[8px] text-outline mt-1 uppercase tracking-wider">CAPTCHA</span></div></div></div>
            <div class="pt-2"><button type="submit" class="btn-login w-full bg-secondary text-on-secondary py-3 px-6 rounded text-xs font-semibold uppercase tracking-wide transition-colors shadow-sm flex justify-center items-center space-x-2"><span>Login to Secure Portal</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span></button></div>
          </form>
        </div>
        <div class="mt-6 flex flex-col items-center space-y-4">
          <p class="text-sm text-on-surface-variant">First time user? <a class="text-primary font-semibold hover:underline" href="#register">Register for NetBanking</a></p>
          <div class="flex items-center space-x-2 text-xs text-on-surface-variant bg-surface-container-high px-3 py-2 rounded-full border border-outline-variant/30"><span class="material-symbols-outlined text-[14px] text-primary">verified_user</span><span>Your connection is encrypted and secure.</span></div>
        </div>
      </div>
    </div>
    <aside class="hidden lg:flex flex-col justify-center px-8 border-l border-outline-variant/30 bg-surface-container z-10" style="width:320px;flex-shrink:0">
      <div class="mb-8"><span class="material-symbols-outlined text-secondary text-[40px] mb-4">shield_locked</span><h2 class="text-xl font-display font-semibold text-primary mb-2">Uncompromising Security</h2><p class="text-sm text-on-surface-variant">Multi-layered security architecture protects your assets.</p></div>
      <div class="space-y-6">
        ${[['devices','Device Management','Monitor all connected devices.'],['notifications_active','Real-time Alerts','Instant notifications for unusual activity.']].map(([i,t,d])=>`<div class="flex items-start space-x-4"><div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-1"><span class="material-symbols-outlined text-[16px]" style="font-variation-settings:'FILL' 1">${i}</span></div><div><h3 class="text-xs font-semibold text-on-surface">${t}</h3><p class="text-xs text-on-surface-variant mt-1">${d}</p></div></div>`).join('')}
      </div>
    </aside>
  </main>`;
  document.getElementById('loginForm').onsubmit=async e=>{e.preventDefault();if(parseInt(document.getElementById('cap').value)!==cap.a){toast('Invalid captcha','error');return;}try{await api('/auth/login',{method:'POST',body:JSON.stringify({email:document.getElementById('em').value,password:document.getElementById('pw').value})});user=null;toast('Login successful','success');nav('dashboard');}catch(err){toast(err.message,'error');}};
}

/* ═══════════════════════════════════════
   REGISTER PAGE
   ═══════════════════════════════════════ */
function pgRegister(){
  const cap=genCaptcha();
  document.getElementById('app').innerHTML=`
  <nav class="flex justify-between items-center w-full px-8 h-20 z-50 bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0">
    <span class="text-2xl font-display font-bold text-primary">WorldBank</span>
    <button onclick="nav('login')" class="px-5 py-2 bg-secondary text-white rounded-lg text-sm font-semibold">Login</button>
  </nav>
  <div class="flex-grow flex items-center justify-center py-12 px-8">
    <div class="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-soft p-8 border border-outline-variant/50">
      <div class="mb-8 text-center"><div class="inline-flex items-center justify-center w-12 h-12 bg-primary-container text-on-primary-container rounded-full mb-4"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;font-size:24px">person_add</span></div><h1 class="text-2xl font-semibold text-primary">Create Account</h1><p class="text-sm text-on-surface-variant mt-2">Register for WorldBank NetBanking.</p></div>
      <form id="regForm" class="space-y-5">
        <div><label class="block text-xs font-semibold text-on-surface mb-2">Full Name</label><div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span><input class="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" id="nm" type="text" placeholder="Enter your full name" required/></div></div>
        <div><label class="block text-xs font-semibold text-on-surface mb-2">Email ID</label><div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span><input class="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" id="em" type="email" placeholder="Enter your email address" required/></div></div>
        <div>
          <label class="block text-xs font-semibold text-on-surface mb-2">Password</label>
          <div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">key</span><input class="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" id="pw" type="password" placeholder="Create a strong password" required/></div>
          <div class="mt-2 hidden" id="pwStrengthBox"><div class="flex justify-between items-center mb-1"><span class="text-[10px] uppercase font-bold text-outline tracking-wider">Password Strength</span><span id="pwText" class="text-[10px] font-bold"></span></div><div class="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden"><div id="pwBar" class="h-full w-0 transition-all duration-300"></div></div></div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-on-surface mb-2">Confirm Password</label>
          <div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock_reset</span><input class="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" id="pw2" type="password" placeholder="Re-enter your password" required/></div>
        </div>
        <div class="bg-surface-container-low p-3 rounded-lg border border-outline-variant"><span class="text-sm">Verify: <strong>${cap.q}</strong> = </span><input type="number" id="cap" class="w-16 py-1 px-2 border border-outline-variant rounded text-sm text-center" required/></div>
        <button type="submit" class="btn-login w-full bg-secondary text-on-secondary py-3 rounded text-xs font-semibold uppercase tracking-wide">Register</button>
      </form>
      <p class="mt-6 text-center text-sm text-on-surface-variant">Already registered? <a class="text-primary font-semibold hover:underline" href="#login">Login Here</a></p>
    </div>
  </div>`;
  document.getElementById('pw').addEventListener('input', e => {
    const p = e.target.value, box = document.getElementById('pwStrengthBox');
    if(!p) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    let s = 0; if(p.length>=8) s+=25; if(/[A-Z]/.test(p)) s+=25; if(/[0-9]/.test(p)) s+=25; if(/[^A-Za-z0-9]/.test(p)) s+=25;
    const bar = document.getElementById('pwBar'), txt = document.getElementById('pwText');
    bar.style.width = s + '%';
    if(s<=25) { bar.className='h-full transition-all duration-300 bg-error'; txt.innerText='Weak'; txt.className='text-[10px] font-bold text-error'; }
    else if(s<=50) { bar.className='h-full transition-all duration-300 bg-yellow-500'; txt.innerText='Fair'; txt.className='text-[10px] font-bold text-yellow-500'; }
    else if(s<=75) { bar.className='h-full transition-all duration-300 bg-blue-500'; txt.innerText='Good'; txt.className='text-[10px] font-bold text-blue-500'; }
    else { bar.className='h-full transition-all duration-300 bg-green-500'; txt.innerText='Strong'; txt.className='text-[10px] font-bold text-green-500'; }
  });
  document.getElementById('regForm').onsubmit=async e=>{e.preventDefault();const pw=document.getElementById('pw').value,pw2=document.getElementById('pw2').value;if(pw!==pw2){toast('Passwords do not match','error');return;}if(parseInt(document.getElementById('cap').value)!==cap.a){toast('Invalid captcha','error');return;}try{await api('/auth/register',{method:'POST',body:JSON.stringify({name:document.getElementById('nm').value,email:document.getElementById('em').value,password:pw})});toast('Registration successful!','success');nav('login');}catch(err){toast(err.message,'error');}};
}
