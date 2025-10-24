import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateMetadataImage = (title: string, description: string) => {
  // Generate dynamic metadata image URL using Cloudinary
  const imageUrl = cloudinary.v2.url("Screenshot_2025-10-24_212856_lt4hdq.png", {
    transformation: [
      {
        width: 1200,
        height: 630,
        crop: "fill",
        background: "rgb:1e293b"
      },
      {
        overlay: {
          font_family: "Arial",
          font_size: 60,
          font_weight: "bold",
          text: title
        },
        color: "#ffffff",
        y: -100
      },
      {
        overlay: {
          font_family: "Arial",
          font_size: 36,
          text: description.substring(0, 100) + (description.length > 100 ? "..." : "")
        },
        color: "#e2e8f0",
        y: 50
      }
    ]
  });

  return imageUrl;
};

export const getCloudinaryUrl = (publicId: string, options: any = {}) => {
  return cloudinary.v2.url(publicId, options);
};