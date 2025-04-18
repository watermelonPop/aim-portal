import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { userId, requestId, doc_url } = req.body;

    // Validate all required fields
    if (!userId || !requestId || !doc_url) {
        return res.status(400).json({ 
            error: 'Missing required fields: userId, requestId, or doc_url' 
        });
    }

    try {
        // Transaction for atomic operations
        const [formSubmit, updatedRequest] = await prisma.$transaction([
            prisma.form.create({
                data: {
                    name: doc_url.substring(doc_url.lastIndexOf("/") + 1),
                    type: 'REGISTRATION_ELIGIBILITY',
                    submittedDate: new Date(),
                    user: { connect: { id: Number(userId) } },
                    formUrl: doc_url,
                }
            }),
            prisma.request.update({
                where: { id: Number(requestId) },
                data: { documentation: true },
            })
        ]);

        res.status(200).json({ 
            message: 'Documentation updated successfully',
            formId: formSubmit.id,
            requestId: updatedRequest.id
        });

    } catch (err) {
        console.error("❌ Error updating documentation:", err);
        
        // Enhanced error handling
        const errorResponse = {
            error: err.meta?.cause || 'Internal Server Error',
            code: err.code || 'UNKNOWN_ERROR'
        };
        
        res.status(500).json(errorResponse);
    }
}
