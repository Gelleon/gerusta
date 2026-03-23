const { spawn } = require('child_process');
const fs = require('fs');

const logStream = fs.createWriteStream('deploy.log');

const child = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', '.\\deploy-and-push.ps1'], {
  cwd: __dirname
});

child.stdout.on('data', (data) => {
  logStream.write(data);
});

child.stderr.on('data', (data) => {
  logStream.write(data);
});

child.on('close', (code) => {
  logStream.write(`\nProcess exited with code ${code}\n`);
  logStream.end();
});
