const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.siteConfig.upsert({
    where: { id: "1" },
    update: {
      contactEmail: "sb.abcd321@gmail.com",
      contactPhone: "8944899747",
      whatsappNumber: "https://wa.me/8167685731",
      facebookUrl: "https://facebook.com",
      instagramUrl: "https://instagram.com",
      youtubeUrl: "https://youtube.com",
      linkedinUrl: "https://linkedin.com",
      twitterUrl: "https://twitter.com",
    },
    create: {
      id: "1",
      contactEmail: "sb.abcd321@gmail.com",
      contactPhone: "8944899747",
      whatsappNumber: "https://wa.me/8167685731",
      facebookUrl: "https://facebook.com",
      instagramUrl: "https://instagram.com",
      youtubeUrl: "https://youtube.com",
      linkedinUrl: "https://linkedin.com",
      twitterUrl: "https://twitter.com",
    }
  });
  console.log("Database seeded with contact info:", config);
}

main().catch(console.error).finally(() => prisma.$disconnect());
