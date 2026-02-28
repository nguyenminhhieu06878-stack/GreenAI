const mongoose = require('mongoose');

const voucherTemplateSchema = new mongoose.Schema({
  name: String,
  description: String,
  value: String,
  type: String,
  quantity: Number,
  remaining: Number,
  probability: Number,
  isActive: Boolean,
  validFrom: Date,
  validUntil: Date
}, { timestamps: true });

const VoucherTemplate = mongoose.model('VoucherTemplate', voucherTemplateSchema);

async function seedVouchers() {
  try {
    await mongoose.connect('mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy');
    console.log('✅ Connected to MongoDB');

    // Clear existing templates
    await VoucherTemplate.deleteMany({});
    console.log('🗑️  Cleared existing voucher templates');

    // Create voucher templates - Only discount percentage from 20% to 100%
    const templates = [
      {
        name: 'Giảm 20%',
        description: 'Giảm 20% giá trị hóa đơn tiền điện',
        value: '20%',
        type: 'discount',
        quantity: 100,
        remaining: 100,
        probability: 35, // 35% chance
        isActive: true
      },
      {
        name: 'Giảm 30%',
        description: 'Giảm 30% giá trị hóa đơn tiền điện',
        value: '30%',
        type: 'discount',
        quantity: 80,
        remaining: 80,
        probability: 25, // 25% chance
        isActive: true
      },
      {
        name: 'Giảm 40%',
        description: 'Giảm 40% giá trị hóa đơn tiền điện',
        value: '40%',
        type: 'discount',
        quantity: 60,
        remaining: 60,
        probability: 20, // 20% chance
        isActive: true
      },
      {
        name: 'Giảm 50%',
        description: 'Giảm 50% giá trị hóa đơn tiền điện',
        value: '50%',
        type: 'discount',
        quantity: 40,
        remaining: 40,
        probability: 10, // 10% chance
        isActive: true
      },
      {
        name: 'Giảm 70%',
        description: 'Giảm 70% giá trị hóa đơn tiền điện - Hiếm!',
        value: '70%',
        type: 'discount',
        quantity: 20,
        remaining: 20,
        probability: 7, // 7% chance
        isActive: true
      },
      {
        name: 'Giảm 100%',
        description: 'MIỄN PHÍ 100% hóa đơn tiền điện - Siêu hiếm!',
        value: '100%',
        type: 'discount',
        quantity: 10,
        remaining: 10,
        probability: 3, // 3% chance
        isActive: true
      }
    ];

    const created = await VoucherTemplate.insertMany(templates);
    
    console.log('\n✅ Created voucher templates:');
    created.forEach(template => {
      console.log(`   📦 ${template.name} - ${template.value} (${template.quantity} vouchers, ${template.probability}% chance)`);
    });

    console.log('\n📊 Summary:');
    console.log(`   Total templates: ${created.length}`);
    console.log(`   Total vouchers: ${templates.reduce((sum, t) => sum + t.quantity, 0)}`);
    console.log(`   Total probability: ${templates.reduce((sum, t) => sum + t.probability, 0)}%`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedVouchers();
