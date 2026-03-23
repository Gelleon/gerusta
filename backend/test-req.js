const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    console.log('starting');
    const res = await axios.get('https://routerai.ru/api/v1/models', {
      headers: { 'Authorization': 'Bearer sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6' },
      timeout: 5000
    });
    fs.writeFileSync('models.json', JSON.stringify(res.data, null, 2));
    console.log('done');
  } catch (e) {
    fs.writeFileSync('error.txt', e.message);
    console.log('error');
  }
}
test();