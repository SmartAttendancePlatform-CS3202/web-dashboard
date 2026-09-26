const fs = require('fs');
const path = require('path');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Remove micro grid pattern
css = css.replace(/background-image: radial-gradient[\s\S]*?;/, 'background-image: none;');

// Flatten box shadows
css = css.replace(/--shadow-card: [\s\S]*?;/, '--shadow-card: 0 1px 2px 0 rgba(0, 0, 0, 0.05);');
css = css.replace(/--shadow-card-hover: [\s\S]*?;/, '--shadow-card-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1);');
css = css.replace(/--shadow-command: [\s\S]*?;/, '--shadow-command: 0 10px 15px -3px rgba(0, 0, 0, 0.1);');

// Save back
fs.writeFileSync('src/app/globals.css', css);

// Now for all tsx files
function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace neon indigo text color with standard brand blue
      content = content.replace(/#818CF8/g, 'var(--accent-blue)');
      
      // Replace dark mode translucent white backgrounds with light surface color
      content = content.replace(/rgba\(255, 255, 255, 0\.[0-9]+\)/g, 'var(--bg-surface)');
      
      // Replace translucent indigo backgrounds with light surface subtle
      content = content.replace(/rgba\(99, 102, 241, 0\.[0-9]+\)/g, 'var(--bg-surface-recess)');
      
      // Remove text-indigo-400 and text-cyan-400 classes that add neon text
      content = content.replace(/className=\"[^\"]*text-(indigo|cyan)-400[^\"]*\"/g, '');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('src/app');
replaceInDir('src/components');
console.log('UI styles finalized');
