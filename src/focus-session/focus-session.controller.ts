import { BadRequestException, Body, Controller, InternalServerErrorException, Post, Req, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenGuard } from 'src/auth/auth.guard';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { FocusSessionService } from './focus-session.service';

@Controller('focus-session')
export class FocusSessionController {
    private readonly focusSessionService: FocusSessionService
    @UseGuards(AuthenGuard)
    @Post()
    async create(@Body(new ValidationPipe()) createFocusSessionDto: CreateFocusSessionDto, @Req() req: any) {
        try {
            const createFocusSession = await this.focusSessionService.create();
            const response = null;
            return {
                data: {
                    response,
                    ref: ``
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
}
