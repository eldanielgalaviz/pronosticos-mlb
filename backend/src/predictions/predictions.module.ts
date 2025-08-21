import { Module } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { GamesModule } from '../games/games.module';
import { TeamsModule } from '../teams/teams.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [GamesModule, TeamsModule, PlayersModule],
  providers: [PredictionsService],
  controllers: [PredictionsController],
})
export class PredictionsModule {}
