const fs = require('fs');
const acorn = require('acorn');
const acornJsx = require('acorn-jsx');
const Parser = acorn.Parser.extend(acornJsx());

try {
  const code = fs.readFileSync('src/app/session/live/page.tsx', 'utf8');
  Parser.parse(code, { sourceType: 'module', ecmaVersion: 2020 });
  console.log("Parsed OK with Acorn JSX");
} catch (e) {
  console.log("Acorn error:", e);
}
