import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GamesService],
  controllers: [GamesController],
  exports: [GamesService], 
})
export class GamesModule {}
