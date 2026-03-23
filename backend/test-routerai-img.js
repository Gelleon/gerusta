const axios = require('axios');
const fs = require('fs');

const API_KEY = 'sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6';
const BASE_URL = 'https://routerai.ru/api/v1';
let logOutput = '';

function log(msg) {
  console.log(msg);
  logOutput += msg + '\n';
}

async function testChatCompletion() {
  log('--- Testing /chat/completions with openai/gpt-5-image-mini ---');
  try {
    const res = await axios.post(`${BASE_URL}/chat/completions`, {
      model: 'openai/gpt-5-image-mini',
      messages: [{ role: 'user', content: 'Draw a cat' }]
    }, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    log('Chat completion response: ' + JSON.stringify(res.data, null, 2));
  } catch (e) {
    log('Chat completion error: ' + (e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message));
  }
}

async function testImageGeneration() {
  log('\n--- Testing /images/generations with dall-e-3 ---');
  try {
    const res = await axios.post(`${BASE_URL}/images/generations`, {
      model: 'dall-e-3',
      prompt: 'Draw a dog',
      n: 1,
      size: '1024x1024'
    }, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    log('Image generation response: ' + JSON.stringify(res.data, null, 2));
  } catch (e) {
    log('Image generation error: ' + (e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message));
  }
}

async function run() {
  await testChatCompletion();
  await testImageGeneration();
  fs.writeFileSync('routerai-test.log', logOutput);
}

run();