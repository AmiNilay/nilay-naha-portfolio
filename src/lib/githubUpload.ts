// src/lib/githubUpload.ts

const DEFAULT_ASSETS_REPO = "my-portfolio-assets";

export async function uploadToGithub(file: File): Promise<string | null> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "AmiNilay"; 
  const GITHUB_REPO = process.env.GITHUB_REPO || DEFAULT_ASSETS_REPO;

  if (!GITHUB_TOKEN) {
    console.error("❌ ERROR: Missing GITHUB_TOKEN in environment variables.");
    return null;
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    // Clean filename: keep alphanumerics, dots, dashes
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "-").toLowerCase();
    const uniqueName = `${Date.now()}-${safeName}`;
    const path = `uploads/${uniqueName}`;

    console.log(`>> Uploading ${uniqueName} to ${GITHUB_USERNAME}/${GITHUB_REPO}...`);

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Upload ${uniqueName}`,
          content: base64Content,
        }),
      }
    );

    if (res.ok) {
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/${path}`;
      console.log("✅ Upload Success:", rawUrl);
      return rawUrl;
    } else {
      console.error("❌ GitHub Error:", await res.text());
      return null;
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
    return null;
  }
}

export async function deleteFromGithub(imageUrl: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  if (!imageUrl || !imageUrl.includes("raw.githubusercontent.com") || !GITHUB_TOKEN) return;

  try {
    // Dynamically extract owner, repo, and file path from raw.githubusercontent.com/{owner}/{repo}/main/{path}
    const match = imageUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/main\/(.+)/);
    
    if (!match || !match[1] || !match[2] || !match[3]) {
      console.warn("⚠️ Invalid GitHub raw URL for deletion:", imageUrl);
      return;
    }

    const owner = match[1];
    const repo = match[2];
    const path = match[3];

    console.log(`>> Deleting file: ${path} from ${owner}/${repo}`);

    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );

    if (!getRes.ok) return; 

    const fileData = await getRes.json();
    const sha = fileData.sha;

    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Delete old asset`,
          sha: sha,
        }),
      }
    );
    console.log("✅ File deleted from GitHub");

  } catch (error) {
    console.error("❌ Delete Error:", error);
  }
}