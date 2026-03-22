const { execSync } = require('child_process');
try {
  const output = execSync('git log -p backend/src/ai/ai.service.ts', { cwd: 'c:/Users/ethan/Desktop/project/gerusta' }).toString();
  require('fs').writeFileSync('c:/Users/ethan/Desktop/project/gerusta/backend/ai-log.txt', output);
} catch (e) {
  console.error(e);
}
