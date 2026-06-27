"use server";

import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function getAllResources() {
  const session = await requireSession();
  
  const allResources = await db.query.resources.findMany({
    with: {
      skill: true,
    },
    orderBy: (resources, { desc }) => [desc(resources.createdAt)],
  });

  return allResources;
}
