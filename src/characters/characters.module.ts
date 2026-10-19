import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity.js';
import { CharactersController } from './characters.controller.js';
import { CharactersService } from './characters.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Character])], //Usaremos la entity Character
  controllers: [CharactersController], //Usaremos el controlador CharactersController
  providers: [CharactersService], //Usaremos el servicio CharactersService
})
export class CharactersModule {}
