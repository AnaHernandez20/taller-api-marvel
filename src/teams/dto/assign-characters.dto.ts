import { IsArray, IsInt, ArrayNotEmpty, ArrayUnique} from 'class-validator';

//este DTO es para asignar 1 o varios personajes existentes a un equipo existente (hacer el PATCH /teams/:id/characters)
export class AssignCharactersDto {

    //Lista obligatoria de IDs de personajes que queremos asignar
    @IsArray()
    @ArrayNotEmpty() //El arreglo no puede estar vacío
    @IsInt({ each: true }) //Cada elemento del arreglo debe ser un entero xq son IDs de personajes
    @ArrayUnique() //Cada elemento del arreglo debe ser único, no puede repetirse un mismo ID de personaje
    characterIds: number[]; 
}
