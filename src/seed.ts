import mongoose from 'mongoose';
import { env } from './config/env';
import { UserModel, UserRole } from './models/user.model';

const adminEmail = env.ALLOWED_GOOGLE_EMAILS.split(',')[0]?.trim().toLowerCase();

const seed = async () => {
  if (!adminEmail) {
    console.error('❌ Set ALLOWED_GOOGLE_EMAILS with at least one email before seeding.');
    process.exit(1);
  }

  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected');

    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping.');
      process.exit(0);
    }

    const admin = new UserModel({
      name: 'Admin',
      email: adminEmail,
      role: UserRole.ADMIN,
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log('   Sign in with this Google account to access the manager.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
