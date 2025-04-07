import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";
import fs from "fs";
import os from "os";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "forms";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Uploads file to Azure
async function uploadFileToAzure(fileBuffer, fileName) {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Missing Azure connection string");
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(fileBuffer);
  return blockBlobClient.url;
}

export default async function handler(req, res) {
  console.log("📤 STARTING DOC UPLOAD");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({
    multiples: false,
    uploadDir: os.tmpdir(),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Form parsing error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const file = files.file?.[0];

    // Extract and validate userId from fields
    const userIdRaw = fields.userId;
    const userId = Array.isArray(userIdRaw) ? parseInt(userIdRaw[0], 10) : parseInt(userIdRaw, 10);

    if (!file || isNaN(userId)) {
      console.error("❌ Missing required fields:", { userId, file });
      return res.status(400).json({ error: "Missing or invalid userId or file." });
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = `${userId}_${Date.now()}_${file.originalFilename}`;
      const fileUrl = await uploadFileToAzure(fileBuffer, fileName);

      console.log("✅ File uploaded to Azure:", fileUrl);

      // Create a new form entry in the database
      const newForm = await prisma.form.create({
        data: {
          userId: userId,
          name: file.originalFilename || "Uploaded Document",
          type: "ACADEMIC_CLASSROOM",
          formUrl: fileUrl,
          status: "PENDING",
          submittedDate: new Date(),
          dueDate: null,
        },
      });

      return res.status(200).json({
        message: "Upload successful and form saved",
        url: fileUrl,
        form: newForm,
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
      return res.status(500).json({ error: "Failed to upload or save form." });
    }
  });
}
