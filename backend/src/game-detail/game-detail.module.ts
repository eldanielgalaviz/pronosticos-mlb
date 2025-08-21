import { Module } from '@nestjs/common';
import { GameDetailService } from './game-detail.service';
import { GameDetailController } from './game-detail.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GameDetailService],
  controllers: [GameDetailController],
})
export class GameDetailModule {}
