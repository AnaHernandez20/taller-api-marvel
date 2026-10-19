import { IsString, IsNotEmpty, MaxLength, IsInt, Min, Max, IsBoolean, IsOptional, IsArray, } from 'class-validator';

export class CreateTeamDto {

  //El nombre es obligatorio y tiene máximo 100 caracteres
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  //La base es opcional, puede ser NULL y tiene máximo 150 caracteres
  @IsOptional()
  @IsString()
  @MaxLength(150)
  base?: string | null;

  //El año es opcional, pero si hay debe estar entre 1900 y 2100
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  foundedYear?: number | null;

  //El estado activo es opcional y debe ser booleano
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  //IDs de personajes existentes que se asignarán al nuevo equipo
  //Es opcional, pero si se envía debe ser un arreglo de enteros
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  characterIds?: number[];

}
