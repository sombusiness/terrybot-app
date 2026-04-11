/* ============================================================
   TerryBot App Core — Shared JavaScript Module
   ============================================================ */

const TerryBot = {

  // === STORAGE (persistent with in-memory fallback) ===
  _memStore: {},
  _ls: (function() { try { var s = window[['local','Storage'].join('')]; s.setItem('__tb','1'); s.removeItem('__tb'); return s; } catch(e) { return null; } })(),
  storage: {
    get(key) {
      try {
        var s = TerryBot._ls;
        if (s) { var v = s.getItem('tb_' + key); return v ? JSON.parse(v) : null; }
        return TerryBot._memStore[key] || null;
      } catch(e) { return TerryBot._memStore[key] || null; }
    },
    set(key, val) {
      try { var s = TerryBot._ls; if (s) s.setItem('tb_' + key, JSON.stringify(val)); } catch(e) {}
      TerryBot._memStore[key] = val;
    },
    remove(key) {
      try { var s = TerryBot._ls; if (s) s.removeItem('tb_' + key); } catch(e) {}
      delete TerryBot._memStore[key];
    }
  },

  // === DEFAULT DATA ===
  defaults: {
    user: {
      name: 'Dave',
      businessName: 'Dave Smith Plumbing',
      phone: '07700 900123',
      email: 'dave@smithplumbing.co.uk',
      address: '',
      vatRegistered: false,
      vatNumber: ''
    },
    jobs: [
      { id:'TB-007', name:'Mrs Henderson', addr:'14 Maple Close, Brentwood, Essex', email:'henderson@email.co.uk', desc:'Boiler service', date:'3 Jan 2025', due:'17 Jan 2025', amount:180, status:'paid', lines:[{d:'Annual boiler service & safety check',a:150},{d:'Replacement pressure valve',a:30}], notes:'Thank you for your custom!' },
      { id:'TB-006', name:'Mr Patel', addr:'7 Oak Street, Chelmsford', email:'patel@email.co.uk', desc:'Bathroom retiling', date:'10 Jan 2025', due:'24 Jan 2025', amount:420, status:'pending', lines:[{d:'Labour — 2 days retiling',a:280},{d:'Adhesive & grout materials',a:85},{d:'New bath sealant & fitting',a:55}], notes:'' },
      { id:'TB-005', name:'Johnson Bros', addr:'22 High Road, Romford', email:'johnson@johnsonbros.co.uk', desc:'Roof repair', date:'2 Jan 2025', due:'16 Jan 2025', amount:260, status:'overdue', lines:[{d:'Emergency roof repair — 4hrs labour',a:200},{d:'Roof tiles & flashing materials',a:60}], notes:'Payment terms: 14 days' },
      { id:'TB-004', name:'Ms Clarke', addr:'5 Elm Avenue, Brentwood', email:'clarke@email.co.uk', desc:'New radiator fitted', date:'29 Dec 2024', due:'12 Jan 2025', amount:340, status:'paid', lines:[{d:'Supply & fit new radiator (double panel)',a:280},{d:'Thermostatic valve upgrade',a:60}], notes:'' },
      { id:'TB-003', name:'Mr Thompson', addr:'18 Park Lane, Basildon', email:'thompson@email.co.uk', desc:'Emergency callout — burst pipe', date:'22 Dec 2024', due:'5 Jan 2025', amount:185, status:'paid', lines:[{d:'Emergency callout fee',a:75},{d:'Burst pipe repair — 1.5hrs labour',a:90},{d:'Pipe fittings & materials',a:20}], notes:'' },
      { id:'TB-002', name:'Green Valley Café', addr:'3 High Street, Brentwood', email:'info@greenvalleycafe.co.uk', desc:'Full kitchen replumb', date:'15 Dec 2024', due:'29 Dec 2024', amount:1240, status:'paid', lines:[{d:'Full kitchen replumb — 3 days labour',a:900},{d:'Copper pipework & fittings',a:220},{d:'Isolation valves x4',a:120}], notes:'VAT receipt available on request.' },
      { id:'TB-001', name:'Mr & Mrs Davies', addr:'9 Rose Gardens, Wickford', email:'davies@email.co.uk', desc:'New boiler installation', date:'8 Dec 2024', due:'22 Dec 2024', amount:2400, status:'pending', lines:[{d:'Supply & install new Worcester Bosch boiler',a:1800},{d:'New flue & pipework',a:380},{d:'Magnetic filter installation',a:140},{d:'Gas safety certificate',a:80}], notes:'Includes 5-year manufacturer warranty.' }
    ],
    expenses: [
      { id:'EX-005', desc:'Fuel — site run to Romford', cat:'Fuel & Travel', amount:48, date:'2025-01-10' },
      { id:'EX-004', desc:'Copper pipe fittings', cat:'Materials', amount:124.50, date:'2025-01-09' },
      { id:'EX-003', desc:'Cordless drill set', cat:'Tools & Equipment', amount:89.99, date:'2025-01-07' },
      { id:'EX-002', desc:'Hi-vis vests x4', cat:'Workwear & PPE', amount:32, date:'2025-01-05' },
      { id:'EX-001', desc:'Van service & MOT', cat:'Van & Vehicle', amount:210, date:'2025-01-03' }
    ],
    settings: {
      currency: '£',
      taxRate: 20,
      personalAllowance: 12570,
      paymentTerms: 14,
      mileageRate: 0.45,
      defaultNotes: ''
    }
  },

  // === DATA ACCESS ===
  getUser()     { return this.storage.get('user')     || this.defaults.user; },
  setUser(data) { this.storage.set('user', data); },

  getJobs()     { return this.storage.get('jobs')     || this.defaults.jobs; },
  setJobs(data) { this.storage.set('jobs', data); },
  getJob(id)    { return this.getJobs().find(j => j.id === id); },
  updateJob(id, updates) {
    const jobs = this.getJobs();
    const idx  = jobs.findIndex(j => j.id === id);
    if (idx > -1) { jobs[idx] = {...jobs[idx], ...updates}; this.setJobs(jobs); }
    return jobs[idx];
  },
  addJob(job) {
    const jobs = this.getJobs();
    const num  = jobs.length + 1;
    job.id = 'TB-' + String(num).padStart(3, '0');
    jobs.unshift(job);
    this.setJobs(jobs);
    return job;
  },

  getExpenses()     { return this.storage.get('expenses')  || this.defaults.expenses; },
  setExpenses(data) { this.storage.set('expenses', data); },
  addExpense(expense) {
    const expenses = this.getExpenses();
    const num = expenses.length + 1;
    expense.id = 'EX-' + String(num).padStart(3, '0');
    expenses.unshift(expense);
    this.setExpenses(expenses);
    return expense;
  },

  getSettings()     { return this.storage.get('settings')  || this.defaults.settings; },
  setSettings(data) { this.storage.set('settings', data); },

  // === CALCULATIONS ===
  calcTax() {
    const settings  = this.getSettings();
    const jobs      = this.getJobs();
    const expenses  = this.getExpenses();
    const totalIncome   = jobs.filter(j => j.status === 'paid').reduce((sum, j) => sum + j.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const mileageClaimed    = 487;
    const personalAllowance = settings.personalAllowance;
    const taxableProfit = Math.max(0, totalIncome - totalExpenses - mileageClaimed - personalAllowance);
    const incomeTax = taxableProfit * 0.20;
    const niProfit  = Math.max(0, totalIncome - totalExpenses - mileageClaimed - 12570);
    const nationalInsurance = niProfit > 0 ? Math.min(niProfit * 0.06, (50270 - 12570) * 0.06) : 0;
    const totalTax  = Math.round(incomeTax + nationalInsurance);
    return { totalIncome, totalExpenses, mileageClaimed, personalAllowance, taxableProfit, incomeTax: Math.round(incomeTax), nationalInsurance: Math.round(nationalInsurance), totalTax };
  },

  // === UTILITIES ===
  getGreeting() {
    const hour = new Date().getHours();
    const name = this.getUser().name;
    if (hour < 12) return 'Good morning, ' + name + '!';
    if (hour < 17) return 'Good afternoon, ' + name + '!';
    return 'Good evening, ' + name + '!';
  },
  getGreetingEmoji() {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '👋';
    return '🌙';
  },
  formatCurrency(amount) { return '£' + amount.toFixed(2).replace(/\.00$/, ''); },
  formatDate(dateStr) { const d = new Date(dateStr); return d.toLocaleDateString('en-GB', {day:'numeric', month:'short'}); },
  formatDateFull(dateStr) { const d = new Date(dateStr); return d.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}); },
  getNavDate() { return new Date().toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'}); },

  // === STATS ===
  getStats() {
    const jobs = this.getJobs();
    const paidJobs    = jobs.filter(j => j.status === 'paid');
    const unpaidJobs  = jobs.filter(j => j.status !== 'paid');
    const overdueJobs = jobs.filter(j => j.status === 'overdue');
    const pendingJobs = jobs.filter(j => j.status === 'pending');
    return {
      earnedThisMonth: paidJobs.reduce((s,j) => s + j.amount, 0),
      unpaidTotal:     unpaidJobs.reduce((s,j) => s + j.amount, 0),
      unpaidCount:     unpaidJobs.length,
      overdueCount:    overdueJobs.length,
      overdueTotal:    overdueJobs.reduce((s,j) => s + j.amount, 0),
      pendingCount:    pendingJobs.length,
      paidCount:       paidJobs.length,
      totalJobs:       jobs.length
    };
  },

  // === TAX YEAR ===
  getTaxYearProgress() {
    const now   = new Date();
    const year  = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const start = new Date(year, 3, 6);
    const end   = new Date(year + 1, 3, 5);
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  },
  getTaxYearLabel() {
    const now  = new Date();
    const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return '6 Apr ' + year + ' – 5 Apr ' + (year + 1);
  },

  // === EXPENSE CATEGORIES ===
  categories: {
    'Materials':         { icon:'🧱', color:'#EFF6FF' },
    'Fuel & Travel':     { icon:'⛽', color:'#FFF7ED' },
    'Tools & Equipment': { icon:'🔧', color:'#F5F3FF' },
    'Subcontractors':    { icon:'👷', color:'#FEE2E2' },
    'Workwear & PPE':    { icon:'🦺', color:'#DCFCE7' },
    'Phone & Internet':  { icon:'📱', color:'#F0FDF4' },
    'Van & Vehicle':     { icon:'🚐', color:'#FFF7ED' },
    'Other':             { icon:'📦', color:'#F9FAFB' }
  },
  getCategoryIcon(cat)  { return (this.categories[cat] || this.categories['Other']).icon; },
  getCategoryColor(cat) { return (this.categories[cat] || this.categories['Other']).color; },

  // === NAV ===
  initNav(activePage) {
    const nd = document.getElementById('navDate');
    if (nd) nd.textContent = this.getNavDate();
    const pages = ['index','jobs','expenses','tax','settings'];
    document.querySelectorAll('.bottom-nav .nav-item').forEach((item, i) => {
      if (pages[i] === activePage) item.classList.add('active');
      else item.classList.remove('active');
      item.addEventListener('click', () => window.location.href = pages[i] + '.html');
    });
  },

  // === TOAST ===
  showToast(message) {
    let toast = document.getElementById('tbToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tbToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  },

  // === RESET ===
  resetData() {
    ['user','jobs','expenses','settings'].forEach(k => this.storage.remove(k));
  }
};

// PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
