// /api/deleteExam.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { examId } = req.query;

    if (!examId) {
        return res.status(400).json({ error: 'Missing exam ID' });
    }

    try {
        const deletedExam = await prisma.exam.delete({
            where: { id: Number(examId) },
        });

        return res.status(200).json({ message: 'Exam deleted', exam: deletedExam });
    } catch (error) {
        console.error('Error deleting exam:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
