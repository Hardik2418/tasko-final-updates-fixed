const fs = require('fs');
const path = require('path');

const requiredFiles = [
  // Configuration
  'server.js',
  'package.json',
  '.env.example',
  '.gitignore',
  
  // Controllers
  'controllers/authController.js',
  'controllers/projectController.js',
  'controllers/taskController.js',
  
  // Models
  'models/User.js',
  'models/Project.js',
  'models/Task.js',
  
  // Routes
  'routes/auth.js',
  'routes/projects.js',
  'routes/tasks.js',
  
  // Middleware
  'middleware/auth.js',
  
  // Views
  'views/index.ejs',
  'views/login.ejs',
  'views/signup.ejs',
  'views/dashboard.ejs',
  'views/projects.ejs',
  'views/project-detail.ejs',
  'views/my-tasks.ejs',
  'views/error.ejs',
  
  // Styles
  'public/css/style.css',
  'public/css/responsive.css',
  
  // JavaScript
  'public/js/main.js',
  'public/js/dashboard.js',
  'public/js/projects.js',
  'public/js/project-detail.js',
  'public/js/my-tasks.js',
  
  // Documentation
  'README.md',
  'QUICK_START.md',
  'DEPLOYMENT.md',
  'FEATURES.md',
  'API_REFERENCE.md',
  'BUILD_SUMMARY.md'
];

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Team Task Manager - Project Verification                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

let missingFiles = [];
let existingFiles = 0;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    existingFiles++;
  } else {
    console.log(`❌ ${file}`);
    missingFiles.push(file);
  }
});

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log(`║  Found: ${existingFiles}/${requiredFiles.length} files`);

if (missingFiles.length === 0) {
  console.log('║  Status: ✅ All files present! Ready to use.             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('Next steps:');
  console.log('  1. npm install (already done)');
  console.log('  2. Create .env from .env.example');
  console.log('  3. npm run dev');
  console.log('  4. Visit http://localhost:3000\n');
} else {
  console.log('║  Status: ⚠️  Some files missing                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('Missing files:');
  missingFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  console.log('\nPlease recreate the missing files.\n');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules directory found');
} else {
  console.log('❌ node_modules directory not found');
  console.log('   Run: npm install\n');
}
