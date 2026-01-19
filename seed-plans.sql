-- Seed default plans for A2ZCreative
-- Run this in Cloudflare D1 console after creating the plans table

-- Create plans table if not exists
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  price_note TEXT,
  tagline TEXT,
  color TEXT,
  gradient TEXT,
  icon TEXT,
  events TEXT,
  features TEXT,
  not_included TEXT,
  popular INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Delete existing plans (optional - remove this if you want to keep existing data)
DELETE FROM plans;

-- Insert Starter Pack
INSERT INTO plans (id, name, price, price_note, tagline, color, gradient, icon, events, features, not_included, popular, sort_order, active)
VALUES (
  'starter',
  'Starter Pack',
  20,
  'one-time',
  'I just need something fast & nice',
  'starter',
  'from-starter to-green-600',
  'Cake',
  '["Birthday Party (Kids)","Birthday Party (Adults)","Aqiqah / Doa Selamat","Housewarming","Small Family Gathering","Simple Surprise Party"]',
  '["1 page invitation","Basic theme selection","Event details display","WhatsApp share link","Simple \"I''m attending\" button"]',
  '["RSVP with guest count","Google Maps","Theme customization","Analytics"]',
  0,
  1,
  1
);

-- Insert Basic Pack
INSERT INTO plans (id, name, price, price_note, tagline, color, gradient, icon, events, features, not_included, popular, sort_order, active)
VALUES (
  'basic',
  'Basic Pack',
  49,
  'one-time',
  'I want it to look proper & organized',
  'basic',
  'from-basic to-blue-600',
  'Heart',
  '["Engagement / Nikah","Graduation Celebration","Family Reunion","Kenduri Kecil","Religious Talks / Ceramah","Baby Shower"]',
  '["RSVP with guest count","Google Maps integration","Date countdown timer","Multiple sections (Tentative, Location, Contact)","Theme customization (color / font)"]',
  '["Custom domain","Photo gallery","Analytics"]',
  1,
  2,
  1
);

-- Insert Premium Pack
INSERT INTO plans (id, name, price, price_note, tagline, color, gradient, icon, events, features, not_included, popular, sort_order, active)
VALUES (
  'premium',
  'Premium Pack',
  99,
  'one-time',
  'This event represents me / us',
  'premium',
  'from-premium to-orange-600',
  'Gem',
  '["Wedding Reception","Corporate Event","Product Launch","Annual Dinner","Seminar / Workshop","Charity Gala"]',
  '["Custom domain/subdomain","Photo & video gallery","Advanced RSVP (diet, pax, notes)","Calendar sync","Analytics (views, attendance)","Background music / animation"]',
  '["QR Check-in","Multiple invite links"]',
  0,
  3,
  1
);

-- Insert Exclusive Plan
INSERT INTO plans (id, name, price, price_note, tagline, color, gradient, icon, events, features, not_included, popular, sort_order, active)
VALUES (
  'exclusive',
  'Exclusive Plan',
  199.99,
  'one-time',
  'This event must look elite & controlled',
  'exclusive',
  'from-exclusive to-pink-600',
  'Crown',
  '["VIP / Royal-style Wedding","Private Gala Dinner","Conference / Summit","Government / NGO Event","Invite-Only Exclusive Event","Award Ceremony"]',
  '["Organizer dashboard","Multiple invitation links (VIP / Public / Staff)","QR check-in system","Guest approval system","Custom branding (logo, colors)","Priority support","Export guest data (Excel)"]',
  '[]',
  0,
  4,
  1
);
