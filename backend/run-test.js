const { exec } = require('child_process');

exec('node test-script.js', (error, stdout, stderr) => {
  require('fs').writeFileSync('test-out.txt', stdout + stderr);
});
