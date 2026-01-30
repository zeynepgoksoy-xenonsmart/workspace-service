import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [  ConfigModule.forRoot({
    isGlobal: true,  
  }),

  WorkspacesModule,
  PrismaModule,
],
  controllers: [],
  providers: [],
})
export class AppModule {}
