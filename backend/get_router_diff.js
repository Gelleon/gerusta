const { execSync } = require('child_process');
const output = execSync('git log -p -n 1 src/ai/routerai-client.service.ts').toString();
require('fs').writeFileSync('router_diff.txt', output);
