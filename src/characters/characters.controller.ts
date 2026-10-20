import {Controller, Get, Query, ParseIntPipe, ParseEnumPipe, Param, Post, Body, Put, Patch, Delete} from '@nestjs/common';
import { CharactersService } from './characters.service.js';
import { CharacterStatus } from './enums/character-status.enum.js';
import { CreateCharacterDto } from './dto/create-character.dto.js';
import { UpdateCharacterDto } from './dto/update-character.dto.js';
import { UpdateCharacterStatusDto } from './dto/update-character-status.dto.js';

@Controller('characters')
export class CharactersController {

    constructor(
        private readonly servicioPersonajes: CharactersService, //inyecto el servicio de personajes para poder realizar operaciones
    ) {}

    // GET /characters para consultar todos los personajes con filtros opcionales
    @Get()
    async findAll(
        //parseo a enum CharacterStatus (xq solo pueden tener los valores definidos en el enum)
        @Query('status', new ParseEnumPipe(CharacterStatus, { optional: true }))
        estado?: CharacterStatus,

        //parseo a número (xq los IDs de los equipos son números)
        @Query('teamId', new ParseIntPipe({ optional: true }))
        idEquipo?: number,
    ) {
        return await this.servicioPersonajes.findAll(estado, idEquipo);
    }

    
    // GET /characters/:id para consultar un personaje y su equipo
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.servicioPersonajes.findOne(id);
    }
    
    // POST /characters para crear un personaje nuevo
    @Post()
    async create(@Body() datosPersonaje: CreateCharacterDto) {
        return await this.servicioPersonajes.create(datosPersonaje); 
    }

    // PUT /characters/:id para reemplazar todos los datos de un personaje
    @Put(':id')
    async update(
        //parseo a número (xq los IDs de los personajes son números)
        @Param('id', ParseIntPipe) id: number,
        //y parseo el cuerpo de la solicitud a un DTO de actualización de personaje
        @Body() datosPersonaje: UpdateCharacterDto
    ) {
        return await this.servicioPersonajes.update(id, datosPersonaje);
    }

    // PATCH /characters/:id/status: modifica solo el estado de un personaje
    @Patch(':id/status')
    async updateStatus(
        //parseo a número (xq los IDs de los personajes son números)
        @Param('id', ParseIntPipe) id: number,
        //y parseo el cuerpo de la solicitud a un DTO de actualización de estado
        @Body() datosEstado: UpdateCharacterStatusDto
    ) {
        return await this.servicioPersonajes.updateStatus(id, datosEstado);
    }
    
    // DELETE /characters/:id elimina un personaje
    @Delete(':id')
    //parseo a número (xq los IDs de los personajes son números)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.servicioPersonajes.remove(id);
    }


}
