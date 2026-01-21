-- A2ZCreative D1 Database Schema
-- Run this in Cloudflare Dashboard > D1 > Your Database > Console

-- Users table (synced from Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'starter',
  role TEXT DEFAULT 'client', -- 'admin' or 'client'
  status TEXT DEFAULT 'active', -- 'active' or 'suspended'
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Events table with owner relationship
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT,
  event_date TEXT,
  status TEXT DEFAULT 'draft',
  plan TEXT DEFAULT 'starter',
  settings TEXT,
  views INTEGER DEFAULT 0,
  rsvp_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Guests/RSVP table
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  pax INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  paid_at TEXT,
  items TEXT,
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'rsvp', 'payment', 'reminder', 'info'
  title TEXT NOT NULL,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Plans table (pricing packages)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,           -- 'starter', 'basic', 'premium', 'exclusive'
  name TEXT NOT NULL,            -- 'Starter Pack'
  price REAL NOT NULL,           -- 20.00
  price_note TEXT,               -- 'one-time'
  tagline TEXT,                  -- 'I just need something fast & nice'
  color TEXT,                    -- 'starter'
  gradient TEXT,                 -- 'from-starter to-green-600'
  icon TEXT,                     -- 'Cake'
  events TEXT,                   -- JSON array: ["Birthday Party", "Aqiqah"]
  features TEXT,                 -- JSON array: ["1 page invitation", "Basic theme"]
  not_included TEXT,             -- JSON array: ["RSVP with guest count", "Analytics"]
  popular INTEGER DEFAULT 0,     -- 1 = true, 0 = false
  sort_order INTEGER DEFAULT 0,  -- Display order
  active INTEGER DEFAULT 1,      -- 1 = visible, 0 = hidden
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,               -- 'welcome', 'rsvp_confirmation', 'invoice', 'reminder'
  name TEXT NOT NULL,                -- 'Welcome Email'
  subject TEXT NOT NULL,             -- 'Welcome to A2ZCreative!'
  body TEXT NOT NULL,                -- HTML email body
  variables TEXT,                    -- JSON: ["{{name}}", "{{email}}"]
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Seed default email templates
INSERT OR IGNORE INTO email_templates (id, name, subject, body, variables) VALUES
  ('welcome', 'Welcome Email', 'Welcome to A2ZCreative!', '<h1>Welcome, {{name}}!</h1><p>Thanks for signing up.</p>', '["{{name}}","{{email}}"]'),
  ('rsvp_confirmation', 'RSVP Confirmation', 'Your RSVP is Confirmed', '<h1>Thanks for your RSVP, {{name}}!</h1><p>You have been confirmed for {{event_name}}.</p>', '["{{name}}","{{event_name}}"]'),
  ('invoice', 'Invoice Email', 'Invoice #{{invoice_id}}', '<h1>Invoice for {{customer_name}}</h1><p>Amount: RM{{amount}}</p>', '["{{invoice_id}}","{{customer_name}}","{{amount}}"]'),
  ('reminder', 'Event Reminder', 'Reminder: {{event_name}} is Coming Up!', '<h1>{{event_name}}</h1><p>Your event is happening soon on {{event_date}}.</p>', '["{{event_name}}","{{event_date}}"]');

-- Coupons table for promo codes
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,    -- 'percentage' or 'fixed'
  discount_value REAL NOT NULL,   -- 10 = 10% or RM10
  applicable_plans TEXT,          -- JSON: ["premium","exclusive"] or null for all
  max_uses INTEGER,               -- null = unlimited
  used_count INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Audit Logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_id TEXT NOT NULL,
  admin_email TEXT,
  action TEXT NOT NULL,           -- 'user.plan_changed', 'coupon.created', etc
  target_type TEXT,               -- 'user', 'coupon', 'event'
  target_id TEXT,
  details TEXT,                   -- JSON with before/after values
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
