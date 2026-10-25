import {IsString, IsNotEmpty, MaxLength, IsInt, Min, Max, IsBoolean, IsOptional, IsEnum, ValidateIf} from 'class-validator';
import { CharacterStatus } from '../enums/character-status.enum.js';

//dto para crear un nuevo personaje con post
export class CreateCharacterDto {

    //Nombre real obligatorio y de max 100 caracteres
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    realName: string;

    //Alias obligatorio y de max 100 caracteres
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    alias: string;

    //Poder principal obligatorio y de max 150 caracteres
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    mainPower: string;

    //Nivel de poder entero entre 1 y 100
    @IsInt()
    @Min(1)
    @Max(100)
    powerLevel: number;

    //Estado opcional, pero debe ser uno de los valores permitidos del enum
    @IsOptional()
    @IsEnum(CharacterStatus)
    status?: CharacterStatus;

    //Indica si el personaje es villano
    //Es opcional al crear porque postgresql utiliza FALSE por defecto
    //Si se envía, debe ser un booleano y no puede ser NULL
    @ValidateIf((objeto) => objeto.isVillain !== undefined) //si se envia, se valida que sea un booleano
    @IsBoolean()
    isVillain?: boolean;

    //Equipo opcional, pero puede ser NULL
    @IsOptional()
    @IsInt()
    teamId?: number | null;
}
