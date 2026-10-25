import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';

//Esta entidad representa la tabla characters de postgresql 
@Entity('characters')
export class Character {

    //Llave primaria generada solita por postgresql
    @PrimaryGeneratedColumn()
    id: number;

    //Nombre real del personaje
    @Column({ name: 'real_name', type: 'varchar', length: 100, nullable: false })
    realName: string;

    //Alias único y obligatorio con max 100 caracteres
    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    alias: string;

    //Poder principal del personaje es obligatorio con max 150 caracteres
    @Column({ name: 'main_power', type: 'varchar', length: 150, nullable: false })
    mainPower: string;

    //Nivel de poder q no puede ser NULL
    @Column({ name: 'power_level', type: 'integer', nullable: false })
    powerLevel: number;

    //Estado del personaje que nunca es null y su valor predeterminado es ACTIVE
    @Column({ type: 'varchar', length: 20, nullable: false, default: 'ACTIVE' })
    status: string;

    //Indica si el personaje es villano, que por defecto es FALSE y no puede ser NULL
    @Column({ name: 'is_villain', type: 'boolean', nullable: false, default: false })
    isVillain: boolean;

    //Llave foránea del equipo que tiene el personaje (puede ser null)
    @Column({ name: 'team_id', type: 'integer', nullable: true })
    teamId: number | null;

    //LECCION RE IMPORTANTE: Dentro de las entities hago las relaciones entre tablas de una vez
    //Y las hago de ambos lados (tanto en characters como en teams)

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
