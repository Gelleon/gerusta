const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function run() {
  const svgPath = path.join(__dirname, '..', 'src', 'app', 'icon.svg');
  const outAppPath = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
  const outPublicPath = path.join(__dirname, '..', 'public', 'favicon.ico');

  const svg = fs.readFileSync(svgPath);
  const sizes = [16, 32, 48, 64];

  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(svg, { density: 300 }).resize(size, size).png().toBuffer(),
    ),
  );

  const ico = await toIco(pngs);
  fs.writeFileSync(outAppPath, ico);
  fs.mkdirSync(path.dirname(outPublicPath), { recursive: true });
  fs.writeFileSync(outPublicPath, ico);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
