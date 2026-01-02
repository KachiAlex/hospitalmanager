#!/usr/bin/env node

/**
 * T-Happy Hospital Backend Server Startup Script
 * 
 * This script starts the backend API server for the T-Happy Hospital Management System.
 * The server provides REST API endpoints for patient management, staff dashboards, and more.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🏥 Starting T-Happy Hospital Backend Server...\n');

// Start the server
const serverProcess = spawn('node', ['server/app.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
  } else {
    console.log('✅ Server stopped gracefully');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});