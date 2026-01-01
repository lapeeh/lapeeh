# CLI Tools & Scripts

lapeeh Framework comes with various CLI scripts to speed up the development process.

All commands are executed using `npm run <command>`.

> **Info:** Behind the scenes, these `npm run` scripts call the internal framework CLI (`lapeeh`). You can also run these commands directly using `npx lapeeh <command>`.

## Core Commands

Main commands to run the application:

### 1. Initialize Project (`init`)

Creates a new project from scratch.

```bash
npx lapeeh@latest init <project-name> [flags]
```

**Available Flags:**

- `--full`: Initialize with full setup (includes dummy users, roles, permissions).
- `--default`: Initialize with default configuration (PostgreSQL) skipping interactive prompts.
- `--y`: Alias for `--default`.

**Examples:**

```bash
# Interactive Mode
npx lapeeh init my-app

# Full Setup (Recommended for learning)
npx lapeeh init my-app --full

# Fast Setup (Default Postgres)
npx lapeeh init my-app --y
```

### 2. Upgrade Framework (`upgrade`)

Upgrades the lapeeh framework to the latest version in your existing project.

```bash
npx lapeeh upgrade
```

**Features:**

- Automatically updates `package.json` dependencies.
- Syncs core framework files while preserving your custom code.
- **Smart Dependency Handling**: Preserves local `file:` dependencies if you are developing the framework locally, otherwise updates to the latest npm version.

### 3. Development Server (`dev`)

Runs the server in development mode with hot-reload feature.

```bash
npm run dev
# or
npx lapeeh dev
```

### 2. Production Server (`start`)

Runs the server in production mode (ensure it has been built).

```bash
npm run start
# or
npx lapeeh start
```

### 3. Build Project (`build`)

Compiles TypeScript code to JavaScript in the `dist` folder.

```bash
npm run build
# or
npx lapeeh build
```

## Code Generators

Use these commands to create boilerplate files automatically.

### 1. Create Complete Module (`make:module`)

Creates Controller and Route at once.

```bash
npm run make:module <module-name>
```

**Example:** `npm run make:module Product`

Output:

- `src/controllers/productController.ts`
- `src/routes/product.ts`

### 2. Create Controller (`make:controller`)

Only creates a controller file with basic CRUD methods.

```bash
npm run make:controller <controller-name>
```

**Example:** `npm run make:controller Order` (Will create `src/controllers/orderController.ts`)
