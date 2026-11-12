import { Type } from 'class-transformer'
import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, Length, Matches, Max, Min, ValidateNested } from 'class-validator'

export class PresidenteInicialDto {
  @IsString() @Length(3, 120) nome: string
  @IsEmail() email: string
  @IsString() @Length(10, 128) senha: string
}

export class CriarCamaraDto {
  @Matches(/^[a-z0-9-]{3,60}$/, { message: 'slug: letras minúsculas, números e hífen.' }) slug: string
  @IsString() @Length(3, 150) nome: string
  @IsString() @Length(2, 100) municipio: string
  @Matches(/^[A-Z]{2}$/) uf: string
  @Matches(/^\d{7}$/, { message: 'Código IBGE deve ter 7 dígitos.' }) codigoIbge: string
  @Matches(/^\d{14}$/, { message: 'CNPJ deve ter 14 dígitos, sem pontuação.' }) cnpj: string
  @IsInt() @Min(9) @Max(55) totalMembros: number
  @IsOptional() @IsBoolean() exigirMfa?: boolean
  /** Primeiro usuário da Câmara (administrador), responsável por cadastrar os demais. */
  @ValidateNested() @Type(() => PresidenteInicialDto) administrador: PresidenteInicialDto
}

export class ComissaoDto {
  @Matches(/^[A-Z]{2,8}$/) sigla: string
  @IsString() @Length(3, 150) nome: string
  @IsOptional() @IsBoolean() permanente?: boolean
}
