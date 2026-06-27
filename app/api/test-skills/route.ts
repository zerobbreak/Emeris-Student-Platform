import { NextResponse } from "next/server";
import { getUserSkillsBoard } from "@/app/actions/skills";

export async function GET() {
  try {
    const skills = await getUserSkillsBoard();
    return NextResponse.json({ skills });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
