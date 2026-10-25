
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity.js';
import { CreateCharacterDto } from './dto/create-character.dto.js';
import { UpdateCharacterDto } from './dto/update-character.dto.js';
import { UpdateCharacterStatusDto } from './dto/update-character-status.dto.js';
import { Team } from '../teams/entities/team.entity.js';
import { CharacterStatus } from './enums/character-status.enum.js';

@Injectable()
export class CharactersService {

    constructor(
        @InjectRepository(Character)
        private readonly characterRepository: Repository<Character>, 
        //inyecto el repositorio de equipos para poder realizar operaciones sobre ellos en la base de datos

        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>
        //inyecto el repositorio de equipos para poder realizar operaciones sobre ellos en la base de datos
    ) {}

    //En clase dijimos que de general a especifico

    //Consulta los personajes y permite filtrar por estado y equipo
    //El estado puede ser ACTIVE, INJURED, MISSING o RETIRED y idEquipo es un número que representa el ID del equipo xd
    //Son variables opcionales, si no se pasan, se devuelven todos los personajes sin filtrar y yap
    async findAll(estado?: string, idEquipo?: number): Promise<Character[]> {

        //Crear las condiciones de búsqueda (o sea, armar un objeto con los filtros que se van a aplicar)
        const condiciones: {
            status?: string;
            teamId?: number;
        } = {};

        //Agregar filtro de estado cuando se escribe. Si estado es undefined, no se agrega el filtro
        //Recordar q undefined significa que no se pasó ninguna valor
        if (estado !== undefined) {
            condiciones.status = estado;
        }

        //Agregar filtro de equipo cuando se escribe. Si idEquipo es undefined, no se agrega el filtro
        if (idEquipo !== undefined) {
            condiciones.teamId = idEquipo;
        }

        //Consultar los personajes que cumplen las condiciones (o sea los que coinciden con los filtros aplicados)
        return await this.characterRepository.find({
            where: condiciones //tome todos los personajes que coinciden con los filtros aplicados (si no hay, pues devuelve todos)
        });
    }

    //Consulta un personaje por su ID, incluyendo todos los datos de su equipo
    async findOne(id: number): Promise<Character> {

        const personaje = await this.characterRepository.findOne({
            where: { id }, //el personaje que tenga este id
            relations: { team: true } //traigame todos sus datos y tambien los del equipo al que pertenece
        });

        //Si el personaje no existe, devolvemos 404
        if (!personaje) {
            throw new NotFoundException(`No existe un personaje con ID ${id}`);
        }

        return personaje;
    }

    //Crea un nuevo personaje en la base de datos
    //Toca verificar que no exista otro personaje con el mismo alias y que el equipo asignado exista y esté activo
    async create(datosPersonaje: CreateCharacterDto): Promise<Character> {
        //como parametro llega el DTO con los datos del personaje a crear

        //Verificar que no exista otro personaje con el mismo alias
        const personajeExistente = await this.characterRepository.findOneBy({
            alias: datosPersonaje.alias //busco el personaje por su alias
        });

        //Si el personaje ya existe es porque ya hay otro personaje con ese alias, entonces se lanza una ConflictExceptioon (error 409)
        if (personajeExistente) {
            throw new ConflictException('Ya existe un personaje con este alias');
        }

        //Si se envía un equipo, comprobar que exista y esté activo
        if (datosPersonaje.teamId != null) {

            //Buscamos el equipo en la base de datos
            const equipo = await this.teamRepository.findOneBy({
                id: datosPersonaje.teamId //traigame el equipo que tenga este ID
            });

            //Si el equipo no existe, lanzamos una NotFoundException
            if (!equipo) {
                throw new NotFoundException(`No existe un equipo con ID ${datosPersonaje.teamId}`);
            }

            //Si el equipo no está activo, se lanza una BadRequestException (error 400)
            if (!equipo.active) {
                throw new BadRequestException('No se puede asignar un personaje a un equipo inactivo');
            }
        }

        //Crear el objeto de la entidad Character en memoria
        const nuevoPersonaje = this.characterRepository.create({
            ...datosPersonaje, //ponemos los datos del personaje que vienen del DTO
            teamId: datosPersonaje.teamId ?? null //y su id de equipo, si no se da pues se pone en null
        });

        return await this.characterRepository.save(nuevoPersonaje); //guardamos el nuevo personaje en la base de datos

    }

    //Metodo update para reemplazar un personaje completo (hacer el put)
    async update(id: number, datosPersonaje: UpdateCharacterDto): Promise<Character> {
        //como parametro llega el ID del personaje a actualizar y el DTO con los nuevos datos

        //Verificar que el personaje exista
        const personaje = await this.characterRepository.findOneBy({ id });

        //Si el personaje no existe, lanzamos una NotFoundException
        if (!personaje) {
            throw new NotFoundException(`No existe un personaje con ID ${id}`);
        }

        //No permitir que un personaje RETIRED pase directamente a INJURED
        if (
            //si el personaje está retirado y se intenta cambiar su estado a lesionado
            personaje.status === CharacterStatus.RETIRED && datosPersonaje.status === CharacterStatus.INJURED
        ) {
            throw new BadRequestException('Un personaje retirado no puede pasar directamente a lesionado');
        }

        //Verificar que el alias no pertenezca a otro personaje
        const personajeMismoAlias = await this.characterRepository.findOneBy({
            alias: datosPersonaje.alias //traigame el personaje que tenga este alias
        });

        //Si existe otro personaje con el mismo alias o el mismo ID, se lanza una ConflictException que es el error 409
        if (personajeMismoAlias && personajeMismoAlias.id !== id) {
            throw new ConflictException('Ya existe otro personaje con ese alias');
        }

        //Si se indica el equipo, verificar que exista y esté activo
        if (datosPersonaje.teamId !== null) {
            
            //Verificamos el equipo del personaje
            const equipo = await this.teamRepository.findOneBy({
                id: datosPersonaje.teamId //traigame el equipo que tenga este ID
            });

            //Verificamos que el equipo exista
            if (!equipo) {
                throw new NotFoundException(`No existe un equipo con ID ${datosPersonaje.teamId}`);
            }

            //Verificamos que el equipo esté activo xq sino no se puede asignar un personaje a él (error BadRequest, 400)
            if (!equipo.active) {
                throw new BadRequestException('No se puede asignar un personaje a un equipo inactivo');
            }
        }

        //Reemplazar los datosa modificar del personaje en la entidad antes de guardarla
        personaje.realName = datosPersonaje.realName;
        personaje.alias = datosPersonaje.alias;
        personaje.mainPower = datosPersonaje.mainPower;
        personaje.powerLevel = datosPersonaje.powerLevel;
        personaje.status = datosPersonaje.status;
        personaje.isVillain = datosPersonaje.isVillain;
        personaje.teamId = datosPersonaje.teamId;

        //Guardar los cambios
        return await this.characterRepository.save(personaje);
        
    }

    //Actualiza únicamente el estado de un personaje
    async updateStatus(id: number, datosEstado: UpdateCharacterStatusDto): Promise<Character> {

        //Buscar el personaje por su ID
        const personaje = await this.characterRepository.findOneBy({ id });

        //Verificar que el personaje exista o da error NotFoundException
        if (!personaje) {
            throw new NotFoundException(`No existe un personaje con ID ${id}`);
        }

        //No permitir que un personaje RETIRED pase directamente a INJURED (o ponemos 400)
        if (
            personaje.status === CharacterStatus.RETIRED && //si el personaje está retirado
            datosEstado.status === CharacterStatus.INJURED //y en el dto se intenta poner como lesionado
        ) {
            //paila, no se puede hacer esa transición de estado
            throw new BadRequestException('Un personaje retirado no puede pasar directamente a lesionado');
        }

        //Actualizar únicamente el estado del personaje
        personaje.status = datosEstado.status;

        //Guardar el cambio en Postgresql yey
        return await this.characterRepository.save(personaje);
    }

    
    //Metodo para eliminar a un personaje de la base de datos
    async remove(id: number): Promise<{ mensaje: string }> {

        //Buscar el personaje que queremos eliminar
        const personaje = await this.characterRepository.findOneBy({ id });

        //Verificar que el personaje exista o error 404
        if (!personaje) {
            throw new NotFoundException(`No existe un personaje con ID ${id}`);
        }

        //Eliminar el personaje de postgresql
        await this.characterRepository.remove(personaje);

        //todo bien
        return {
            mensaje: `El personaje con ID ${id} fue eliminado correctamente`,
        };
    }







}
