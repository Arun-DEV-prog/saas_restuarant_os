import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }
  // file is a Blob in Next.js API routes
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Upload buffer to Cloudinary
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "restaurant-menus" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
  return Response.json({ url: result.secure_url });
}
