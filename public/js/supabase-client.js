/* ============================================================
   TerryBot Supabase Client — shared across all pages
   ============================================================ */

const SUPABASE_URL = 'https://gavyzfmixpeddxqqdhzp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhdnl6Zm1peHBlZGR4cXFkaHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NDQ0MzYsImV4cCI6MjA5MTUyMDQzNn0.6SqiqqGeH-an2FYhqaVDh1J_CVerhzG8YqbbDePttPM';

// Init Supabase client
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── AUTH HELPERS ────────────────────────────────────────────
async function requireAuth() {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.replace('login.html'); return null; }
  return session;
}

async function signOut() {
  await _sb.auth.signOut();
  window.location.replace('login.html');
}

// ── CLEAR DEMO DATA ─────────────────────────────────────────
// Always wipe localStorage jobs/expenses — Supabase is the source of truth
function clearDemoData() {
  localStorage.removeItem('tb_jobs');
  localStorage.removeItem('tb_expenses');
  localStorage.removeItem('tb_user');
  localStorage.removeItem('tb_settings');
  localStorage.removeItem('tb_demo_cleared');
}

// ── JOBS ────────────────────────────────────────────────────
async function dbSaveJob(job, userId) {
  // Check if job already exists first
  const { data: existing } = await _sb.from('jobs')
    .select('id').eq('job_id', job.id).eq('user_id', userId).single();

  var payload = {
    user_id:     userId,
    job_id:      job.id,
    name:        job.name,
    addr:        job.addr || '',
    email:       job.email || '',
    description: job.desc || '',
    date:        job.date || '',
    due:         job.due || '',
    amount:      job.amount,
    status:      job.status || 'pending',
    lines:       job.lines || [],
    notes:       job.notes || ''
  };

  var result;
  if (existing) {
    result = await _sb.from('jobs').update(payload).eq('job_id', job.id).eq('user_id', userId);
  } else {
    result = await _sb.from('jobs').insert(payload);
  }
  if (result.error) console.error('Save job error:', result.error);
  return result.data;
}

async function dbLoadJobs(userId) {
  const { data, error } = await _sb.from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Load jobs error:', error); return []; }
  // Map DB format back to app format
  return (data || []).map(row => ({
    id:     row.job_id,
    name:   row.name,
    addr:   row.addr,
    email:  row.email,
    desc:   row.description,
    date:   row.date,
    due:    row.due,
    amount: parseFloat(row.amount),
    status: row.status,
    lines:  row.lines || [],
    notes:  row.notes || ''
  }));
}

async function dbUpdateJobStatus(jobId, userId, status) {
  const { error } = await _sb.from('jobs')
    .update({ status })
    .eq('job_id', jobId)
    .eq('user_id', userId);
  if (error) console.error('Update job status error:', error);
}

// ── EXPENSES ────────────────────────────────────────────────
async function dbSaveExpense(expense, userId) {
  const { error } = await _sb.from('expenses').insert({
    user_id:     userId,
    expense_id:  expense.id,
    description: expense.desc,
    cat:         expense.cat,
    amount:      expense.amount,
    date:        expense.date
  });
  if (error) console.error('Save expense error:', error);
}

async function dbLoadExpenses(userId) {
  const { data, error } = await _sb.from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Load expenses error:', error); return []; }
  return (data || []).map(row => ({
    id:     row.expense_id,
    desc:   row.description,
    cat:    row.cat,
    amount: parseFloat(row.amount),
    date:   row.date
  }));
}

// ── PRO CHECK ────────────────────────────────────────────────
async function checkIsPro(userId) {
  var res = await _sb.from('profiles').select('is_pro').eq('id', userId).single();
  return !!(res.data && res.data.is_pro);
}

// ── PAYWALL ──────────────────────────────────────────────────
function showPaywall(message) {
  // Remove existing modal if any
  var existing = document.getElementById('paywallModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'paywallModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:1rem';
  modal.innerHTML = `
    <div style="background:white;border-radius:24px 24px 20px 20px;width:100%;max-width:480px;overflow:hidden;animation:slideUp 0.3s ease">
      <div style="background:linear-gradient(135deg,#1B2B4B,#2d4a7a);padding:2rem;text-align:center;position:relative">
        <div style="font-size:48px;margin-bottom:0.5rem">🔨</div>
        <div style="color:#F5C518;font-size:22px;font-weight:900;margin-bottom:6px">Upgrade to TerryBot Pro</div>
        <div style="color:rgba(255,255,255,0.8);font-size:14px;font-weight:600">${message || 'You have reached your free limit'}</div>
      </div>
      <div style="padding:1.5rem">
        <div style="background:#F9FAFB;border-radius:14px;padding:1rem;margin-bottom:1rem">
          <div style="font-size:13px;font-weight:800;color:#1B2B4B;margin-bottom:8px">Pro includes everything:</div>
          <div style="font-size:13px;font-weight:600;color:#374151;line-height:2">
            ✅ Unlimited invoices<br>
            ✅ Unlimited expenses<br>
            ✅ Cloud sync across all devices<br>
            ✅ PDF downloads<br>
            ✅ Tax estimates<br>
            ✅ Priority support
          </div>
        </div>
        <a href="https://buy.stripe.com/5kQeV6gowcDceMxbQq3wQ01" style="display:block;background:#F5C518;color:#1B2B4B;font-size:16px;font-weight:900;padding:16px;border-radius:14px;text-align:center;text-decoration:none;margin-bottom:10px">
          🏆 Get Pro — £49.99/year (best value)
        </a>
        <a href="https://buy.stripe.com/00wcMYa08av447T1bM3wQ00" style="display:block;background:#1B2B4B;color:white;font-size:14px;font-weight:800;padding:14px;border-radius:14px;text-align:center;text-decoration:none;margin-bottom:10px">
          Monthly — £6.99/month
        </a>
        <button onclick="document.getElementById('paywallModal').remove()" style="width:100%;background:none;border:none;color:#9CA3AF;font-size:13px;font-weight:700;padding:8px;cursor:pointer">
          Maybe later
        </button>
      </div>
    </div>
    <style>@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}</style>
  `;
  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
}
