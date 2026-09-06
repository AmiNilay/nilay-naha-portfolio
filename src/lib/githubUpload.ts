const GITHUB_API = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;
  const repo = process.env.GITHUB_REPO;

  if (!token || !username || !repo) {
    throw new Error(
      "Missing GitHub environment variables. Ensure GITHUB_TOKEN, GITHUB_USERNAME, and GITHUB_REPO are set."
    );
  }

  return { token, username, repo };
}

/**
 * Sanitizes a filename for safe use in URLs and the GitHub API.
 */
function sanitizeFileName(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop() : "png";
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 60);

  return `${Date.now()}-${base}.${ext}`;
}

/**
 * Uploads a file to a dedicated GitHub repository and returns its raw CDN URL.
 *
 * Accepts a File object (from FormData) directly.
 * Stores files under `uploads/` in the root of the repository.
 *
 * Returns: https://raw.githubusercontent.com/{username}/{repo}/main/uploads/{filename}
 */
export async function uploadToGithub(file: File): Promise<string | null> {
  try {
    const { token, username, repo } = getConfig();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    const fileName = sanitizeFileName(file.name);
    const path = `uploads/${fileName}`;

    const res = await fetch(
      `${GITHUB_API}/repos/${username}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Upload ${fileName}`,
          content: base64Content,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("GitHub upload failed:", res.status, errorText);
      return null;
    }

    const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}`;
    return rawUrl;
  } catch (error) {
    console.error("GitHub upload error:", error);
    return null;
  }
}

/**
 * Deletes a file from the GitHub repository using its raw URL.
 * Only processes URLs that match the configured repository.
 */
export async function deleteFromGithub(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes("raw.githubusercontent.com")) return;

  try {
    const { token, username, repo } = getConfig();

    const pattern = new RegExp(
      `raw\\.githubusercontent\\.com/${username}/${repo}/main/(.+)`
    );
    const match = imageUrl.match(pattern);

    if (!match || !match[1]) {
      console.warn("URL does not match configured repo, skipping delete:", imageUrl);
      return;
    }

    const path = match[1];

    // Get the file's SHA (required for deletion)
    const getRes = await fetch(
      `${GITHUB_API}/repos/${username}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!getRes.ok) {
      console.warn("File not found on GitHub, skipping delete:", path);
      return;
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;

    const deleteRes = await fetch(
      `${GITHUB_API}/repos/${username}/${repo}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Delete ${path.split("/").pop()}`,
          sha,
        }),
      }
    );

    if (!deleteRes.ok) {
      console.error("GitHub delete failed:", deleteRes.status, await deleteRes.text());
    }
  } catch (error) {
    console.error("GitHub delete error:", error);
  }
}