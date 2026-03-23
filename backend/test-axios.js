const axios = require('axios');
const fs = require('fs');

const path = require('path');

async function run() {
  const apiKey = 'sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6';
  const endpoint = 'https://routerai.ru/api/v1/images/generations';
  
  const payload = {
    model: 'dall-e-3',
    prompt: 'Beautiful sunset over the ocean',
    n: 1,
    size: '1024x1024'
  };

  console.log('Testing image generation...');
  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
    fs.writeFileSync(path.join(__dirname, 'output-axios.json'), JSON.stringify(response.data, null, 2));
    console.log('Success, wrote output-axios.json');
  } catch (error) {
    fs.writeFileSync(path.join(__dirname, 'output-axios.json'), JSON.stringify(error.response?.data || error.message, null, 2));
    console.log('Error, wrote output-axios.json');
  }
}

run();
