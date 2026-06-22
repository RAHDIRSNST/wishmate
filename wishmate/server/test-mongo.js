require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 15000
})
  .then(() => {
    console.log('MongoDB CONNECTED');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB FAILED:', err.message);
    process.exit(1);
  });