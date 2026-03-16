const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const Twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 DATABASE CONNECTION
const pool = new Pool({
  user: 'postgres',                 // your PostgreSQL username
  host: 'localhost',
  database: 'lgsupply',             // renamed database to LG Supply Ltd
  password: 'your_password_here',   // your PostgreSQL password
  port: 5432,
});

// 🔹 EMAIL CONFIG (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',       // your Gmail
    pass: 'your_app_password_here',     // Gmail app password
  },
});

// 🔹 TWILIO CONFIG
const twilioClient = new Twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');
const twilioFromNumber = '+1234567890'; // Your Twilio phone number

// 🔹 TEST SERVER
app.get('/', (req, res) => {
  res.send('LG Supply Ltd Backend running');
});

// 🔹 REGISTER SUPPLIER
app.post('/api/register', async (req, res) => {
  try {
    const { company, name, email, phone } = req.body;

    // 1️⃣ Save to database
    await pool.query(
      'INSERT INTO suppliers (company, name, email, phone) VALUES ($1,$2,$3,$4)',
      [company, name, email, phone]
    );

    // 2️⃣ Send Welcome Email
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Welcome to LG Supply Ltd!',
      text: `Hi ${name},\n\nThank you for registering with LG Supply Ltd. We’re excited to have you on board!\n\nBest regards,\nLG Supply Ltd Team`
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Email error:', err);
      else console.log('Email sent:', info.response);
    });

    // 3️⃣ Send Welcome SMS
    twilioClient.messages
      .create({
        body: `Hi ${name}, welcome to LG Supply Ltd!`,
        from: twilioFromNumber,
        to: phone
      })
      .then(message => console.log('SMS sent:', message.sid))
      .catch(err => console.error('SMS error:', err));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 🔹 GET SUPPLIERS
app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load suppliers' });
  }
});

// 🔹 GET TENDERS
app.get('/api/tenders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load tenders' });
  }
});

// 🔹 ADD TENDER (Admin use)
app.post('/api/tenders', async (req, res) => {
  try {
    const { title, description, sector, deadline } = req.body;

    await pool.query(
      'INSERT INTO tenders (title, description, sector, deadline) VALUES ($1,$2,$3,$4)',
      [title, description, sector, deadline]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add tender' });
  }
});

// 🔹 CONTACT FORM
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1️⃣ Save to database
    await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1,$2,$3,$4)',
      [name, email, subject, message]
    );

    // 2️⃣ Send email to admin
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'admin@lgsupply.co.tz',  // replace with your admin email
      subject: `New Contact Message: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Contact email error:', err);
      else console.log('Contact email sent:', info.response);
    });

    // 3️⃣ Send confirmation email to user
    const userMailOptions = {
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Thank you for contacting LG Supply Ltd!',
      text: `Hi ${name},\n\nThanks for reaching out to LG Supply Ltd. We will get back to you shortly.\n\nBest regards,\nLG Supply Ltd Team`
    };
    transporter.sendMail(userMailOptions, (err, info) => {
      if (err) console.error('Confirmation email error:', err);
      else console.log('Confirmation email sent:', info.response);
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send contact message' });
  }
});

// 🔹 START SERVER
app.listen(3000, () => console.log('LG Supply Ltd Backend running on http://localhost:3000'));
