import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const username = process.env.GITHUB_USERNAME;
    const repo = process.env.GITHUB_REPO;

    if (!token || !username || !repo) {
      return NextResponse.json(
        { error: "GitHub configuration is missing.", commits: [] },
        { status: 200 }
      );
    }

    const apiUrl = `https://api.github.com/repos/${username}/${repo}/commits?per_page=50`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "nilay-portfolio",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch commits.", commits: [] },
        { status: 200 }
      );
    }

    const data = await res.json();

    const commits = data.map(
      (c: {
        sha: string;
        commit: {
          message: string;
          author: { name: string; date: string };
        };
      }) => ({
        sha: c.sha.substring(0, 7),
        fullSha: c.sha,
        message: c.commit.message.split("\n")[0],
        fullMessage: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
      })
    );

    return NextResponse.json({ commits });
  } catch (error) {
    console.error("Activity fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity.", commits: [] },
      { status: 200 }
    );
  }
}