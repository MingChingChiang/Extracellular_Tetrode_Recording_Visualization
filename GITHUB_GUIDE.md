# How to Push to GitHub

Follow these steps to upload your project to GitHub.

## Prerequisites
1.  **Create a Repository on GitHub**:
    - Go to [github.com/new](https://github.com/new).
    - Name it (e.g., `tetrode-visualization`).
    - **Do NOT** check "Initialize with README" (since you already have one).
    - Click **Create repository**.

## Step-by-Step Commands
Open your terminal (Terminal or VS Code Terminal) in this project folder.

> [!TIP]
> **Mac Users**: Your default shell is **zsh** (indicated by a `%` prompt). That is perfect! You do **not** need to switch to bash. The commands below work exactly the same in zsh.
>
> **How to Copy**: Copy **only the text inside the box** (e.g., `git init`). Do not copy the backticks (```) or the word `bash`.

Run these commands one by one:

### 0. Configure Identity (First Time Only)
Tell Git who you are (so your name appears correctly on GitHub):
```bash
git config --global user.name "Ming-Ching Chiang"
git config --global user.email "YOUR_EMAIL@example.com"
```

### 1. Initialize Git
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Commit Changes
```bash
git commit -m "Initial commit: Complete Tetrode Visualization (Phase 23)"
```

### 4. Link to GitHub
*Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual details.*
*(You can copy this exact line from the page GitHub showed you after creating the repo)*
```bash
git remote add origin https://github.com/MingChingChiang/Extracellular_Tetrode_Recording_Visualization.git
```

### 5. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## ⚠️ Troubleshooting: "Authentication Failed"
If you see an error saying **"Password authentication is not supported"**, it means you cannot use your GitHub account password. You must use a **Personal Access Token (Token)** instead.

### How to get a Token:
1.  Go to **GitHub Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
    *   Or click here: [Generate Token](https://github.com/settings/tokens/new)
2.  **Note**: "Tetrode Push" (or anything).
3.  **Expiration**: Set to "No expiration" (for simplicity) or 30 days.
4.  **Select scopes**: Check the box **`repo`** (Full control of private repositories).
5.  Click **Generate token**.
6.  **COPY THE TOKEN** (It starts with `ghp_...`). You won't see it again.

### How to use it:
*   When Terminal asks for `Password for 'https://...@github.com':`
*   **Paste the Token** you just copied.
*   *(Note: You won't see any characters appearing on screen while pasting. That is normal security. Just paste and press Enter.)*

## ⚠️ Troubleshooting: "Updates were rejected"
If you see an error saying **"Updates were rejected because the remote contains work that you do not have locally"**, it usually means you accidentally checked "Initialize with README" or "Add a License" when creating the repo on GitHub.

Since you want your **local computer's code** to be the correct version, you can **Force Push** to overwrite the empty GitHub repo:

```bash
git push -f origin main
```
*(Only do this for the very first push!)*

---
## Done!
Refresh your GitHub repository page, and you should see all your files, including the `README.md` and `CHANGELOG.md`.

## 🔄 How to Update (After making changes)
If you modify files (like adding the image just now), run these 3 commands to update GitHub:

```bash
git add .
git commit -m "Update README with screenshot"
git push -u origin main
```
*(Using `-u origin main` ensures it works even if the connection wasn't saved previously.)*
