const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'pizza-house' },
    include: { website: true }
  });
  console.log('publishedTheme:', org?.website?.publishedTheme);
  console.log('draftTheme:', org?.website?.draftTheme);
  await prisma.$disconnect();
}
check();
