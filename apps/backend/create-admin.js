const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@greenenergy.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@greenenergy.com');
    console.log('Password: admin123');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
