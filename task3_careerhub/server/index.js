require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const uploadsFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(uploadsFolder));

app.get('/', (req, res) => res.send('CareerHub API is running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/jobs'));
app.use('/api', require('./routes/applications'));
app.use('/api', require('./routes/companies'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/stats'));

// Any error ends up here
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large (max 2 MB)' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CareerHub server running on http://localhost:${PORT}`));
