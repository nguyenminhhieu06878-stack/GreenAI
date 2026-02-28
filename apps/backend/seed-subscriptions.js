const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  planName: String,
  planPrice: Number,
  duration: Number,
  status: String,
  startDate: Date,
  endDate: Date,
  paymentMethod: String,
  transactionId: String
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
const User = mongoose.model('User', userSchema);

async function seedSubscriptions() {
  try {
    await mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy');
    console.log('Connected to MongoDB');

    // Get some users
    const users = await User.find({ role: { $in: ['landlord', 'tenant'] } }).limit(10);
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      await mongoose.disconnect();
      return;
    }

    const plans = [
      { name: 'Gói Cơ Bản', price: 99000 },
      { name: 'Gói Chuyên Nghiệp', price: 199000 },
      { name: 'Gói Doanh Nghiệp', price: 499000 }
    ];

    const paymentMethods = ['Momo', 'VNPay', 'Chuyển khoản', 'ZaloPay'];

    const subscriptions = [];
    
    // Create subscriptions for the last 30 days
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const daysAgo = Math.floor(Math.random() * 30);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      subscriptions.push({
        userId: user._id,
        planName: plan.name,
        planPrice: plan.price,
        duration: 1,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod,
        transactionId: `TXN${Date.now()}${i}`,
        createdAt: startDate,
        updatedAt: startDate
      });
    }

    await Subscription.insertMany(subscriptions);
    
    console.log(`✅ Created ${subscriptions.length} subscription records!`);
    console.log('Sample subscriptions have been added to the database.');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedSubscriptions();
