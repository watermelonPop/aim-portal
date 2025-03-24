import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";
import fs from "fs";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "forms";

// Function to upload a file buffer to Azure Blob Storage
async function uploadFile(fileBuffer, fileName) {
    console.log("Storage Connection String:", AZURE_STORAGE_CONNECTION_STRING); // Debugging
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING!");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(fileBuffer);
    return blockBlobClient.url;
}


export default async function handler(req, res) {
        console.log("STARTING DOC UPLOAD");
        console.log("Request Headers:", req.headers);
    
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method Not Allowed" });
        }
    
        const form = formidable({
                multiples: false, // Allow only one file for now
                uploadDir: "/tmp", // Optional: Define a temp upload location
                keepExtensions: true, // Keep file extension
        });
        console.log("FORM: ", form);
    
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Error parsing form:", err);
                return res.status(500).json({ error: "File upload failed" });
            }
    
            if (!files.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }
    
            try {
                const file = files.file[0]; // Adjust indexing if needed
                const fileBuffer = fs.readFileSync(file.filepath);
                const fileName = file.originalFilename;
    
                const fileUrl = await uploadFile(fileBuffer, fileName);
                return res.status(200).json({ url: fileUrl });
            } catch (error) {
                console.error("Upload error:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        });
}

// Disable bodyParser for Next.js API Routes (since we're using formidable)
export const config = {
        api: {
        bodyParser: false,
        },
};