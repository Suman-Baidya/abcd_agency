import crypto from "crypto";

export async function getCloudinarySignature(params: Record<string, string>) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) throw new Error("Missing CLOUDINARY_API_SECRET");

  // Sort keys
  const keys = Object.keys(params).sort();
  const query = keys.map(key => `${key}=${params[key]}`).join("&");
  
  const signature = crypto.createHash("sha1").update(query + apiSecret).digest("hex");
  return signature;
}

export async function uploadFileToCloudinary(file: File, folder: string = "abcd_agency/branding"): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  
  if (!cloudName || !apiKey) {
    throw new Error("Missing Cloudinary configuration");
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  
  const params = {
    folder,
    timestamp,
  };
  
  const signature = await getCloudinarySignature(params);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to upload to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
}
