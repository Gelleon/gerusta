const { execSync } = require('child_process');
const output = execSync('git log -p -n 1 src/ai/ai.service.ts', { cwd: 'c:/Users/ethan/Desktop/project/gerusta/backend' }).toString();
const fs = require('fs');
fs.writeFileSync('diff.txt', output);
