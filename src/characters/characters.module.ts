import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity.js';
import { CharactersController } from './characters.controller.js';
import { CharactersService } from './characters.service.js';
import { Team } from '../teams/entities/team.entity.js';

@Module({
  //UN modulo agrupa las entidades, controladores y servicios relacionados x eso:
  
  imports: [TypeOrmModule.forFeature([Character, Team])], //Usaremos la entity Character y Team
  controllers: [CharactersController], //Usaremos el controlador CharactersController
  providers: [CharactersService], //Usaremos el servicio CharactersService
})
export class CharactersModule {}
