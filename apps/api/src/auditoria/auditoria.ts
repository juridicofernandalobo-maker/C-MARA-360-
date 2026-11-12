import { CallHandler, Controller, ExecutionContext, Get, Injectable, NestInterceptor, Query } from '@nestjs/common'
import { Observable, catchError, tap, throwError } from 'rxjs'
import { camaraDo } from '../comum/camara'
import { Papeis, Usuario } from '../comum/decoradores'
import type { UsuarioToken } from '../comum/papeis'
import { PrismaService } from '../prisma/prisma.service'

const SENSIVEIS = /senha|codigo|segredo|token|mfa/i

function higienizar(corpo: unknown): unknown {
  if (Array.isArray(corpo)) return corpo.map(higienizar)
  if (corpo && typeof corpo === 'object') {
    return Object.fromEntries(Object.entries(corpo).map(([k, v]) => [k, SENSIVEIS.test(k) ? '[omitido]' : higienizar(v)]))
  }
  return corpo
}

/** Registra toda operação de escrita (sucesso ou falha) na trilha de auditoria. */
@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest()
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next.handle()

    const registrar = (status: number) => {
      const u: UsuarioToken | undefined = req.usuario
      return this.prisma.auditoria
        .create({
          data: {
            camaraId: u?.camaraId ?? null,
            usuarioId: u?.sub ?? null,
            metodo: req.method,
            rota: req.originalUrl,
            status,
            corpo: (higienizar(req.body) ?? undefined) as object,
            ip: req.ip,
          },
        })
        .catch(() => undefined)
    }
    return next.handle().pipe(
      tap(() => void registrar(ctx.switchToHttp().getResponse().statusCode)),
      catchError(err => {
        void registrar(err?.status ?? 500)
        return throwError(() => err)
      }),
    )
  }
}

@Controller('auditoria')
export class AuditoriaController {
  constructor(private prisma: PrismaService) {}

  @Papeis('presidente', 'administrador')
  @Get()
  async listar(@Usuario() u: UsuarioToken, @Query('limite') limite = '100') {
    const registros = await this.prisma.auditoria.findMany({
      where: { camaraId: camaraDo(u) },
      orderBy: { em: 'desc' },
      take: Math.min(Number(limite) || 100, 500),
    })
    return registros.map(r => ({ ...r, id: r.id.toString() }))
  }
}
