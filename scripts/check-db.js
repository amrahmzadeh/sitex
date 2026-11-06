const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const site = await prisma.organization.findUnique({
    where: { slug: 'pizza-house' },
    include: { website: true, siteContents: true }
  });
  console.log('Site slug:', site.slug);
  console.log('Theme name:', site.theme);
  console.log('Website themeConfig:', JSON.stringify(site.website?.themeConfig, null, 2));
  console.log('SiteContents:', JSON.stringify(site.siteContents, null, 2));
  await prisma.$disconnect();
}
check();
