import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import os from "os";


const prisma = new PrismaClient();
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "forms";

export const config = {
  api: {
    bodyParser: false, // We’re using formidable for multipart/form-data
  },
};

// Uploads the file to Azure Blob Storage
async function uploadFileToAzure(fileBuffer, fileName) {
  if (!AZURE_STORAGE_CONNECTION_STRING) throw new Error("Missing Azure connection string");

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(fileBuffer);
  return blockBlobClient.url;
}

export default async function handler(req, res) {
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
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const { userId, type, dueDate } = fields;
    const file = files.file?.[0];

    if (!userId || !type || !file) {
      console.error("Missing required fields:", { userId, type, file });
      return res.status(400).json({ error: "Missing required fields or file." });
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = `${userId}_${Date.now()}_${file.originalFilename}`;
      const formUrl = await uploadFileToAzure(fileBuffer, fileName);

      const newForm = await prisma.form.create({
        data: {
          userId: userId,
          type: type,
          formUrl: formUrl,
          status: "Pending",
          submittedDate: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      return res.status(200).json({ message: "Form uploaded successfully", form: newForm });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Server failed to upload form" });
    }
  });
}
