import { v2 as cloudinary } from 'cloudinary';

// The SDK reads CLOUDINARY_URL from the environment automatically; `secure`
// forces https URLs for the uploaded assets.
cloudinary.config({ secure: true });

export const isCloudinaryConfigured = Boolean(process.env.CLOUDINARY_URL);

export { cloudinary };
