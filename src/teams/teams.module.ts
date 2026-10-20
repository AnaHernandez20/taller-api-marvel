import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity.js';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';
import { Character } from '../characters/entities/character.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Character])], //Usaremos la entity Team y Character para poder hacer la relacion entre ellas
  controllers: [TeamsController], //Usaremos el controlador TeamsController
  providers: [TeamsService], //Usaremos el servicio TeamsService
})
export class TeamsModule {}
