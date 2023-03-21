import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.CHATGPT_API_KEY
});
export const openai = new OpenAIApi(configuration);
