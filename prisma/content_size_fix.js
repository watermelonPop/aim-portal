const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateSettings() {
  // Set these to the correct values you want to use.
  const newFontSize = 14;       // Replace with your desired font_size
  const newLineHeight = 5000;   // Replace with your desired line_height
  const newLetterSpacing = 0;   // Replace with your desired letter_spacing

  // Update all records in the Settings table with the new values
  const result = await prisma.settings.updateMany({
    data: {
      font_size: newFontSize,
      line_height: newLineHeight,
      letter_spacing: newLetterSpacing,
    },
  });

  console.log(`Updated ${result.count} settings records.`);
}

updateSettings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
