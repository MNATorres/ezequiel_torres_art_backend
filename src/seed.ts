import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from './config/env';
import { UserModel, UserRole } from './models/user.model';

const seed = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected');

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping.');
      process.exit(0);
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new UserModel({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123`);
    console.log('   ⚠️  Change this password in production!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
