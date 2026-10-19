import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TeamsService } from './teams.service.js';

@Controller('teams')
export class TeamsController {

    constructor(
        private readonly teamsService: TeamsService, //Inyectamos el servicio que tiene la logiica para hacer las consultas a la base de datos
    ) {}

    // GET /teams: consulta todos los equipos. CCuando sea /teams es un get
    @Get()
    async findAll() {
        return await this.teamsService.findAll();
    }

    // GET /teams/:id: consulta un equipo por su ID. Cuando sea /teams/id es un get
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.teamsService.findOne(id);
    }

}
