require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  //console.log("CREATE REQUEST START");
  if (req.method === 'POST') {
    let {userId, notes, documentation, doc_url} = req.body;
    if (!userId || !notes || documentation === null) {
      return res.status(400).json({ error: 'userId, notes, documentation are required' });
    }
    //console.log(userId, notes, documentation);

    if(doc_url === null){
      documentation = false;
    }

    try {
      const result = await prisma.advisor.findFirst({
        orderBy: {
          students: {
            _count: 'asc',
          },
        },
        include: {
          _count: {
            select: { students: true }
          }
        }
      });

      if(result){
        const request = await prisma.request.create({
          data: {
            notes: notes,
            documentation: documentation,
            user: {
              connect: { userId: Number(userId) }, // Link to an existing user
            },
            advisor: {
              connect: {userId: Number(result.userId)}
            }
          },
        });

        if(documentation === true){
          const formSubmit = await prisma.form.create({
            data: {
              name: doc_url.substring(doc_url.lastIndexOf("/") + 1),
              type: 'REGISTRATION_ELIGIBILITY',
              submittedDate: new Date(),
              user: {
                connect: { id: Number(userId) }, // Link to an existing user
              },
              formUrl: doc_url,
            }
          });
          if (formSubmit && request) {
            res.status(200).json({ success: true, request: request });
          } else {
            res.status(200).json({ success: false });
          }
        }else{
          if (request) {
            res.status(200).json({ success: true, request: request });
          } else {
            res.status(200).json({ success: false });
          }
        }
      }else{
        res.status(200).json({ success: false });
      }
    } catch (error) {
      console.error('Error creating request:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};