const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/green-energy')
  .then(async () => {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({}).select('email role name');
    console.log('Danh sách users:');
    users.forEach(u => {
      console.log(`- ${u.email} | Role: ${u.role} | Name: ${u.name || 'N/A'}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
