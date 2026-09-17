import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NormalizationModule } from './normalization/normalization.module.js';

@Module({
  imports: [NormalizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}