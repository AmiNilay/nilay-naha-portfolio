export async function uploadToGithub(file: File): Promise<string | null> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
    console.error("GitHub credentials missing in .env.local");
    return null;
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const path = `public/uploads/${fileName}`;

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `upload hero image: ${fileName}`,
          content: base64Content,
        }),
      }
    );

    if (response.ok) {
      return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/${path}`;
    } else {
      console.error("Github Upload Error");
      return null;
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
}

// --- NEW DELETE FUNCTION ---
export async function deleteFromGithub(imageUrl: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  try {
    // 1. Extract the file path from the raw URL
    // URL format: https://raw.githubusercontent.com/USER/REPO/main/public/uploads/filename.jpg
    const pathParts = imageUrl.split("/main/");
    if (pathParts.length < 2) return;
    const path = pathParts[1]; // "public/uploads/filename.jpg"

    // 2. Get the file's SHA (Hash) required for deletion
    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    
    if (!getRes.ok) return;
    const fileData = await getRes.json();
    const sha = fileData.sha;

    // 3. Delete the file
    await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `delete old hero image`,
          sha: sha,
        }),
      }
    );
    console.log("Old image deleted from GitHub");
  } catch (error) {
    console.error("Delete Error:", error);
  }
}