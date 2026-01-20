// src/lib/githubUpload.ts

export async function uploadToGithub(file: File): Promise<string | null> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
    console.error("❌ GitHub credentials missing in .env.local");
    return null;
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    // Generate unique filename to avoid cache collisions
    // e.g., "171562999-my-image.png"
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const path = `public/uploads/${uniqueName}`;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload ${uniqueName}`,
          content: base64Content,
        }),
      }
    );

    if (res.ok) {
      // Return the Raw URL
      return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/${path}`;
    } else {
      console.error("❌ GitHub Upload Failed:", await res.text());
      return null;
    }
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return null;
  }
}

export async function deleteFromGithub(imageUrl: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!imageUrl || !imageUrl.includes("githubusercontent")) return;

  try {
    // 1. EXTRACT PATH from the raw URL
    // Matches: https://raw.githubusercontent.com/USER/REPO/main/(captured_path)
    const regex = new RegExp(`raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/(.*)`);
    const match = imageUrl.match(regex);
    
    if (!match || !match[1]) {
      console.error("❌ Could not parse GitHub path from URL:", imageUrl);
      return;
    }

    const path = match[1]; // e.g. "public/uploads/123456-image.png"
    console.log(`>> Attempting to delete: ${path}`);

    // 2. GET SHA (Required to delete a file on GitHub)
    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    if (!getRes.ok) {
      console.warn("⚠️ File not found on GitHub (already deleted?):", path);
      return;
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;

    // 3. DELETE FILE
    const deleteRes = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete old asset`,
          sha: sha,
        }),
      }
    );

    if (deleteRes.ok) {
      console.log("✅ Successfully deleted old file from GitHub");
    } else {
      console.error("❌ Failed to delete file:", await deleteRes.text());
    }
  } catch (error) {
    console.error("❌ Delete Error:", error);
  }
}