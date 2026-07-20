// src/lib/githubUpload.ts

export async function uploadToGithub(file: File): Promise<string | null> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME; 
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
    console.error("❌ ERROR: Missing Env Vars in Vercel.");
    console.error(`Token: ${!!GITHUB_TOKEN}, User: ${GITHUB_USERNAME}, Repo: ${GITHUB_REPO}`);
    return null;
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    // 🟢 ENHANCED: Strips out all special characters except dots and dashes to keep URLs clean
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "-").toLowerCase();
    const uniqueName = `${Date.now()}-${safeName}`;
    const path = `public/uploads/${uniqueName}`;

    console.log(`>> Uploading ${uniqueName} to ${GITHUB_USERNAME}/${GITHUB_REPO}...`);

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
  const GITHUB_OWNER = process.env.GITHUB_OWNER || process.env.GITHUB_USERNAME;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!imageUrl || !imageUrl.includes("githubusercontent")) return;

  try {
    const regex = new RegExp(`raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/(.*)`);
    const match = imageUrl.match(regex);
    
    if (!match || !match[1]) {
      console.warn("⚠️ Invalid GitHub URL for deletion:", imageUrl);
      return;
    }

    const path = match[1]; 
    console.log(`>> Deleting file: ${path}`);

    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    if (!getRes.ok) return; 

    const fileData = await getRes.json();
    const sha = fileData.sha;

    await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
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
    console.log("✅ File deleted from GitHub");

  } catch (error) {
    console.error("❌ Delete Error:", error);
  }
}