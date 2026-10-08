import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { AllExceptionsHandler } from './interceptors/all-exceptions-handler.intercept.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalFilters(new AllExceptionsHandler())
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
