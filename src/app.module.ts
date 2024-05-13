import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './protected/protected.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Token],
      synchronize: true,
    }),
    UsersModule,
  ],
  controllers: [AppController, ProtectedController],
  providers: [AppService],
})
export class AppModule {}
