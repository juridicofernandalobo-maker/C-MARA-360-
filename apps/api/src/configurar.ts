import { INestApplication, ValidationPipe } from '@nestjs/common'

/** Configuração comum à aplicação e aos testes. */
export function configurar(app: INestApplication) {
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.enableShutdownHooks()
}
