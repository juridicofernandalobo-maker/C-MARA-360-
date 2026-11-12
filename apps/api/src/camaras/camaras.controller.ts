import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import type { EspecieConfig, RegrasCasa } from '@camara360/rito'
import { camaraDo } from '../comum/camara'
import { Papeis, Usuario } from '../comum/decoradores'
import type { UsuarioToken } from '../comum/papeis'
import { ComissaoDto, CriarCamaraDto } from './camaras.dto'
import { CamarasService } from './camaras.service'

@Controller('camaras')
export class CamarasController {
  constructor(private camaras: CamarasService) {}

  @Papeis('plataforma')
  @Post()
  criar(@Body() dto: CriarCamaraDto) {
    return this.camaras.criar(dto)
  }

  @Papeis('plataforma')
  @Get()
  listar() {
    return this.camaras.listarTodas()
  }

  @Get('atual')
  atual(@Usuario() u: UsuarioToken) {
    return this.camaras.obter(camaraDo(u))
  }

  @Papeis('presidente', 'mesa', 'administrador')
  @Put('atual/regras')
  regras(@Usuario() u: UsuarioToken, @Body() regras: RegrasCasa) {
    return this.camaras.atualizarRegras(camaraDo(u), regras)
  }

  @Papeis('presidente', 'mesa', 'administrador')
  @Put('atual/especies/:sigla')
  especie(@Usuario() u: UsuarioToken, @Param('sigla') sigla: string, @Body() config: EspecieConfig) {
    return this.camaras.atualizarEspecie(camaraDo(u), sigla, config)
  }

  @Papeis('presidente', 'mesa', 'administrador')
  @Post('atual/comissoes')
  comissao(@Usuario() u: UsuarioToken, @Body() dto: ComissaoDto) {
    return this.camaras.criarComissao(camaraDo(u), dto)
  }
}
