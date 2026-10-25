import { IsEnum } from 'class-validator';
import { CharacterStatus } from '../enums/character-status.enum.js';

export class UpdateCharacterStatusDto {

    //El nuevo estado es obligatorio y debe ser uno de los valores permitidos en el enum q está en CharacterStatus
    @IsEnum(CharacterStatus)
    status: CharacterStatus;
}