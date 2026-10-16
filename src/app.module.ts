import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller.js';
import { UsersController } from './users/users.controller.js';
import { AdminModule } from './admin/admin.module.js';
import { S3Service } from './aws/s3/s3.service.js';
import { S3Module } from './s3/s3.module.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

// -MIMO: Import the admin feature so its protected user-management routes are registered.
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
    AdminModule,
    SupabaseModule,
    S3Module,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, S3Service],
})
export class AppModule {}
