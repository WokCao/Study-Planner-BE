import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { AuthenGuard } from 'src/auth/auth.guard';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { FocusSessionService } from './focus-session.service';
import { Progress } from './entities/focus-session.entity';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';
import { getAIInsights } from './llmFeedback.service';
import { OpenAIService } from 'src/openai/openai.service';
@Controller('api/v1/focus-session')
export class FocusSessionController {
  constructor(
    private readonly focusSessionService: FocusSessionService,
    private readonly openAIService: OpenAIService,
  ) {}

  @UseGuards(AuthenGuard)
  @Post()
  async createFocusSession(
    @Body(new ValidationPipe()) createFocusSessionDto: CreateFocusSessionDto,
    @Req() req: any,
  ) {
    try {
      const createFocusSession: Progress =
        await this.focusSessionService.createFocusSession(
          createFocusSessionDto,
          req.user.sub,
        );
      const response = {
        completionTime: createFocusSession.completionTime,
        status: createFocusSession.status,
        progressId: createFocusSession.progressId,
      };
      return {
        data: {
          response,
          ref: `https://study-planner-be.onrender.com/api/v1/focus-session/${createFocusSessionDto.taskId}`,
        },
        statusCode: 201,
        message: 'Focus session has been successfully created',
      };
    } catch (error: any) {
      if (error.statusCode === 409) {
        throw new UnauthorizedException(error.message);
      } else if (error.statusCode === 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @UseGuards(AuthenGuard)
  @Put(':id')
  async updateFocusSession(
    @Param('id') taskId: number,
    @Body(new ValidationPipe()) updateFocusSession: UpdateFocusSessionDto,
    @Req() req: any,
  ) {
    try {
      const updatedFocusSession =
        await this.focusSessionService.updateFocusSession(
          taskId,
          updateFocusSession,
          req.user.sub,
        );
      const response = {
        completionTime: updatedFocusSession.completionTime,
        status: updatedFocusSession.status,
        progressId: updatedFocusSession.progressId,
      };
      return {
        data: {
          response,
          ref: `https://study-planner-be.onrender.com/api/v1/focus-session/${taskId}`,
        },
        statusCode: 200,
        message: 'Successfully',
      };
    } catch (error: any) {
      if (error.statusCode === 409) {
        throw new UnauthorizedException(error.message);
      } else if (error.statusCode === 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @UseGuards(AuthenGuard)
  @Get('all/:year')
  async getAllFocusSession(@Param('year') year: number, @Req() req: any) {
    try {
      const response = await this.focusSessionService.getAllFocusSession(
        year,
        req.user.sub,
      );

      return {
        data: {
          response,
          ref: `https://study-planner-be.onrender.com/api/v1/focus-session/all/${year}`,
        },
        statusCode: 200,
        message: 'Successfully',
      };
    } catch (error: any) {
      throw error;
    }
  }

  @UseGuards(AuthenGuard)
  @Get(':id')
  async getFocusSession(@Param('id') taskId: number, @Req() req: any) {
    try {
      const getFocusSession = await this.focusSessionService.getFocusSession(
        taskId,
        req.user.sub,
      );
      const response = {
        completionTime: getFocusSession.completionTime,
        status: getFocusSession.status,
        progressId: getFocusSession.progressId,
      };
      return {
        data: {
          response,
          ref: `https://study-planner-be.onrender.com/api/v1/focus-session/${getFocusSession.progressId}`,
        },
        statusCode: 200,
        message: 'Successfully',
      };
    } catch (error: any) {
      if (error.statusCode === 409) {
        throw new UnauthorizedException(error.message);
      } else if (error.statusCode === 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Get('feedback')
    async getFeedback(
        @Query('year') year: number,
        @Param('userId') userId: number,
    ) {
        try {
            // Fetch focus session data for the user and year
            const focusSessions = await this.focusSessionService.getAllFocusSession(year, userId);

            if (!focusSessions || focusSessions.length === 0) {
                throw new InternalServerErrorException('No focus session data available for analysis.');
            }

            // Format the data for the LLM
            const formattedData = focusSessions.map(session => ({
                month: session.month,
                priority: session.priority,
                totalCompletionTime: session.totalCompletionTime,
            }));

            // Prompt for the LLM
            const prompt = `
                You are an AI assistant analyzing user focus session data. Provide feedback based on these inputs:
                1. Monthly completion times for tasks.
                2. Priority levels of completed tasks.
                
                Identify patterns and provide feedback:
                - Warnings: Highlight any concerning trends (e.g., neglect of high-priority tasks, inconsistent progress).
                - Suggestions: Recommend ways to improve efficiency, balance priorities, or adjust goals.
                
                Input data (JSON):
                ${JSON.stringify(formattedData)}
            `;

            // Send data to the LLM and retrieve feedback
            const feedback = await this.openAIService.getLLMFeedback(prompt);

            return {
                success: true,
                feedback,
            };
        } catch (error: any) {
            console.error('Error in getFeedback:', error);
            throw new InternalServerErrorException(error.message);
        }
    }
}
