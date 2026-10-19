import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { AllExceptionsHandler } from './interceptors/all-exceptions-handler.intercept.js';
import { LoggingInterceptor } from './interceptors/request-logs.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  // -MIMO: Apply request logging to all HTTP routes.
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsHandler());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
