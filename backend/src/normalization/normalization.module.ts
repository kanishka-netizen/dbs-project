import { Module } from '@nestjs/common';
import { NormalizationController } from './normalization.controller.js';
import { NormalizationService } from './normalization.service.js';

@Module({
  controllers: [NormalizationController],
  providers: [NormalizationService],
})
export class NormalizationModule {}