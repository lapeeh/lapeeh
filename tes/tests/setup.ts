process.env.JWT_SECRET = "test-secret";
process.env.AVATAR_UPLOAD_DIR = "tests/temp/uploads";
process.env.NO_REDIS = "true"; // Disable Redis for tests
process.env.DB_FILE = "database.test.json"; // Use separate DB for tests
