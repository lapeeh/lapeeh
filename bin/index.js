#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const readline = require("readline");

// --- Helper Functions for Animation ---

async function spin(text, fn) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  process.stdout.write(`\x1b[?25l`); // Hide cursor

  const interval = setInterval(() => {
    process.stdout.write(`\r\x1b[36m${frames[i]} ${text}\x1b[0m`);
    i = (i + 1) % frames.length;
  }, 80);

  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r\x1b[32m✔ ${text}\x1b[0m\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r\x1b[31m✖ ${text}\x1b[0m\n`);
    throw e;
  } finally {
    process.stdout.write(`\x1b[?25h`); // Show cursor
  }
}

function runCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    // Use spawn to capture output or run silently
    // Using shell: true to handle cross-platform command execution
    const child = spawn(cmd, { cwd, shell: true, stdio: "pipe" });
    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.stderr.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Command failed with code ${code}\n${output}`));
    });
  });
}

const args = process.argv.slice(2);
const command = args[0];

// Telemetry Logic
async function sendTelemetry(cmd, errorInfo = null) {
  try {
    const os = require("os");

    const payload = {
      command: cmd,
      nodeVersion: process.version,
      osPlatform: os.platform(),
      osRelease: os.release(),
      timestamp: new Date().toISOString(),
    };

    if (errorInfo) {
      payload.error = errorInfo.message;
      payload.stack = errorInfo.stack;
    }

    // Add version to payload
    try {
      const pkg = require(path.join(__dirname, "../package.json"));
      payload.cliVersion = pkg.version;
    } catch (e) {
      payload.cliVersion = "unknown";
    }

    const data = JSON.stringify(payload);

    // Parse URL from env or use default
    const apiUrl =
      process.env.lapeeh_API_URL || "https://lapeeh.vercel.app/api/telemetry";
    const url = new URL(apiUrl);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? require("https") : require("http");

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 2000, // Slightly longer for crash reports
    };

    const req = client.request(options, (res) => {
      res.resume();
    });

    req.on("error", (e) => {
      // Silent fail
    });

    req.write(data);
    req.end();
  } catch (e) {
    // Silent fail
  }
}

// Global Error Handler for Crash Reporting
process.on("uncaughtException", async (err) => {
  console.error("❌ Unexpected Error:", err);
  console.log("📝 Sending crash report...");
  try {
    sendTelemetry(command || "unknown", err);

    // Give it a moment to send
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  } catch (e) {
    process.exit(1);
  }
});

function showHelp() {
  console.log("\n\x1b[36m   L A P E E H   F R A M E W O R K   C L I\x1b[0m\n");
  console.log("Usage: npx lapeeh <command> [options]\n");
  console.log("Commands:");
  console.log("  create <name>   Create a new lapeeh project");
  console.log("  dev             Start development server (with update check)");
  console.log("  start           Start production server");
  console.log("  build           Build the project for production");
  console.log(
    "  upgrade         Upgrade project files to match framework version"
  );
  console.log(
    "  make:module <name> Create a new module (controller, routes, etc.)"
  );
  console.log("  test            Run tests (Unit & Integration)");
  console.log("  help            Show this help message");
  console.log("\nOptions:");
  console.log(
    "  --full          Create project with full example (auth, users, etc)"
  );
  console.log("  -y, --defaults  Skip prompts and use defaults");
  console.log("  -h, --help      Show this help message");
  console.log("\nExamples:");
  console.log("  npx lapeeh my-app");
  console.log("  npx lapeeh create my-app --full");
  console.log("  npx lapeeh dev");
  console.log("\n");
}

// Handle Help or No Args
if (!command || ["help", "--help", "-h"].includes(command)) {
  showHelp();
  sendTelemetry("help");
  process.exit(0);
}

// Send telemetry for every command (only if not crashing immediately)
sendTelemetry(command);

switch (command) {
  case "dev":
    (async () => {
      await runDev();
    })();
    break;
  case "start":
    (async () => {
      await runStart();
    })();
    break;
  case "build":
    (async () => {
      await runBuild();
    })();
    break;
  case "upgrade":
    (async () => {
      await upgradeProject();
    })();
    break;
  case "tes":
  case "test":
    const dbFile = "database.test.json";
    if (!fs.existsSync(dbFile)) {
      if (fs.existsSync("database.json")) {
        fs.copyFileSync("database.json", dbFile);
      } else {
        fs.writeFileSync(dbFile, JSON.stringify({ users: [] }));
      }
    }

    console.log("🚀 Starting JSON Server on port 3001...");
    const jsonServer = spawn(
      "npx",
      ["json-server", "--watch", dbFile, "--port", "3001"],
      {
        stdio: "inherit",
        shell: true,
        cwd: process.cwd(),
      }
    );

    console.log("🧪 Running tests...");
    const runTest = spawn("npm", ["test"], {
      stdio: "inherit",
      shell: true,
      cwd: process.cwd(),
      env: { ...process.env, DB_FILE: dbFile },
    });

    runTest.on("close", (code) => {
      console.log("🛑 Stopping JSON Server...");
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", jsonServer.pid, "/f", "/t"]);
      } else {
        jsonServer.kill();
      }
      process.exit(code);
    });
    break;
  case "make:module":
  case "module":
    const moduleName = args[1];
    if (!moduleName) {
      console.error("❌ Please specify the module name.");
      console.error("   Usage: npx lapeeh module <ModuleName>");
      process.exit(1);
    }
    createModule(moduleName);
    break;
  case "init":
  case "create":
    createProject(true);
    break;
  default:
    createProject(false);
    break;
}

async function checkUpdate() {
  try {
    const pkg = require(path.join(__dirname, "../package.json"));
    const currentVersion = pkg.version;

    // Fetch latest version from npm registry
    const latestVersion = await new Promise((resolve) => {
      const https = require("https");
      const req = https.get(
        "https://registry.npmjs.org/lapeeh/latest",
        {
          headers: { "User-Agent": "lapeeh-CLI" },
          timeout: 1500, // 1.5s timeout
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              resolve(json.version);
            } catch (e) {
              resolve(null);
            }
          });
        }
      );

      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });
    });

    if (latestVersion && latestVersion !== currentVersion) {
      const currentParts = currentVersion.split(".").map(Number);
      const latestParts = latestVersion.split(".").map(Number);

      let isOutdated = false;
      for (let i = 0; i < 3; i++) {
        if (latestParts[i] > currentParts[i]) {
          isOutdated = true;
          break;
        } else if (latestParts[i] < currentParts[i]) {
          break;
        }
      }

      if (isOutdated) {
        console.log("\n");
        const boxWidth = 60;
        const borderColor = "\x1b[33m";
        const resetColor = "\x1b[0m";
        const titleColor = "\x1b[1m";
        const redColor = "\x1b[31m";
        const greenColor = "\x1b[32m";
        const cyanColor = "\x1b[36m";

        const horizontalLine = "─".repeat(boxWidth - 2);
        const topBorder = `${borderColor}┌${horizontalLine}┐${resetColor}`;
        const bottomBorder = `${borderColor}└${horizontalLine}┘${resetColor}`;

        const pad = (text) => {
          // Remove ANSI codes to calculate actual length
          const visibleLength = text.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          ).length;
          const padding = Math.max(0, boxWidth - 4 - visibleLength);
          return text + " ".repeat(padding);
        };

        console.log(topBorder);
        console.log(
          `${borderColor}│${resetColor}  ${pad(
            `${titleColor}Update available!${resetColor} ${redColor}${currentVersion}${resetColor} → ${greenColor}${latestVersion}${resetColor}`
          )}  ${borderColor}│${resetColor}`
        );
        console.log(
          `${borderColor}│${resetColor}  ${pad(
            `Run ${cyanColor}npm install lapeeh@latest${resetColor} to update`
          )}  ${borderColor}│${resetColor}`
        );
        console.log(
          `${borderColor}│${resetColor}  ${pad(
            `Then run ${cyanColor}npx lapeeh upgrade${resetColor} to sync files`
          )}  ${borderColor}│${resetColor}`
        );
        console.log(bottomBorder);
        console.log("\n");
      }
    }
  } catch (e) {
    // Ignore errors during update check
  }
}

async function runDev() {
  console.log("🚀 Starting lapeeh in development mode...");
  await checkUpdate();
  try {
    const tsNodePath = require.resolve("ts-node/register");
    const tsConfigPathsPath = require.resolve("tsconfig-paths/register");

    // Resolve bootstrap file
    // 1. Try to find it in the current project's node_modules (preferred)
    const localBootstrapPath = path.join(
      process.cwd(),
      "node_modules/lapeeh/lib/bootstrap.ts"
    );

    // 2. Fallback to relative to this script (if running from source or global cache without local install)
    const fallbackBootstrapPath = path.resolve(
      __dirname,
      "../lib/bootstrap.ts"
    );

    const bootstrapPath = fs.existsSync(localBootstrapPath)
      ? localBootstrapPath
      : fallbackBootstrapPath;

    // We execute a script that requires ts-node to run lib/bootstrap.ts
    // Use JSON.stringify to properly escape paths for the shell command
    const nodeArgs = `-r ${JSON.stringify(tsNodePath)} -r ${JSON.stringify(
      tsConfigPathsPath
    )} ${JSON.stringify(bootstrapPath)}`;
    const isWin = process.platform === "win32";

    let cmd;
    if (isWin) {
      // On Windows, escape inner quotes
      const escapedArgs = nodeArgs.replace(/"/g, '\\"');
      cmd = `npx nodemon --watch src --watch lib --ext ts,json --exec "node ${escapedArgs}"`;
    } else {
      // On Linux/Mac, use single quotes for the outer wrapper
      cmd = `npx nodemon --watch src --watch lib --ext ts,json --exec 'node ${nodeArgs}'`;
    }

    execSync(cmd, { stdio: "inherit" });
  } catch (error) {
    // Ignore error
  }
}

async function runStart() {
  await spin("Starting lapeeh production server...", async () => {
    await new Promise((r) => setTimeout(r, 1500)); // Simulate startup checks animation
  });

  let bootstrapPath;
  try {
    const projectNodeModules = path.join(process.cwd(), "node_modules");
    const lapeehDist = path.join(
      projectNodeModules,
      "lapeeh",
      "dist",
      "lib",
      "bootstrap.js"
    );
    const lapeehLib = path.join(
      projectNodeModules,
      "lapeeh",
      "lib",
      "bootstrap.js"
    );

    if (fs.existsSync(lapeehDist)) {
      bootstrapPath = lapeehDist;
    } else if (fs.existsSync(lapeehLib)) {
      bootstrapPath = path.resolve(__dirname, "../lib/bootstrap.js");
      if (!fs.existsSync(bootstrapPath)) {
        bootstrapPath = path.resolve(__dirname, "../dist/lib/bootstrap.js");
      }
    }

    const frameworkBootstrap = require("../lib/bootstrap");
    frameworkBootstrap.bootstrap();
    return;
  } catch (e) {}

  const possiblePaths = [
    path.join(__dirname, "../lib/bootstrap.js"),
    path.join(__dirname, "../dist/lib/bootstrap.js"),
    path.join(process.cwd(), "node_modules/lapeeh/lib/bootstrap.js"),
  ];

  bootstrapPath = possiblePaths.find((p) => fs.existsSync(p));

  if (!bootstrapPath) {
    console.error("❌ Could not find lapeeh bootstrap file.");
    console.error("   Searched in:", possiblePaths);
    process.exit(1);
  }

  let cmd;
  if (bootstrapPath.endsWith(".ts")) {
    let tsNodePath;
    let tsConfigPathsPath;

    try {
      const projectNodeModules = path.join(process.cwd(), "node_modules");
      tsNodePath = require.resolve("ts-node/register", {
        paths: [projectNodeModules, __dirname],
      });
      tsConfigPathsPath = require.resolve("tsconfig-paths/register", {
        paths: [projectNodeModules, __dirname],
      });
    } catch (e) {
      try {
        tsNodePath = require.resolve("ts-node/register");
        tsConfigPathsPath = require.resolve("tsconfig-paths/register");
      } catch (e2) {
        console.warn("⚠️  Could not resolve ts-node/register. Trying npx...");
      }
    }

    if (tsNodePath && tsConfigPathsPath) {
      const script = `require(${JSON.stringify(bootstrapPath)}).bootstrap()`;
      cmd = `node -r ${JSON.stringify(tsNodePath)} -r ${JSON.stringify(
        tsConfigPathsPath
      )} -e ${JSON.stringify(script)}`;
    } else {
      const script = `require(${JSON.stringify(bootstrapPath)}).bootstrap()`;
      cmd = `npx ts-node -r tsconfig-paths/register -e ${JSON.stringify(
        script
      )}`;
    }
  } else {
    const script = `require(${JSON.stringify(bootstrapPath)}).bootstrap()`;
    cmd = `node -e ${JSON.stringify(script)}`;
  }

  execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
}

function runBuild() {
  console.log("🛠️  Building lapeeh project...");

  try {
    execSync(
      "npx tsc -p tsconfig.build.json && npx tsc-alias -p tsconfig.build.json",
      { stdio: "inherit" }
    );
  } catch (e) {
    console.error("❌ Build failed.");
    process.exit(1);
  }

  console.log("✅ Build complete.");
}

async function upgradeProject() {
  const currentDir = process.cwd();
  const templateDir = path.join(__dirname, "..");

  console.log(`🚀 Upgrading lapeeh project in ${currentDir}...`);

  const packageJsonPath = path.join(currentDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      "❌ No package.json found. Are you in the root of a lapeeh project?"
    );
    process.exit(1);
  }

  const filesToSync = [
    "lib",
    "docker-compose.yml",
    ".env.example",
    ".vscode",
    "tsconfig.json",
    "README.md",
    "ecosystem.config.js",
    "src/redis.ts",
  ];

  const scriptsDir = path.join(currentDir, "scripts");
  if (fs.existsSync(scriptsDir)) {
    console.log(`🗑️  Removing obsolete directory: ${scriptsDir}`);
    fs.rmSync(scriptsDir, { recursive: true, force: true });
  }

  const updateStats = {
    updated: [],
    created: [],
    removed: [],
  };

  function syncDirectory(src, dest, clean = false) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const srcEntries = fs.readdirSync(src, { withFileTypes: true });
    const srcEntryNames = new Set();

    for (const entry of srcEntries) {
      srcEntryNames.add(entry.name);
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      const relativePath = path.relative(currentDir, destPath);

      if (entry.isDirectory()) {
        syncDirectory(srcPath, destPath, clean);
      } else {
        let shouldCopy = true;

        if (fs.existsSync(destPath)) {
          const srcContent = fs.readFileSync(srcPath);
          const destContent = fs.readFileSync(destPath);
          if (srcContent.equals(destContent)) {
            shouldCopy = false;
          } else {
            updateStats.updated.push(relativePath);
          }
        } else {
          updateStats.created.push(relativePath);
        }

        if (shouldCopy) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    if (clean) {
      const destEntries = fs.readdirSync(dest, { withFileTypes: true });
      for (const entry of destEntries) {
        if (!srcEntryNames.has(entry.name)) {
          const destPath = path.join(dest, entry.name);
          const relativePath = path.relative(currentDir, destPath);

          console.log(`🗑️  Removing obsolete file/directory: ${destPath}`);
          updateStats.removed.push(relativePath);

          if (entry.isDirectory()) {
            fs.rmSync(destPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(destPath);
          }
        }
      }
    }
  }

  for (const item of filesToSync) {
    const srcPath = path.join(templateDir, item);
    const destPath = path.join(currentDir, item);
    const relativePath = item; // Since item is relative to templateDir/currentDir

    if (fs.existsSync(srcPath)) {
      const stats = fs.statSync(srcPath);
      if (stats.isDirectory()) {
        console.log(`🔄 Syncing directory ${item}...`);
        syncDirectory(srcPath, destPath, item === "lib");
      } else {
        console.log(`🔄 Checking file ${item}...`);
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        let shouldCopy = true;
        if (fs.existsSync(destPath)) {
          const srcContent = fs.readFileSync(srcPath);
          const destContent = fs.readFileSync(destPath);
          if (srcContent.equals(destContent)) {
            shouldCopy = false;
          } else {
            updateStats.updated.push(relativePath);
          }
        } else {
          updateStats.created.push(relativePath);
        }

        if (shouldCopy) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  }

  console.log("📝 Updating package.json...");
  const currentPackageJson = require(packageJsonPath);

  // Capture original dependency before merging
  const originallapeehDep =
    currentPackageJson.dependencies &&
    currentPackageJson.dependencies["lapeeh"];

  const templatePackageJson = require(path.join(templateDir, "package.json"));

  // Define scripts to remove (those that depend on the scripts folder)
  const scriptsToRemove = [
    "first",
    "generate:jwt",
    "make:module",
    "make:modul",
    "config:clear",
    "release",
  ];

  // Filter template scripts
  const filteredTemplateScripts = Object.keys(templatePackageJson.scripts)
    .filter((key) => !scriptsToRemove.includes(key))
    .reduce((obj, key) => {
      obj[key] = templatePackageJson.scripts[key];
      return obj;
    }, {});

  currentPackageJson.scripts = {
    ...currentPackageJson.scripts,
    ...filteredTemplateScripts,
    dev: "lapeeh dev",
    start: "lapeeh start",
    build: "lapeeh build",
    "start:prod": "lapeeh start",
  };

  // Clean up existing scripts that we want to remove
  scriptsToRemove.forEach((script) => {
    if (currentPackageJson.scripts[script]) {
      delete currentPackageJson.scripts[script];
    }
  });

  currentPackageJson.dependencies = {
    ...currentPackageJson.dependencies,
    ...templatePackageJson.dependencies,
  };

  currentPackageJson.devDependencies = {
    ...currentPackageJson.devDependencies,
    ...templatePackageJson.devDependencies,
  };

  const frameworkPackageJson = require(path.join(templateDir, "package.json"));

  if (originallapeehDep && originallapeehDep.startsWith("file:")) {
    console.log(
      `ℹ️  Preserving local 'lapeeh' dependency: ${originallapeehDep}`
    );
    currentPackageJson.dependencies["lapeeh"] = originallapeehDep;
  } else {
    if (__dirname.includes("node_modules")) {
      currentPackageJson.dependencies[
        "lapeeh"
      ] = `^${frameworkPackageJson.version}`;
    } else {
      const lapeehPath = path.resolve(__dirname, "..").replace(/\\/g, "/");
      currentPackageJson.dependencies["lapeeh"] = `file:${lapeehPath}`;
    }
  }

  // Ensure prisma config exists for seed
  if (!currentPackageJson.prisma) {
    currentPackageJson.prisma = {
      seed: "npx ts-node -r tsconfig-paths/register prisma/seed.ts",
    };
  }

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(currentPackageJson, null, 2)
  );

  console.log("🔧 Configuring tsconfig.json...");
  const tsconfigPath = path.join(currentDir, "tsconfig.json");
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = require(tsconfigPath);
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths["lapeeh/*"] = [
        "./node_modules/lapeeh/dist/lib/*",
      ];
    }
    tsconfig["ts-node"] = {
      ignore: ["node_modules/(?!lapeeh)"],
    };
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  }

  console.log("� Configuring jest.config.js...");
  const jestConfigPath = path.join(currentDir, "jest.config.js");
  if (fs.existsSync(jestConfigPath)) {
    let jestConfig = fs.readFileSync(jestConfigPath, "utf8");
    jestConfig = jestConfig.replace(
      /'\^lapeeh\/\(\.\*\)\$': '<rootDir>\/lib\/\$1',/g,
      `'^lapeeh/(.*)$$': '<rootDir>/node_modules/lapeeh/lib/$$1',`
    );
    jestConfig = jestConfig.replace(
      /transformIgnorePatterns: \['node_modules\/\(?!\(uuid\)\/\)'\]/g,
      `transformIgnorePatterns: ['node_modules/(?!(uuid|lapeeh)/)']`
    );
    fs.writeFileSync(jestConfigPath, jestConfig);
  }

  console.log("� Installing updated dependencies...");
  try {
    execSync("npm install", { cwd: currentDir, stdio: "inherit" });
  } catch (error) {
    console.error("❌ Error installing dependencies.");
    process.exit(1);
  }

  console.log("\n✅ Upgrade completed successfully!");

  if (updateStats.created.length > 0) {
    console.log("\n✨ Created files:");
    updateStats.created.forEach((f) => console.log(`   \x1b[32m+ ${f}\x1b[0m`));
  }

  if (updateStats.updated.length > 0) {
    console.log("\n📝 Updated files:");
    updateStats.updated.forEach((f) => console.log(`   \x1b[33m~ ${f}\x1b[0m`));
  }

  if (updateStats.removed.length > 0) {
    console.log("\n🗑️ Removed files:");
    updateStats.removed.forEach((f) => console.log(`   \x1b[31m- ${f}\x1b[0m`));
  }

  if (
    updateStats.created.length === 0 &&
    updateStats.updated.length === 0 &&
    updateStats.removed.length === 0
  ) {
    console.log("   No files were changed.");
  }

  console.log(
    "\n   Please check your .env file against .env.example for any new required variables."
  );
}

function createModule(moduleName) {
  // Capitalize first letter
  const name = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const lowerName = moduleName.toLowerCase();

  const currentDir = process.cwd();
  // Support both src/modules (default) and just modules if user changed structure
  const srcModulesDir = path.join(currentDir, "src", "modules");
  const modulesDir = fs.existsSync(srcModulesDir)
    ? srcModulesDir
    : path.join(currentDir, "modules");

  if (
    !fs.existsSync(path.join(currentDir, "src")) &&
    !fs.existsSync(modulesDir)
  ) {
    console.error(
      "❌ Could not find src directory. Are you in a lapeeh project root?"
    );
    process.exit(1);
  }

  const targetDir = path.join(modulesDir, name);

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Module ${name} already exists at ${targetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  // Controller
  const controllerContent = `import { Request, Response } from "express";
import { sendSuccess } from "lapeeh/utils/response";
// import * as ${name}Service from "./${lowerName}.service";

export async function index(_req: Request, res: Response) {
  sendSuccess(res, 200, "Index ${name}");
}

export async function show(req: Request, res: Response) {
  const { id } = req.params;
  sendSuccess(res, 200, "Show ${name} " + id);
}

export async function create(_req: Request, res: Response) {
  sendSuccess(res, 201, "Create ${name}");
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  sendSuccess(res, 200, "Update ${name} " + id);
}

export async function destroy(req: Request, res: Response) {
  const { id } = req.params;
  sendSuccess(res, 200, "Delete ${name} " + id);
}
`;

  fs.writeFileSync(
    path.join(targetDir, `${lowerName}.controller.ts`),
    controllerContent
  );

  // Service
  const serviceContent = `
export async function findAll() {
  return [];
}

export async function findOne(_id: number) {
  return null;
}
`;
  fs.writeFileSync(
    path.join(targetDir, `${lowerName}.service.ts`),
    serviceContent
  );

  // Route Stub
  const routeContent = `import { Router } from "express";
import * as ${name}Controller from "./${lowerName}.controller";

const router = Router();

router.get("/", ${name}Controller.index);
router.get("/:id", ${name}Controller.show);
router.post("/", ${name}Controller.create);
router.put("/:id", ${name}Controller.update);
router.delete("/:id", ${name}Controller.destroy);

export default router;
`;
  fs.writeFileSync(
    path.join(targetDir, `${lowerName}.routes.ts`),
    routeContent
  );

  console.log(`✅ Module ${name} created successfully at src/modules/${name}`);
  console.log(`   - ${lowerName}.controller.ts`);
  console.log(`   - ${lowerName}.service.ts`);
  console.log(`   - ${lowerName}.routes.ts`);
  console.log(
    `\n👉 Don't forget to register the route in src/routes/index.ts!`
  );
}

function createProject(skipFirstArg = false) {
  const searchArgs = skipFirstArg ? args.slice(1) : args;
  const projectName = searchArgs.find((arg) => !arg.startsWith("-"));
  const isFull = args.includes("--full");
  const useDefaults =
    args.includes("--defaults") ||
    args.includes("--default") ||
    args.includes("-y");

  if (!projectName) {
    console.error("❌ Please specify the project name:");
    console.error("   npx lapeeh-cli <project-name> [--full] [--defaults|-y]");
    process.exit(1);
  }

  const currentDir = process.cwd();
  const projectDir = path.join(currentDir, projectName);
  const templateDir = path.join(__dirname, "..");

  if (fs.existsSync(projectDir)) {
    console.error(`❌ Directory ${projectName} already exists.`);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (query, defaultVal) => {
    return new Promise((resolve) => {
      rl.question(
        `${query} ${defaultVal ? `[${defaultVal}]` : ""}: `,
        (answer) => {
          resolve(answer.trim() || defaultVal);
        }
      );
    });
  };

  const selectOption = async (query, options) => {
    console.log(query);
    options.forEach((opt, idx) => {
      console.log(`   [${opt.key}] ${opt.label}`);
    });

    while (true) {
      const answer = await ask(">", options[0].key);
      const selected = options.find(
        (o) => o.key.toLowerCase() === answer.toLowerCase()
      );
      if (selected) return selected;

      const byLabel = options.find((o) =>
        o.label.toLowerCase().includes(answer.toLowerCase())
      );
      if (byLabel) return byLabel;

      console.log("Pilihan tidak valid. Silakan coba lagi.");
    }
  };

  (async () => {
    // Animation lapeeh "L A P E H"
    const frames = [
      "██╗      █████╗ ██████╗ ███████╗███████╗██╗  ██╗",
      "██║     ██╔══██╗██╔══██╗██╔════╝██╔════╝██║  ██║",
      "██║     ███████║██████╔╝█████╗  █████╗  ███████║",
      "██║     ██╔══██║██╔═══╝ ██╔══╝  ██╔══╝  ██╔══██║",
      "███████╗██║  ██║██║     ███████╗███████╗██║  ██║",
      "╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝",
    ];

    console.clear();
    console.log("\n");
    for (let i = 0; i < frames.length; i++) {
      await new Promise((r) => setTimeout(r, 100));
      console.log(`\x1b[36m   ${frames[i]}\x1b[0m`);
    }
    console.log("\n\x1b[36m   L A P E E H   F R A M E W O R K\x1b[0m\n");
    await new Promise((r) => setTimeout(r, 800));

    console.log(`🚀 Creating a new API lapeeh project in ${projectDir}...`);
    fs.mkdirSync(projectDir);

    const ignoreList = [
      "node_modules",
      "dist",
      ".git",
      ".env",
      "bin",
      "scripts",
      "lib",
      "package-lock.json",
      ".DS_Store",
      "prisma",
      "website",
      "init",
      "test-local-run",
      "coverage",
      "doc",
      projectName,
      "testing_playground",
    ];

    function copyDir(src, dest) {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoreList.includes(entry.name)) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Clean storage/logs: skip everything except .gitkeep
        // Check if we are inside storage/logs
        const relPath = path.relative(templateDir, srcPath);
        const isInLogs =
          relPath.includes(path.join("storage", "logs")) ||
          relPath.includes("storage/logs") ||
          relPath.includes("storage\\logs");

        if (isInLogs && !entry.isDirectory() && entry.name !== ".gitkeep") {
          continue;
        }

        if (entry.isDirectory()) {
          fs.mkdirSync(destPath);
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    console.log("\n📂 Copying template files...");
    copyDir(templateDir, projectDir);

    // Remove framework unit tests from user project
    const unitTestsPath = path.join(projectDir, "tests", "unit");
    if (fs.existsSync(unitTestsPath)) {
      fs.rmSync(unitTestsPath, { recursive: true, force: true });
    }

    const gitignoreTemplate = path.join(projectDir, "gitignore.template");
    if (fs.existsSync(gitignoreTemplate)) {
      fs.renameSync(gitignoreTemplate, path.join(projectDir, ".gitignore"));
    }

    console.log("⚙️  Configuring environment...");
    const envExamplePath = path.join(projectDir, ".env.example");
    const envPath = path.join(projectDir, ".env");

    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, "utf8");
      fs.writeFileSync(envPath, envContent);
    }

    console.log("📝 Updating package.json...");
    const packageJsonPath = path.join(projectDir, "package.json");
    const packageJson = require(packageJsonPath);
    packageJson.name = projectName;

    const frameworkPackageJson = require(path.join(
      __dirname,
      "../package.json"
    ));
    if (__dirname.includes("node_modules")) {
      packageJson.dependencies["lapeeh"] = `^${frameworkPackageJson.version}`;
    } else {
      const lapeehPath = path.resolve(__dirname, "..").replace(/\\/g, "/");
      packageJson.dependencies["lapeeh"] = `file:${lapeehPath}`;
    }

    packageJson.version = "1.0.0";
    delete packageJson.bin;
    delete packageJson.peerDependencies;

    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "lapeeh dev",
      start: "lapeeh start",
      build: "lapeeh build",
      "start:prod": "lapeeh start",
    };

    // Remove scripts that depend on the scripts folder
    const scriptsToRemove = [
      "first",
      "generate:jwt",
      "make:module",
      "make:modul",
      "config:clear",
      "release",
    ];
    scriptsToRemove.forEach((script) => {
      delete packageJson.scripts[script];
    });

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Update tsconfig.json for aliases
    const tsconfigPath = path.join(projectDir, "tsconfig.json");
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = require(tsconfigPath);
        if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
        if (!tsconfig.compilerOptions.paths)
          tsconfig.compilerOptions.paths = {};

        // Ensure lapeeh/* points to the installed package
        tsconfig.compilerOptions.paths["lapeeh/*"] = [
          "./node_modules/lapeeh/dist/lib/*",
        ];

        // Add ts-node configuration to allow compiling lapeeh in node_modules
        tsconfig["ts-node"] = {
          ignore: ["node_modules/(?!lapeeh)"],
        };

        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      } catch (e) {
        console.warn("⚠️  Failed to update tsconfig.json aliases.");
      }
    }

    // Update jest.config.js
    const jestConfigPath = path.join(projectDir, "jest.config.js");
    if (fs.existsSync(jestConfigPath)) {
      try {
        let jestConfig = fs.readFileSync(jestConfigPath, "utf8");
        jestConfig = jestConfig.replace(
          /'\^lapeeh\/\(\.\*\)\$': '<rootDir>\/lib\/\$1',/g,
          `'^lapeeh/(.*)$$': '<rootDir>/node_modules/lapeeh/lib/$$1',`
        );
        jestConfig = jestConfig.replace(
          /transformIgnorePatterns: \['node_modules\/\(?!\(uuid\)\/\)'\]/g,
          `transformIgnorePatterns: ['node_modules/(?!(uuid|lapeeh)/)']`
        );
        fs.writeFileSync(jestConfigPath, jestConfig);
      } catch (e) {
        console.warn("⚠️  Failed to update jest.config.js.");
      }
    }

    // Removed Prisma base file handling

    try {
      await spin("Installing dependencies...", async () => {
        await runCommand("npm install", projectDir);
      });
    } catch (e) {
      console.error("❌ Error installing dependencies.");
      console.error(e.message);
      process.exit(1);
    }

    try {
      // Inline JWT Generation Logic
      const crypto = require("crypto");
      const secret = crypto.randomBytes(64).toString("hex");

      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }

      if (envContent.match(/^JWT_SECRET=/m)) {
        envContent = envContent.replace(
          /^JWT_SECRET=.*/m,
          `JWT_SECRET="${secret}"`
        );
      } else {
        if (envContent && !envContent.endsWith("\n")) {
          envContent += "\n";
        }
        envContent += `JWT_SECRET="${secret}"\n`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log("✅ JWT Secret generated.");
    } catch (e) {
      console.warn("⚠️ Failed to generate JWT secret automatically.");
    }

    // Removed Prisma setup steps

    console.log(`\n✅ Project ${projectName} created successfully!`);
    rl.close();
  })();
}
