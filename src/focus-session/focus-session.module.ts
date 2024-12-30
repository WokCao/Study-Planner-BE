import { Module } from '@nestjs/common';
import { FocusSessionService } from './focus-session.service';

@Module({
  providers: [FocusSessionService]
})
export class FocusSessionModule {}
