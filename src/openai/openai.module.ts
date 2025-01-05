import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Module({
    exports: [OpenAIService],
    providers: [OpenAIService]
})
export class OpenaiModule {}
