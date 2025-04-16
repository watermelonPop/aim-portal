require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  //console.log("CREATE ACCOUNT START");
  if (req.method === 'POST') {
    const {email, name, role} = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ error: 'email, name, and role are required' });
    }

    try {
      const account = await prisma.account.create({
              data: {
                email: email,
                name: name,
                role: role,
              },
      });

      //console.log("ACCOUNT HERE: ", account);

      const settings = await prisma.settings.create({
        data: {
          account: {
            connect: {id: Number(account.id)}
          }
        }
      });
      
      //console.log("SETTINGS FIX COMPLETE: ",settings);

      ////console.log(account);

      if (account && settings) {
        res.status(200).json({ success: true, account: account });
      } else {
        res.status(200).json({ success: false });
      }
    } catch (error) {
      console.error('Error creating account:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};