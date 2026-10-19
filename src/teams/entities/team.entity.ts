//Importar herramientas de TypeORM para definir nuestra entidad y sus columnas
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Character } from '../../characters/entities/character.entity.js';

@Entity('teams') //esta es la entidad que representa la tabla teams en la base de datos
export class Team {
    //La propiedad id representa la llave primaria de la tabla y se genera automáticamente (la genera la base de datos en postgresql)
    @PrimaryGeneratedColumn()
    id: number;

    //la columna name es de tipo varchar, con una longitud máxima de 100 caracteres, debe ser única y no puede ser NULL
    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    name: string;

    //la columna base es de tipo varchar, con una longitud máxima de 150 caracteres y sí puede ser NULL
    @Column({ type: 'varchar', length: 150, nullable: true })
    base: string | null;

    //la columna founded_year es de tipo integer, puede ser NULL
    @Column({ name: 'founded_year', type: 'integer', nullable: true })
    foundedYear: number | null;

    //La columna active es de tipo boolean, no puede ser NULL y su valor predeterminado es true
    @Column({ type: 'boolean', nullable: false, default: true })
    active: boolean;

    //la columna created_at es de tipo TIMESTAMP, no puede ser NULL y registra cuándo se creó el equipo
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    //la columna updated_at es de tipo TIMESTAMP, no puede ser NULL y registra cuándo se actualizó el equipo
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    //Relación inversa donde un equipo puede tener muchos personajes
    @OneToMany(() => Character, character => character.team)
    characters: Character[];
}