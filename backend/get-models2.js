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
    fs.writeFileSync(path.join(__dirname, 'models.json'), JSON.stringify(response.data, null, 2));
    console.log('Models saved to models.json');
  } catch (error) {
    fs.writeFileSync(path.join(__dirname, 'error.log'), error.message + '\n' + (error.response ? JSON.stringify(error.response.data) : ''));
    console.error('Error fetching models:', error.message);
  }
}

getModels();
