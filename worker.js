export default {
  async fetch(request) {
    const token = GITHUB_TOKEN; // we will add this in step 3

    const REPO = "euwpc/ewpc.github.io-user-outlooks";
    const FILE_PATH = "outlooks/data/pending.json";

    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const incoming = await request.json(); // { username, title, ... }

    // Step 1: Load current pending.json
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
    });

    const file = await getRes.json();
    const existingList = JSON.parse(atob(file.content));

    // Step 2: Add new item
    incoming.timestamp = Date.now();
    existingList.push(incoming);

    // Step 3: Commit back to GitHub
    const newContent = btoa(JSON.stringify(existingList, null, 2));

    await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({
        message: "Add pending outlook",
        content: newContent,
        sha: file.sha
      })
    });

    return new Response("OK", { status: 200 });
  }
};
