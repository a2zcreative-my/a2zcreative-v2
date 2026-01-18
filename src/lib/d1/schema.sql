-- Users table (synced from Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'starter',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  event_type TEXT,
  event_date DATETIME,
  template_id TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- RSVP responses table
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  attending TEXT NOT NULL,
  guests_count INTEGER DEFAULT 1,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Gift contributions table
CREATE TABLE IF NOT EXISTS gift_contributions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_rsvp_event ON rsvp_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_gifts_event ON gift_contributions(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);

