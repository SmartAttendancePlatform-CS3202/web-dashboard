const fs = require('fs');
const path = require('path');

const replacements = [
  { search: 'FastAPI Microservices Cluster Status (:8001, :8002, :8003)', replace: 'System Services Status' },
  { search: 'Backend Microservices Cluster Status', replace: 'System Status' },
  { search: 'MESH:', replace: 'System:' },
  { search: 'NODES', replace: 'Online' },
  { search: 'Microservices Health', replace: 'System Health' },
  { search: 'Microservices', replace: 'Services' },
  { search: 'Node Mesh Cache invalidation complete', replace: 'Sync complete' },
  { search: 'Invalidate cache and poll microservice nodes', replace: 'Sync services' },
  { search: 'Syncing Mesh', replace: 'Syncing' },
  { search: 'node_endpoint', replace: 'source' },
  { search: 'payload', replace: 'details' },
  { search: 'microservice telemetry & security sentinel', replace: 'system overview and security monitoring' }
];

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { search, replace } of replacements) {
        if (content.includes(search)) {
          content = content.split(search).join(replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir('src/app');
replaceInDir('src/components');
console.log('Jargon audit finalized');
