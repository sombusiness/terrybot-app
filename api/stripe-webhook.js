// api/stripe-webhook.js
// Vercel serverless function — handles Stripe webhook events

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = session.customer_details?.email;
        if (email) {
          // Find user by email and mark as pro
          const { data: users } = await supabase.auth.admin.listUsers();
          const user = users?.users?.find(u => u.email === email);
          if (user) {
            await supabase.from("profiles").upsert({
              id: user.id,
              is_pro: true,
              stripe_customer_id: session.customer,
              subscription_id: session.subscription
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        // Find profile by stripe customer id and remove pro
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", sub.customer)
          .single();
        if (profile) {
          await supabase
            .from("profiles")
            .update({ is_pro: false, subscription_id: null })
            .eq("id", profile.id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const isActive = sub.status === "active";
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", sub.customer)
          .single();
        if (profile) {
          await supabase
            .from("profiles")
            .update({ is_pro: isActive })
            .eq("id", profile.id);
        }
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Handler failed" });
  }
}

export const config = {
  api: { bodyParser: false }
};
