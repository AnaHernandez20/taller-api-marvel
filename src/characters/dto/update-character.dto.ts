import {IsString, IsNotEmpty, MaxLength, IsInt, Min, Max, IsBoolean, IsEnum, ValidateIf, IsDefined} from 'class-validator';
import { CharacterStatus } from '../enums/character-status.enum.js';

//dto para actualizar todo un personaje existente con put
export class UpdateCharacterDto {

    //Nombre real obligatorio y de máximo 100 caracteres
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    realName: string;

    //Alias obligatorio y de máximo 100 caracteres
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    alias: string;

    //Poder principal obligatorio y de máximo 150 caracteres
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    mainPower: string;

    //Nivel de poder obligatorio entre 1 y 100
    @IsInt()
    @Min(1)
    @Max(100)
    powerLevel: number;

    //Estado obligatorio y válido
    @IsEnum(CharacterStatus)
    status: CharacterStatus;

    //Indica si es villano. Obligatorio en este PUT y debe ser un valor booleano (true o false)
    @IsBoolean()
    isVillain: boolean;

    //El campo debe enviarse, pero puede ser NULL
    @ValidateIf((objeto) => objeto.teamId !== null) //si se envia, se valida que sea un entero
    @IsDefined()
    @IsInt()
    teamId: number | null;
}
