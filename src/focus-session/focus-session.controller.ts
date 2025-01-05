import { BadRequestException, Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post, Put, Req, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenGuard } from 'src/auth/auth.guard';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { FocusSessionService } from './focus-session.service';
import { Progress } from './entities/focus-session.entity';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';

@Controller('api/v1/focus-session')
export class FocusSessionController {
    constructor(
        private readonly focusSessionService: FocusSessionService
    ) { }

    @UseGuards(AuthenGuard)
    @Post()
    async createFocusSession(@Body(new ValidationPipe()) createFocusSessionDto: CreateFocusSessionDto, @Req() req: any) {
        try {
            const createFocusSession: Progress = await this.focusSessionService.createFocusSession(createFocusSessionDto, req.user.sub);
            const response = {
                completionTime: createFocusSession.completionTime,
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
            if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 404) {
                throw new NotFoundException(error.message);
            } else if (error.statusCode === 409) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Put('')
    async updateFocusSession(@Body(new ValidationPipe()) updateFocusSession: UpdateFocusSessionDto, @Req() req: any) {
        try {
            const updatedFocusSession = await this.focusSessionService.updateFocusSession(updateFocusSession, req.user.sub);
            const response = {
                completionTime: updatedFocusSession.completionTime,
                status: updatedFocusSession.status,
                progressId: updatedFocusSession.progressId
            }
            return {
                data: {
                    response,
                    ref: `https://study-planner-be.onrender.com/api/v1/focus-session/${updatedFocusSession.progressId}`
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 404) {
                throw new NotFoundException(error.message);
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
            const response = await this.focusSessionService.getAllFocusSession(year, req.user.sub);

            return {
                data: {
                    response,
                    ref: `https://study-planner-be.onrender.com/api/v1/focus-session/all/${year}`
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 401) {
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
    async getFocusSession(@Param('id') focusSessionId: number, @Req() req: any) {
        try {
            const getFocusSession = await this.focusSessionService.getFocusSession(focusSessionId, req.user.sub);
            const response = {
                completionTime: getFocusSession.completionTime,
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
            if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 404) {
                throw new NotFoundException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
}
