import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity.js';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Team])], //Usaremos la entity Team
  controllers: [TeamsController], //Usaremos el controlador TeamsController
  providers: [TeamsService], //Usaremos el servicio TeamsService
})
export class TeamsModule {}
