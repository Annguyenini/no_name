import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller.js';
import { UserController } from './user/user.controller.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'no-name',
    }),
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',

    }),
    AuthModule,
    UsersModule,
    SupabaseModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
