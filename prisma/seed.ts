import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const USERS = [
  { email: "alice@example.com", name: "Alice" },
  { email: "bob@example.com", name: "Bob" },
  { email: "carol@example.com", name: "Carol" },
];

async function main() {
  const users = [];
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    users.push(user);
  }

  const [alice, bob] = users;

  const existingDoc = await prisma.document.findFirst({
    where: { ownerId: alice.id, title: "Welcome to Collab Docs" },
  });

  const doc =
    existingDoc ??
    (await prisma.document.create({
      data: {
        title: "Welcome to Collab Docs",
        content:
          "<h1>Welcome</h1><p>This document is <strong>owned by Alice</strong> and <em>shared with Bob</em>.</p><ul><li>Try editing it</li><li>Try sharing your own doc</li></ul>",
        ownerId: alice.id,
      },
    }));

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: bob.id } },
    update: {},
    create: { documentId: doc.id, userId: bob.id },
  });

  console.log(`Seeded ${users.length} users and 1 demo document (shared with Bob).`);
  users.forEach((u) => console.log(`  - ${u.name} <${u.email}>`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
