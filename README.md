# TerryBot — Trade invoices & tax made easy 🔨

Your AI-powered business assistant for UK tradesmen. Built with Terry Bot.

---

## What's inside

| File | Screen |
|------|--------|
| `public/index.html` | Dashboard |
| `public/invoice.html` | Invoice Generator (4-step, PDF download) |
| `public/expenses.html` | Expense & Receipt Tracker |
| `public/tax.html` | Tax Summary & Self Assessment Checklist |
| `public/pricing.html` | Subscription / Pricing Page |

---

## Deploy to Vercel in 15 minutes

### Step 1 — Create a GitHub account (if you don't have one)
Go to https://github.com and sign up free.

### Step 2 — Create a new repository
1. Click the **+** button → **New repository**
2. Name it: `terrybot-app`
3. Set it to **Private**
4. Click **Create repository**
5. Upload ALL files from this folder — drag and drop the entire `terrybot-app` folder contents

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com
2. Click **Sign up** — use your GitHub account
3. Click **Add New Project**
4. Select your `terrybot-app` repository
5. Leave all settings as default
6. Click **Deploy**

✅ Your site will be live at `terrybot-app.vercel.app` in about 60 seconds!

---

## Add Stripe payments (when ready)

### Step 1 — Create a Stripe account
Go to https://stripe.com/gb and sign up.

### Step 2 — Create your products in Stripe
In your Stripe dashboard:
1. Go to **Products** → **Add product**
2. Create **TerryBot Pro Monthly** — £6.99/month recurring
3. Create **TerryBot Pro Annual** — £49.99/year recurring
4. Copy the **Payment Link** URLs for each

### Step 3 — Add the links to your pricing page
In `public/pricing.html`, find the `handleSubscribe()` function and replace the `alert()` with:

```javascript
function handleSubscribe() {
  if(selectedPlan === 'annual') {
    window.location.href = 'YOUR_STRIPE_ANNUAL_PAYMENT_LINK';
  } else {
    window.location.href = 'YOUR_STRIPE_MONTHLY_PAYMENT_LINK';
  }
}
```

### Step 4 — Redeploy
Push the change to GitHub and Vercel redeploys automatically.

---

## Pricing strategy

| Plan | Price | Notes |
|------|-------|-------|
| Free tier | Free | 1 invoice + 1 expense only |
| Pro Monthly | £6.99/month | Cancel any time |
| Pro Annual | £49.99/year | Saves £33.89 vs monthly |

**Revenue at scale:**
- 100 users × £6.99 = £699/month
- 500 users × £6.99 = £3,495/month
- API costs: ~£0.001 per invoice = negligible

---

## Custom domain (optional)

Want `terrybot.co.uk` instead of `terrybot-app.vercel.app`?

1. Buy the domain at https://www.123-reg.co.uk or https://www.namecheap.com (~£10/year)
2. In Vercel → your project → **Settings** → **Domains**
3. Add your domain and follow the DNS instructions
4. Done — HTTPS is automatic and free

---

## Legal docs (add before going public)

Generate free versions at https://termly.io:
- Privacy Policy
- Terms & Conditions

Save them as `public/privacy.html` and `public/terms.html` and link from the pricing page footer.

---

## TerryBot voice & tone

Terry talks like a knowledgeable mate, not a corporate robot.

✅ "Snap that receipt before it goes missing down the back of the van"
✅ "Sorted! Invoice sent to Mr Johnson"
✅ "Less than a pint a month"
❌ "Transaction recorded successfully"
❌ "Submit your self assessment return"

---

Built with ❤️ in the UK. Terry Bot — Trade invoices & tax made easy.
