const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('npm run build');
  fs.writeFileSync('build_result.txt', out.toString());
  console.log('Build succeeded');
} catch (e) {
  const out = (e.stdout ? e.stdout.toString() : '') + '\n' + (e.stderr ? e.stderr.toString() : '');
  fs.writeFileSync('build_result.txt', out);
  console.log('Build failed');
}