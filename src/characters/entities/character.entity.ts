import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';

//Esta entidad representa la tabla characters de postgresql
@Entity('characters')
export class Character {

    //Llave primaria generada automáticamente por postgresql
    @PrimaryGeneratedColumn()
    id: number;

    //Nombre real del personaje tiene que ser obligatorio con máximo 100 caracteres
    @Column({ name: 'real_name', type: 'varchar', length: 100, nullable: false })
    realName: string;

    //Alias único y obligatorio con máximo 100 caracteres
    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    alias: string;

    //Poder principal del personaje es obligatorio con máximo 150 caracteres
    @Column({ name: 'main_power', type: 'varchar', length: 150, nullable: false })
    mainPower: string;

    //Nivel de poder. No puede ser NULL
    @Column({ name: 'power_level', type: 'integer', nullable: false })
    powerLevel: number;

    //Estado del personaje (ACTIVE, INJURED, MISSING o RETIRED) No puede ser NULL y su valor predeterminado es ACTIVE
    @Column({ type: 'varchar', length: 20, nullable: false, default: 'ACTIVE' })
    status: string;

    //Indica si el personaje es villano. Por defecto es FALSE. No puede ser NULL
    @Column({ name: 'is_villain', type: 'boolean', nullable: false, default: false })
    isVillain: boolean;

    //Llave foránea que identifica al equipo del personaje. Puede ser NULL si el personaje no pertenece a ningún equipo
    @Column({ name: 'team_id', type: 'integer', nullable: true })
    teamId: number | null;

    //Dentro de las entities hago las relaciones entre tablas 
    //Relación donde muchos personajes pueden pertenecer a un mismo equipo.
    @ManyToOne(() => Team, { nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'team_id' })
    team: Team | null;

    //Fecha de creación del personaje
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    //Fecha de última actualización del personaje
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
