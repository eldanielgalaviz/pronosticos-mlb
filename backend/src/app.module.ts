import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GamesModule } from './games/games.module';
import { GameDetailModule } from './game-detail/game-detail.module';
import { TeamsModule } from './teams/teams.module';
import { PlayersModule } from './players/players.module';
import { PredictionsModule } from './predictions/predictions.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // carga .env automáticamente
    GamesModule,
    GameDetailModule,
    TeamsModule,
    PlayersModule,
    TeamsModule,
    PredictionsModule,
  ],
  
})
export class AppModule {}
