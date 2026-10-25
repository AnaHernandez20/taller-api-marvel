import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity.js';
import { DataSource, In } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { AssignCharactersDto } from './dto/assign-characters.dto.js';
import { Character } from '../characters/entities/character.entity.js';


@Injectable() //pa poder inyectar el servicio en el controlador
export class TeamsService {

    constructor(
        @InjectRepository(Team) //Inyectamos el repositorio de la entidad Team para poder usarlo en el servicio
        private readonly teamRepository: Repository<Team>, //Aqui queda el repositorio de la entidad Team para poder usarlo en el servicio
        private readonly dataSource: DataSource, //Inyectamos DataSource para revertir la transaccion en caso de error al crear un equipo con personajes que no existen
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
            //Con esta excepcion, el controlador devolvera un error 404 con el mensaje que le damos
        }

        return team;
    }

    //Metodo para obtener todos los personajes de un equipo por el ID del equipo
    async findCharacters(id: number) {
        //Buscamos el equipo por su ID y obtenemos sus personajes relacionados
        const team = await this.teamRepository.findOne({
            where: { id },
            relations: { characters: true }, //de las relaciones, tmb devuelvame los personajes asociados al equipo
        });

        //Si no existe un equipo con el ID proporcionado, lanzamos una excepcion NotFoundException qque da un error 404 con el mensaje que damos
        if (!team) {
            throw new NotFoundException(`No existe un equipo con ID ${id}`);
        }

        return team.characters;
    }

    //Metodo para crear un nuevo equipo y asignarle personajes existentes
    async create(datosEquipo: CreateTeamDto): Promise<Team> {

        //Separar los IDs de personajes de los datos del equipo
        const { characterIds: identificadoresPersonajes, ...datosNuevoEquipo } = datosEquipo;

        //Ahora hay que verificar que no exista otro equipo con el mismo nombre
        const equipoExistente = await this.teamRepository.findOneBy({
            name: datosNuevoEquipo.name,
        });

        //Si ya existe un equipo con el mismo nombre, lanzamos una excepcion ConflictException que da un error 409
        if (equipoExistente) {
            throw new ConflictException('Ya existe un equipo con ese nombre');
        }

        //Si asignamos personajes y el equipo es inactivo, lanzamos una excepcion BadRequestException que da un error 400
        if (identificadoresPersonajes?.length && datosNuevoEquipo.active === false) {
            throw new BadRequestException('No se pueden asignar personajes a un equipo inactivo');
        }

        //Verificamos que los IDS que se ponen no se repiten
        if (identificadoresPersonajes &&
            //un set porque en 1 set no hay repetidos y si el tamaño del set es diferente al tamaño del arreglo de ids, entonces hay repetidos
            new Set(identificadoresPersonajes).size !== identificadoresPersonajes.length
        ) {
            //Si hay repetidos, lanzamos una excepcion BadRequestException que da un error 400
            throw new BadRequestException('No se pueden repetir identificadores de personajes');
        }

        //Si todo esta bien, intentamos crear el equipo y le asignamos los personajes existentes:

        //LA PARTE DE LA TRANSACCION ES PARA QUE SI HAY UN ERROR AL ASIGNAR PERSONAJES, NO SE GUARDE EL EQUIPO
        //O SEA AQUI YA VAMOS A MODIFICAR LA BASE DE DATOS, POR ESO USAMOS UNA TRANSACCION PARA QUE SI HAY UN ERROR, SE REVIERTA TODO
            
        return await this.dataSource.transaction(async (entityManager) => {

            //Comprobamos que todos los personajes existan
            if (identificadoresPersonajes?.length) {

                //Aqui se itera sobres los ids y se crea identificadoresPersonajes que es un arreglo de los ids de los personajes que se quieren asignar al equipo
                const personajes = await entityManager.find(Character, {
                    where: { id: In(identificadoresPersonajes) },
                });

                //Si la cantidad de personajes encontrados es diferente a la cantidad de ids enviados, significa que uno o más personajes no existen
                //en ese caso lanzamos una excepcion NotFoundException que da un error 404 con el mensaje que damos
                if (personajes.length !== identificadoresPersonajes.length) {
                    throw new NotFoundException(
                        'Uno o más personajes no existen',
                    );
                }
            }

            //Ahora si todo esta bien, creamos el equipo y le asignamos los personajes existentes
            const nuevoEquipo = entityManager.create(Team, datosNuevoEquipo); //lo creamos en memoria
            const equipoGuardado = await entityManager.save(Team, nuevoEquipo); //lo guardamos en la BD

            //Asignamos los personajes existentes al equipo.
            if (identificadoresPersonajes?.length) {
                //aqui se asignan los personajes al equipo con un update
                //vamos uno por uno los personajes y les ponemos el teamId del equipo que acabamos de crear 
                //si ya tenia un equipo, se reemplaza por el nuevo equipo XD
                await entityManager.update(
                    Character,
                    { id: In(identificadoresPersonajes) },
                    { teamId: equipoGuardado.id },
                );
            }

            return equipoGuardado;
        });

    }

    //Metodo para actualizar un equipo existente
    async update(id: number, datosEquipo: UpdateTeamDto): Promise<Team> {

        //Verificar que el equipo exista
        const equipo = await this.teamRepository.findOneBy({ id });

        //Si no existe un equipo con el ID proporcionado, lanzamos una excepcion NotFoundException que da un error 404 con el mensaje que damos
        if (!equipo) {
            throw new NotFoundException(`No existe un equipo con ID ${id}`);
        }

        //Verificamos que el nuevo nombre no pertenezca a otro equipo
        const equipoMismoNombre = await this.teamRepository.findOneBy({ name: datosEquipo.name });

        //Si ya existe otro equipo con el mismo nombre, lanzamos una excepcion ConflictException que da un error 409 con el mensaje que damos
        if (equipoMismoNombre && equipoMismoNombre.id !== id) {
            throw new ConflictException('Ya existe otro equipo con ese nombre');
        }

        //Si llegamos hasta aqui, significa que el equipo existe y el nombre no pertenece a otro equipo, 
        //entonces actualizamos los datos del equipo
        equipo.name = datosEquipo.name;
        equipo.base = datosEquipo.base;
        equipo.foundedYear = datosEquipo.foundedYear;
        equipo.active = datosEquipo.active;

        //y lo guardamos en la BD
        return await this.teamRepository.save(equipo);
    }

    //Metodo para asignar 1 o varios personajes existentes a un equipo existente
    async assignCharacters(id: number, datosAsignacion: AssignCharactersDto): Promise<Team> {

        //Hacemos una transaccion para que si hay un error al asignar personajes, no se guarde el equipo
        return await this.dataSource.transaction(async (entityManager) => {

            //Buscar el equipo al que asignaremos los personajes
            const equipo = await entityManager.findOne(Team, {where: { id } });

            //Verificar que el equipo exista, si no existe lanzamos una excepcion NotFoundException que da un error 404 con el mensaje que damos
            if (!equipo) {
                throw new NotFoundException(`No existe un equipo con ID ${id}`);
            }

            //Verificar que el equipo esté activo, sino no se pueden asignar personajes y lanzamos una excepcion BadRequestException que da un error 400 con el mensaje que damos
            if (!equipo.active) {
                throw new BadRequestException('No se pueden asignar personajes a un equipo inactivo');
            }

            //Obtener los ids de los personajes enviados en la petición
            const idsPersonajes = datosAsignacion.characterIds;

            //Buscar los personajes en PostgreSQL (x eso es con EntityManager) que tengan esos ids
            const personajes = await entityManager.find(Character, {
                where: { id: In(idsPersonajes) }
            });

            //Comprobar que todos los personajes existan, si no existen lanzamos una excepcion NotFoundException que da un error 404 con el mensaje que damos
            if (personajes.length !== idsPersonajes.length) {
                throw new NotFoundException('Uno o más personajes no existen');
            }

            //Asignar los personajes al equipo solicitado, eso lo hacemos con
            //un update de la entidad Character, donde le ponemos el teamId del equipo al que queremos asignar los personajes
            await entityManager.update( 
                Character,
                { id: In(idsPersonajes) },
                { teamId: equipo.id },
            );

            //Ahora obtenemos el equipo actualizado con sus personajes asignados, para eso hacemos un findOneOrFail de la entidad Team, 
            //donde le ponemos el id del equipo y le decimos que queremos que nos traiga los personajes relacionados
            const equipoActualizado = await entityManager.findOneOrFail(Team, {
                where: { id },
                relations: { characters: true }, //de las relaciones, tmb devuelvame los personajes asociados al equipo
            });

            //y devolvemos el equipo actualizado con sus personajes asignados
            return equipoActualizado;
        });
    }

    //Metodo para eliminar un equipo existente
    async remove(id: number): Promise<{ mensaje: string }> {

        //Buscar el equipo que queremos eliminar
        const equipo = await this.teamRepository.findOne({
            where: { id },
            relations: { characters: true }, //de las relaciones, tmb devuelvame los personajes asociados al equipo, para poder verificar si tiene personajes asociados y no permitir eliminarlo
        });

        //Verificar que el equipo exista, si no existe lanzamos una excepcion NotFoundException que da un error 404 con el mensaje que damos
        if (!equipo) {
            throw new NotFoundException(`No existe un equipo con ID ${id}`);
        }

        //No permitir eliminar equipos con personajes asociados, si tiene personajes asociados lanzamos una excepcion ConflictException que da un error 409 con el mensaje que damos
        if (equipo.characters.length > 0) {
            throw new ConflictException('No se puede eliminar un equipo que tiene personajes asociados');
        }

        //Si llegamos aquí, el equipo no tiene personajes asociados, por lo que podemos eliminarlo de postgresql
        await this.teamRepository.remove(equipo);

        //devuelvo un mensaje de que todo salió bien, el equipo fue eliminado correctamente
        return {
            mensaje: `El equipo con ID ${id} fue eliminado correctamente`,
        };
    }
}
