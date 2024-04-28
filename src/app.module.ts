import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './protected/protected.controller';

@Module({
  imports: [AuthModule],
  controllers: [AppController, ProtectedController],
  providers: [AppService],
})
export class AppModule {}
