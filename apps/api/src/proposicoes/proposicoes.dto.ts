import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator'

export const TIPOS_AUTOR = ['vereador', 'mesa', 'comissao', 'prefeito', 'iniciativa_popular'] as const

export class CriarProposicaoDto {
  @Matches(/^[A-Z]{2,6}$/) especie: string
  @IsString() @Length(10, 1000) ementa: string
  @IsString() @Length(1, 500_000) texto: string
  /** Ignorado para vereador e assessor (a autoria é sempre o próprio gabinete). */
  @IsOptional() @IsIn(TIPOS_AUTOR) autorTipo?: (typeof TIPOS_AUTOR)[number]
  @IsOptional() @IsUUID() autorParlamentarId?: string
  @IsOptional() @IsString() @Length(3, 200) autorDescricao?: string
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) materias?: string[]
  @IsOptional() @IsIn(['ordinario', 'urgencia']) regime?: 'ordinario' | 'urgencia'
}

export class EditarProposicaoDto {
  @IsOptional() @IsString() @Length(10, 1000) ementa?: string
  @IsOptional() @IsString() @Length(1, 500_000) texto?: string
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) materias?: string[]
}
