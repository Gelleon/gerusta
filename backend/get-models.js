const axios = require('axios');
const fs = require('fs');

async function getModels() {
  try {
    const res = await axios.get('https://routerai.ru/api/v1/models', {
      headers: { Authorization: 'Bearer sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6' }
    });
    fs.writeFileSync('models.json', JSON.stringify(res.data, null, 2));
  } catch (e) {
    fs.writeFileSync('models.json', JSON.stringify(e.message, null, 2));
  }
}
getModels();
