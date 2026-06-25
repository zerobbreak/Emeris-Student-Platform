import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("@/lib/db/client");
  const { skills, users } = await import("@/lib/db/schema");
  const { hashPassword } = await import("@/lib/utils/password");
  const { seedSkills } = await import("../drizzle/seeds/skills");

  for (const skill of seedSkills) {
    const existing = await db.query.skills.findFirst({
      where: eq(skills.name, skill.name),
    });

    if (!existing) {
      await db.insert(skills).values(skill);
    }
  }

  console.log(`Seeded ${seedSkills.length} skills`);

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Skipping admin seed — SEED_ADMIN_EMAIL/PASSWORD not set");
  } else {
    const normalizedEmail = email.toLowerCase();
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existingAdmin) {
      console.log("Admin user already exists, skipping");
    } else {
      const passwordHash = await hashPassword(password);
      await db.insert(users).values({
        email: normalizedEmail,
        passwordHash,
        name: "Platform Admin",
        role: "admin",
        isOnboarded: true,
      });
      console.log(`Seeded admin user: ${normalizedEmail}`);
    }
  }

  const { seedFeed } = await import("../drizzle/seeds/seedFeed");
  await seedFeed(db);

  console.log("Seeds complete.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
