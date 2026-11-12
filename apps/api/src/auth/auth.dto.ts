import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator'

export class LoginDto {
  /** Identificador da Câmara (slug). Omitir apenas para administradores da plataforma. */
  @IsOptional() @IsString() camara?: string
  @IsEmail() email: string
  @IsString() senha: string
  @IsOptional() @Matches(/^\d{6}$/, { message: 'Código deve ter 6 dígitos.' }) codigo?: string
}

export class ConfirmarMfaDto {
  @Matches(/^\d{6}$/, { message: 'Código deve ter 6 dígitos.' }) codigo: string
}

export class TrocarSenhaDto {
  @IsString() senhaAtual: string
  @IsString() @Length(10, 128, { message: 'A nova senha deve ter entre 10 e 128 caracteres.' }) novaSenha: string
}
