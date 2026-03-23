const axios = require('axios');
const fs = require('fs');

async function testImages() {
  try {
    const res = await axios.post('https://routerai.ru/api/v1/images/generations', {
      model: 'dall-e-3',
      prompt: 'A cute baby sea otter',
      n: 1,
      size: '1024x1024'
    }, {
      headers: {
        'Authorization': 'Bearer sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6',
        'Content-Type': 'application/json'
      }
    });
    fs.writeFileSync('test-images.json', JSON.stringify(res.data, null, 2));
  } catch (e) {
    fs.writeFileSync('test-images.json', JSON.stringify(e.response ? e.response.data : e.message, null, 2));
  }
}

async function testChat() {
  try {
    const res = await axios.post('https://routerai.ru/api/v1/chat/completions', {
      model: 'openai/gpt-5-image-mini',
      messages: [{ role: 'user', content: 'Generate an image of a cat' }]
    }, {
      headers: {
        'Authorization': 'Bearer sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6',
        'Content-Type': 'application/json'
      }
    });
    fs.writeFileSync('test-chat.json', JSON.stringify(res.data, null, 2));
  } catch (e) {
    fs.writeFileSync('test-chat.json', JSON.stringify(e.response ? e.response.data : e.message, null, 2));
  }
}

testImages().then(testChat);
