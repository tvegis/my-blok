import { getPosts } from "@/lib/posts";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = getPosts().map(({ code, ...rest }) => rest);
  return NextResponse.json(posts);
}
