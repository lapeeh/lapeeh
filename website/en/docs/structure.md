# 🏗️ Project Structure

lapeeh Framework is designed to be **intuitive**. We separate your application code (_User Space_) from the framework engine (_Core_), so you can focus on building features without being distracted by system complexity.

## 🗺️ Navigation Map

Here is a mental map to understand lapeeh folders:

| Folder         | Icon | Function                                                                | Status          |
| :------------- | :--: | :---------------------------------------------------------------------- | :-------------- |
| **`src/`**     |  🏠  | **YOUR APP CODE**. You work here every day.                             | **Must Edit**   |
| **`scripts/`** |  🤖  | **Automation Assistants**. Scripts for release, module generation, etc. | **Can Edit**    |
| **`bin/`**     |  🚀  | **CLI Tools**. Entry point for `npx lapeeh` commands.                   | **Rarely Edit** |
| **`lib/`**     |  ⚙️  | **Framework Engine**. Core server & database logic.                     | **DO NOT Edit** |

---

## 1. 🏠 Folder `src/` (User Space)

This is your "home". 99% of new feature code will be written here.

### `src/modules/` (Modular Architecture)

lapeeh uses a **Modular** approach. One feature = One folder.

- **Example**: `src/modules/Auth/` folder contains:
  - `auth.controller.ts`: Handles request/response.
  - `auth.service.ts`: Business logic.
  - `auth.routes.ts`: Module routing definition.
- **Benefit**: Code is neat, easy to find, and easy to delete if the feature is no longer used.

### `src/routes/`

Your main API gateway.

- `index.ts`: Aggregates all routes from various modules (e.g., `/api/auth` mapped to Auth module).
- Place to define global middleware for specific route groups.

### `src/config/`

Application settings center.

- `app.ts`: Global configuration.
- `cors.ts`: Domain access security.

---

## 2. 🤖 Folder `scripts/` (Robot Assistants)

Don't do boring things manually! lapeeh provides robots here:

- **`release.js`**: **Super Script** for releasing new versions.
  - ✨ Automatic version bump (package.json).
  - 📝 **Auto-Blog**: Automatically creates release articles from Git Commit history.
  - 🔄 **Auto-Sync**: Synchronizes documentation to the website.
  - 🚀 Push to Git & Publish to NPM in one command.
- **`make-module.js`**: Generator to create new module folder structures instantly.

---

## 3. 🚀 Folder `bin/` (CLI & Update)

This folder handles `npx lapeeh` terminal commands.

- Provides **Auto-Update Check** feature when you run `npm run dev`.
- Handles `upgrade` command to sync your project with the latest lapeeh version without breaking your code.

---

## 4. ⚙️ Folder `lib/` (The Core)

lapeeh's "Engine Room". Contains Express setup, Database connection, Logger, and basic Middleware.

> ⚠️ **Warning**: Changing the contents of this folder can make the application difficult to update to the next lapeeh version.

---

## 📄 Other Important Files

- **`.env`**: **Secret Keys**. Store DB passwords and API Keys here. (Do not upload to Git!)
- **`package.json`**: List of your project's library "shopping list".
- **`ecosystem.config.js`**: Ready to deploy? This file configures how the application runs on a production server (VPS) using PM2.
