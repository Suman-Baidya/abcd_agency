import { db } from './src/lib/prisma';

async function main() {
  const config = await db.siteConfig.upsert({
    where: { id: "1" },
    update: {
      contactEmail: "sb.abcd321@gmail.com",
      contactPhone: "8944899747",
      whatsappNumber: "https://wa.me/8167685731",
      facebookUrl: "https://www.facebook.com/profile.php?id=61593007787293",
      instagramUrl: "https://www.instagram.com/theabcdagency/",
      youtubeUrl: "https://www.youtube.com/channel/UCVPuceJ8stYsxCvcplr3IMA",
      linkedinUrl: "https://www.linkedin.com/company/theabcdagency",
      twitterUrl: "https://x.com/theabcdagency",
      behanceUrl: "https://www.behance.net/abcdcd1",
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

main().catch(console.error);
