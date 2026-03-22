import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';

describe('Temp Test', () => {
  it('should generate image', async () => {
    const apiKey = 'sk-fCHw5XjJraKOovzTtwHTrr64KGBO13l6';
    
    // try chat completions
    try {
      const res = await axios.post('https://routerai.ru/api/v1/chat/completions', {
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'Generate an image of a cat. Return only the URL.' }]
      }, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      console.log('Chat response:', res.data.choices[0].message.content);
    } catch(e: any) {
      console.error('Chat error:', e.response?.data || e.message);
    }

    // try images generations
    try {
      const res2 = await axios.post('https://routerai.ru/api/v1/images/generations', {
        model: 'dall-e-3', // or whatever
        prompt: 'Generate an image of a cat',
        n: 1,
        size: '1024x1024'
      }, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      console.log('Image response:', res2.data);
    } catch(e: any) {
      console.error('Image error:', e.response?.data || e.message);
    }
  }, 30000);
});
