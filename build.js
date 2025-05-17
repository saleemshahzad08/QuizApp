// build.js
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();
const apiKey = process.env.OPENROUTER_API_KEY;

const scriptFilePath = 'script.js';
const outputDir = 'dist';
const outputScriptFilePath = `${outputDir}/script.js`;
const indexHTMLFilePath = 'index.html';
const outputIndexHTMLFilePath = `${outputDir}/index.html`;

fs.readFile(scriptFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Failed to read ${scriptFilePath}:`, err);
    return;
  }

  const updatedScript = data.replace('process.env.OPENROUTER_API_KEY', `window.OPENROUTER_API_KEY = ${JSON.stringify(apiKey)};`);

  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFile(outputScriptFilePath, updatedScript, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error(`Failed to write to ${outputScriptFilePath}:`, writeErr);
      return;
    }
    console.log(`API key assigned to window.OPENROUTER_API_KEY in ${outputScriptFilePath}`);

    fs.copyFile(indexHTMLFilePath, outputIndexHTMLFilePath, (copyErr) => {
      if (copyErr) {
        console.error(`Failed to copy ${indexHTMLFilePath} to ${outputIndexHTMLFilePath}:`, copyErr);
      } else {
        console.log(`Copied ${indexHTMLFilePath} to ${outputIndexHTMLFilePath}`);
      }
    });
  });
});