import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if credentials are set
const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ Cloudinary keys not set in env. Image uploads will fall back to beautiful recipe placeholders.');
}

// Map keywords to gorgeous high-res food images
const foodImageMap: Record<string, string> = {
  pasta: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
  chicken: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&auto=format&fit=crop&q=80',
  breakfast: 'https://images.unsplash.com/photo-1533089860891-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  steak: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
  rice: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  taco: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
};

export const cloudinaryService = {
  /**
   * Uploads an image to Cloudinary. Falls back to a thematic Unsplash placeholder if Cloudinary is unconfigured.
   */
  async uploadImage(fileBuffer: Buffer | string, recipeTitle: string): Promise<string> {
    if (hasCloudinary) {
      try {
        const uploadStr = typeof fileBuffer === 'string' ? fileBuffer : `data:image/png;base64,${fileBuffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(uploadStr, {
          folder: 'ai_recipe_generator',
          resource_type: 'image',
        });
        return result.secure_url;
      } catch (err: any) {
        console.error('Cloudinary upload failed, falling back to placeholder:', err.message);
      }
    }

    // Unsplash Fallback matching based on keywords in the recipe title
    const titleLower = recipeTitle.toLowerCase();
    for (const key of Object.keys(foodImageMap)) {
      if (titleLower.includes(key)) {
        return foodImageMap[key];
      }
    }

    // Default general healthy food image
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80';
  },
};
