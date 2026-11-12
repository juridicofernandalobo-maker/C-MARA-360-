import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { configurar } from './configurar'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  configurar(app)
  app.enableCors({ origin: process.env.CORS_ORIGEM?.split(',') ?? ['http://localhost:5173'] })
  const porta = Number(process.env.PORT ?? 3000)
  await app.listen(porta)
  console.log(`Câmara 360º API em http://localhost:${porta}/api`)
}
bootstrap()
