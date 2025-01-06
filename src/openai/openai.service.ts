import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class OpenAIService {
    private readonly openai: OpenAI;

    constructor() {
        // Instantiate the OpenAI client with the API key
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    /**
     * Fetch feedback from OpenAI
     * @param prompt - The prompt to send to OpenAI
     * @returns A string containing the feedback
     */
    async getLLMFeedback(data: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                max_tokens: 500,
                temperature: 0.7,
                messages: [
                    { 
                        role: 'system', 
                        content: `
                        You are an AI assistant analyzing user focus session data. Provide feedback based on these inputs:
                        1. Monthly completion times for tasks.
                        2. Priority levels of completed tasks.

                        Identifying areas where the user is excelling.
                        Suggesting subjects or tasks that may need more attention.
                        Offering motivational feedback to encourage consistency and improvement.

                        Always format your response as:
                        Strengths:
                        Need improvements:
                        Motivational quotes:`
                    },
                    { 
                        role: 'user', 
                        content: `Analyze my focus session and provide feedback. Here is the data in JSON format:\n\n${data}` 
                    },
                ],
            });

            if (!response) {
                throw new BadRequestException('No response from the LLM API. Please try again');
            }

            return response.choices[0].message.content.trim();
        } catch (error: any) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async getAnalysisFromAI(data: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                max_tokens: 500,
                temperature: 0.7,
                messages: [
                    {
                        role: 'system', 
                        content: `
                        You are a helpful assistant that analyzes study schedules.
                        Provide warnings about overly tight schedules and suggestions for better prioritization and balance.
                        Always format your response as:
                        Warnings:
                        - Item 1
                        - Item 2
                        - Item 3

                        Suggestions:
                        - Item 1
                        - Item 2
                        - Item 3`
                    }, 
                    {
                        role: 'user',
                        content: `Analyze my schedule and provide feedback. Here is the data in JSON format:\n\n${data}`
                    }
                ]
            })

            if (!response) {
                throw new BadRequestException('No response from the LLM API. Please try again');
            }

            return response.choices[0]?.message?.content;
        } catch (error: any) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException(error.message);
        }
    }
}
