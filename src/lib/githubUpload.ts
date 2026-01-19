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

    // Create a unique filename
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const path = `public/uploads/${fileName}`; // Folder inside your repo

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `upload project image: ${fileName}`,
          content: base64Content,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Returns the raw URL that points to the file on GitHub
      return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/${path}`;
    } else {
      console.error("Github API Error:", data);
      return null;
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
}