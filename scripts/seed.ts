import { PrismaClient } from '@prisma/client';
import { projectsData } from '../src/data/projects';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
let prismaArgs = {};
if (connectionString) {
    const adapter = new PrismaNeon({ connectionString });
    prismaArgs = { adapter };
}

const prisma = new (PrismaClient as any)(prismaArgs);

async function main() {
  console.log("Seeding projects...");
  for (const p of projectsData) {
    
    const contentHtml = `
<h2>The Challenge & Bottleneck</h2>
<p>${p.problem}</p>

<h2>Engineering Solution & Architecture</h2>
<p>${p.solution}</p>

<h3>Core Features & Modules</h3>
<ul>
  ${p.features.map(f => `<li>${f}</li>`).join('')}
</ul>

<h3>Measurable Results & ROI</h3>
<ul>
  ${p.results.map(r => `<li>${r}</li>`).join('')}
</ul>
    `;
    
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        client: p.client,
        category: p.category,
        tagline: p.tagline,
        summary: p.summary,
        impact: p.impact,
        techStack: p.techStack,
        content: contentHtml,
        isFeatured: true,
        status: "On Track",
        progress: 100,
        deadline: p.timeline,
      }
    });
    console.log(`Seeded project: ${p.slug}`);
  }
  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
