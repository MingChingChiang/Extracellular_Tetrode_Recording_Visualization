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
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 5. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

---
## Done!
Refresh your GitHub repository page, and you should see all your files, including the `README.md` and `CHANGELOG.md`.
