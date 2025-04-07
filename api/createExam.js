import { PrismaClient } from '@prisma/client';
const { BlobServiceClient } = require("@azure/storage-blob");
const formidable = require("formidable");
const fs = require("fs");

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "forms";

const prisma = new PrismaClient();

async function getRandomAdvisorId() {
  const advisors = await prisma.advisor.findMany({
    where: { role: "Testing_Staff" },
    select: { userId: true }
  });

  if (advisors.length === 0) {
    throw new Error("No advisors with role Testing_Staff found");
  }

  const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];
  return randomAdvisor.userId;
}

async function uploadFile(fileBuffer, fileName) {
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    if (!files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const file = files.file[0];
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = file.originalFilename;
      const fileUrl = await uploadFile(fileBuffer, fileName);

      // Parse fields
      const { name, date, location, accommodations, studentIds, courseId } = fields;
      const examName = name[0];
      const examDate = new Date(date[0]);
      const examLocation = location[0];
      const accommodationsArray = JSON.parse(accommodations[0] || "[]");
      const arrStudentIds = studentIds[0].split(",").map(id => Number(id));
      const parsedCourseId = Number(courseId[0]);

      const advisorId = await getRandomAdvisorId();

      // Create one exam per student
      const newExams = await Promise.all(
        arrStudentIds.map(studentId =>
          prisma.exam.create({
            data: {
              name: examName,
              date: examDate,
              location: examLocation,
              examUrl: fileUrl,
              accommodations: accommodationsArray,
              studentIds: [studentId], // ✅ One student per record
              courseId: parsedCourseId,
              advisorId: advisorId,
            },
          })
        )
      );

      res.status(201).json(newExams); // ✅ Return all new exams
    } catch (error) {
      console.error("Error creating exams:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
