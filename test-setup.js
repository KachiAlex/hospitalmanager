// Test setup for database property tests
const path = require('path');
const fs = require('fs');

// Use a separate test database
const testDbPath = path.join(__dirname, 'data', 'test-hospital.db');

// Clean up test database before each test suite
beforeAll(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Clean up test database after all tests
afterAll(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});