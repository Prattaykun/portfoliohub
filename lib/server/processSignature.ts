import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function processSignature(signatureUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      signatureUrl,
      {
        resource_type: "image",
        folder: "signatures",
        public_id: `signature_${Date.now()}`,
        transformation: [
          { effect: "remove_background" },
          { width: 300, height: 100, crop: "fit" },
          { format: "png", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result?.secure_url || "");
      }
    );
  });
}