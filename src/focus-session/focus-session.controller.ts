import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, Post, Req, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenGuard } from 'src/auth/auth.guard';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { FocusSessionService } from './focus-session.service';
import { Progress } from './entities/focus-session.entity';

@Controller('api/v1/focus-session')
export class FocusSessionController {
    constructor(
        private readonly focusSessionService: FocusSessionService
    ) {}

    @UseGuards(AuthenGuard)
    @Post()
    async createFocusSession(@Body(new ValidationPipe()) createFocusSessionDto: CreateFocusSessionDto, @Req() req: any) {
        try {
            const createFocusSession: Progress = await this.focusSessionService.createFocusSession(createFocusSessionDto, req.user.sub);
            const response = {
                completionTime: createFocusSession.completionTime.toString(),
                status: createFocusSession.status,
                progressId: createFocusSession.progressId
            }
            return {
                data: {
                    response,
                    ref: `https://study-planner-be.onrender.com/api/v1/focus-session/${createFocusSession.progressId}`
                },
                statusCode: 201,
                message: 'Focus session has been successfully created'
            }
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
    @Get(':id')
    async getFocusSession(@Param('id') taskId: number, @Req() req: any) {
        try {
            const getFocusSession = await this.focusSessionService.getFocusSession(taskId, req.user.sub);
            const response = {
                completionTime: getFocusSession.completionTime.toString(),
                status: getFocusSession.status,
                progressId: getFocusSession.progressId
            }
            return {
                data: {
                    response,
                    ref: `https://study-planner-be.onrender.com/api/v1/focus-session/${getFocusSession.progressId}`
                },
                statusCode: 200,
                message: 'Successfully'
            }
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
}
