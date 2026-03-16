-- Create database (optional if not already created)
CREATE DATABASE lgsupply;

-- Connect to the database (if using psql)
\c lgsupply;

-- Create suppliers table
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  company TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tenders table
CREATE TABLE tenders (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  sector TEXT,
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contact messages table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample tender
INSERT INTO tenders (title, description, sector, deadline)
VALUES ('Solar Pump Tender', 'Supply 50 solar water pumps for rural irrigation', 'Agriculture', '2026-03-31');
