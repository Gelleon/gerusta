const axios = require('axios');
const fs = require('fs');

async function run() {
  const apiKey = 'sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6';
  const endpoint = 'https://routerai.ru/api/v1/chat/completions';
  
  const payload = {
    model: 'openai/gpt-5-image-mini',
    messages: [
      {
        role: 'system',
        content: 'You generate images. Return exactly one direct HTTPS image URL and nothing else.',
      },
      {
        role: 'user',
        content: 'Generate an image: Beautiful sunset over the ocean',
      },
    ],
  };

  console.log('Testing image generation...');
  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
    fs.writeFileSync('res.json', JSON.stringify(response.data, null, 2));
    console.log('Success');
  } catch (error) {
    fs.writeFileSync('res.json', JSON.stringify(error.response ? error.response.data : error.message, null, 2));
    console.log('Error');
  }
}
run();