import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class OpenAIService {
    private readonly openai: OpenAI;

    constructor() {
        // Instantiate the OpenAI client with the API key
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API,
        });
    }

    /**
     * Fetch feedback from OpenAI
     * @param prompt - The prompt to send to OpenAI
     * @returns A string containing the feedback
     */
    async getLLMFeedback(prompt: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are an AI assistant providing feedback on user focus sessions.' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
                throw new Error('Invalid response from OpenAI API.');
            }

            return response.choices[0].message.content.trim();
        } catch (error: any) {
            console.error('Error in LLM API call:', error);
            throw new InternalServerErrorException('Failed to retrieve feedback from the OpenAI API.');
        }
    }
}
