const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function getModels() {
  try {
    const response = await axios.get('https://routerai.ru/api/v1/models', {
      headers: {
        'Authorization': `Bearer sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6`
      }
    });
    const models = response.data.data.map(m => m.id);
    fs.writeFileSync(path.join(__dirname, 'models.txt'), models.join('\n'));
    console.log('Saved');
  } catch (error) {
    fs.writeFileSync(path.join(__dirname, 'models.txt'), error.message);
  }
}
getModels();
