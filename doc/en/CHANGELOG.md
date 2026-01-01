# Changelog

All notable changes to this project will be documented in this file.

## [1.0.6] - 2026-01-01

### 🚀 Features & Improvements

- **Testing**: Added `npx lapeeh tes` command which runs Jest and JSON Server concurrently with an isolated database (`database.test.json`).
- **Module Refactor**: Restructured default modules (`Auth` & `Rbac`) to follow the `make:module` standard (Controller, Service, Route in one folder).
- **Cleanup**: Removed old route files in `src/routes/` and moved them into their respective modules.
- **CLI**: Updated help message for `test` command.

## [1.0.5] - 2026-01-01

### 🚀 Features & Improvements

- **Standardization**: lapeeh framework standardization.
- **CLI**: Fixes for `make:module` and `init` commands.
- **Documentation**: Cleanup of confusing old version references.

## [1.0.0] - 2026-01-01

- First Public Release.
