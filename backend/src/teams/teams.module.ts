import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService], // Exporting TeamsService for use in other modules
})
export class TeamsModule {}
