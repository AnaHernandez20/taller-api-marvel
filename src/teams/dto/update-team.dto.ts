import { IsString, IsNotEmpty, MaxLength, IsInt, Min, Max, IsBoolean, ValidateIf, IsDefined} from 'class-validator';

//Este update es para reemplazar todos los datos de un equipo, no es para actualizar parcialmente, para eso se haría un patch

export class UpdateTeamDto {

    //El nombre es obligatorio y de max 100 caracteres
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    //La base debe incluirse, pero puede ser null
    @IsDefined() //tiene que pasarse el valor de base, aunque sea null
    @ValidateIf((objeto) => objeto.base !== null) //Si el valor de base no es null, entonces se aplican las validaciones siguientess:
    @IsString()
    @MaxLength(150)
    base: string | null;

    //El año debe incluirse, pero puede ser null
    @IsDefined() //tiene que pasarse el valor, aunque sea null
    @ValidateIf((objeto) => objeto.foundedYear !== null) //Si el valor de foundedYear no es null, entonces se aplican las validaciones siguientes:
    @IsInt()
    @Min(1900)
    @Max(2100)
    foundedYear: number | null;

    //El estado activo es obligatorio sí o sí 
    @IsBoolean()
    active: boolean;
}
