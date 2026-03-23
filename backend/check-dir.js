const fs = require('fs');
const files = fs.readdirSync(__dirname);
fs.writeFileSync('dir-out.txt', files.join('\n'));
