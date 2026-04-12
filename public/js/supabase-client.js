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
