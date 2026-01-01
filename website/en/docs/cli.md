# CLI Tools & Scripts

lapeeh Framework comes with various CLI scripts to speed up the development process.

All framework CLI commands can be executed using `npx lapeeh <command>`.

> **Info:** Some common commands (like `dev`, `start`, `build`) are also available as `npm run` scripts for convenience.

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

### 4. Run Tests (`tes`)

Runs unit & integration tests using Jest, while automatically running **JSON Server** to keep the test database isolated.

```bash
npx lapeeh tes
# or
npm test
```

- Automatically creates `database.test.json` (isolated from main `database.json`).
- Starts JSON Server on port 3001.
- Runs Jest test suite.

## Code Generators

Use these commands to create boilerplate files automatically.

### 1. Create Complete Module (`make:module`)

Creates Controller, Service, and Route at once in a single module folder.

```bash
npx lapeeh make:module <module-name>
```

**Example:** `npx lapeeh make:module Product`

Output:

- `src/modules/Product/product.controller.ts`
- `src/modules/Product/product.service.ts`
- `src/modules/Product/product.routes.ts`

## Code Quality & Utilities
