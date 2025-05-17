// build.js
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file (if it exists)
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

// Read the content of script.js
fs.readFile('script.js', 'utf8', (err, data) => {
  if (err) {
    console.error('Failed to read script.js:', err);
    return;
  }

  // Replace the placeholder in script.js with the API key
  const updatedScript = data.replace('process.env.OPENROUTER_API_KEY', JSON.stringify(apiKey));

  // Write the updated content to the 'dist' folder
  fs.mkdirSync('dist', { recursive: true }); // Ensure 'dist' folder exists
  fs.writeFile('dist/script.js', updatedScript, 'utf8', (err) => {
    if (err) {
      console.error('Failed to write updated script.js:', err);
      return;
    }
    console.log('API key injected into dist/script.js');

    // Optionally copy index.html to the dist folder
    fs.copyFile('index.html', 'dist/index.html', (copyErr) => {
      if (copyErr) {
        console.error('Failed to copy index.html:', copyErr);
      } else {
        console.log('index.html copied to dist/');
      }
    });
  });
});