import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Patch, Delete } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { AssignCharactersDto } from './dto/assign-characters.dto.js';
import { TeamsService } from './teams.service.js';

@Controller('teams')
export class TeamsController {

    constructor(
        private readonly teamsService: TeamsService, //Inyectamos el servicio que tiene la logiica para hacer las consultas a la base de datos
    ) {}

    // GET /teams para consultar todos los equipos. CCuando sea /teams es un get
    @Get()
    async findAll() {
        return await this.teamsService.findAll();
    }

    // GET /teams/:id para consultar un equipo por su ID. Cuando sea /teams/id es un get
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.teamsService.findOne(id);
    }

    // GET /teams/:id/characters para consultar todos los personajes de un equipo por el ID del equipo. Cuando sea /teams/id/characters es un get
    @Get(':id/characters')
    async findCharacters(@Param('id', ParseIntPipe) id: number) {
        return await this.teamsService.findCharacters(id);
    }

    // POST /teams: tomar los datos para crear un nuevo equipo. Cuando sea /teams y le mandemos un body, es un post 
    @Post()
    async create(@Body() datosEquipo: CreateTeamDto) {
        return await this.teamsService.create(datosEquipo);
    }

    // PUT /teams/:id para actualizar un equipo existente. Cuando sea /teams/id y le mandemos un body, es un put
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() datosEquipo: UpdateTeamDto) {
        return await this.teamsService.update(id, datosEquipo);
    }

    // PATCH /teams/:id/characters para asignar personajes a un equipo existente. Cuando sea /teams/id/characters y le mandemos un body, es un patch
    @Patch(':id/characters')
    async assignCharacters(@Param('id', ParseIntPipe) id: number, @Body() datosAsignacion: AssignCharactersDto) {
        return await this.teamsService.assignCharacters(id, datosAsignacion);
    }

    // DELETE /teams/:id para eliminar un equipo existente. Cuando sea /teams/id y le mandemos un id, es un delete
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.teamsService.remove(id);
    }

}
