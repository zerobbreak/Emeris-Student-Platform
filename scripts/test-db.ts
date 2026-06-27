import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { getPublicProfile } = await import("@/lib/db/queries/profile");
  
  const userId = "2f8122c8-18d9-4e81-a359-09d2b8e95d8f";
  const profile = await getPublicProfile(userId, { includeSkills: true });
  
  console.log("Profile Skills length:", profile?.skills?.length);
  console.log("Profile Skills:", JSON.stringify(profile?.skills, null, 2));
}

main().catch(console.error);
