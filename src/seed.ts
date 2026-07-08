import mongoose from 'mongoose';
import { env } from './config/env';
import { UserModel, UserRole } from './models/user.model';

// Bootstrap the allowlisted Google accounts as ADMINs. Idempotent: creates a
// user if missing, promotes an existing one to ADMIN, and skips those already
// ADMIN. Run once after setting ALLOWED_GOOGLE_EMAILS (and re-run safely).
const adminEmails = env.ALLOWED_GOOGLE_EMAILS.split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const seed = async () => {
  if (adminEmails.length === 0) {
    console.error('❌ Set ALLOWED_GOOGLE_EMAILS with at least one email before seeding.');
    process.exit(1);
  }

  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected');

    for (const email of adminEmails) {
      const existing = await UserModel.findOne({ email });
      if (existing) {
        if (existing.role === UserRole.ADMIN) {
          console.log(`⏭️  ${email} is already ADMIN. Skipping.`);
        } else {
          existing.role = UserRole.ADMIN;
          await existing.save();
          console.log(`⬆️  ${email} promoted to ADMIN.`);
        }
        continue;
      }

      await UserModel.create({ name: email, email, role: UserRole.ADMIN });
      console.log(`✅ ${email} created as ADMIN.`);
    }

    console.log('🎉 Seed complete. Sign in with these Google accounts to access the manager.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
