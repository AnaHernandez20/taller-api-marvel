import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity.js';
import { Character } from '../characters/entities/character.entity.js';

@Injectable() //pa poder inyectar el servicio en el controlador
export class TeamsService {

    constructor(
        @InjectRepository(Team) //Inyectamos el repositorio de la entidad Team para poder usarlo en el servicio
        private readonly teamRepository: Repository<Team>, //Aqui queda el repositorio de la entidad Team para poder usarlo en el servicio
    ) {}

    //Metodo para obtener todos los equipos de la base de datos
    async findAll(): Promise<Team[]> {
        return await this.teamRepository.find();
    }

    //Metodo para obtener un equipo por su ID
    async findOne(id: number): Promise<Team> {
        const team = await this.teamRepository.findOneBy({ id });

        //Si no existe un equipo con el ID proporcionado, lanzamos una excepcion NotFoundException
        if (!team) {
            throw new NotFoundException(`No existe un equipo con ID ${id}`); 
            //Con esta excepcion, el controlador devolvera un error 404 con el mensaje proporcionado
        }

        return team;
    }

    //Metodo para obtener todos los personajes de un equipo por el ID del equipo
    async findCharacters(id: number) {
        //Buscamos el equipo por su ID y obtenemos sus personajes relacionados
        const team = await this.teamRepository.findOne({
            where: { id },
            relations: { characters: true },
        });
        //Si no existe un equipo con el ID proporcionado, lanzamos una excepcion NotFoundException qque da un error 404 con el mensaje proporcionado
        if (!team) {
            throw new NotFoundException(`No existe un equipo con ID ${id}`);
        }

        return team.characters;
    }


}
