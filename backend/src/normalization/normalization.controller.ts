import { Body, Controller, Post } from '@nestjs/common';
import { NormalizationService } from './normalization.service.js';
import { AnalyzeNormalizationDto } from './dto/analyze-normalization.dto.js';

@Controller('normalization')
export class NormalizationController {
  constructor(
    private readonly normalizationService: NormalizationService,
  ) {}

  @Post('analyze')
  analyze(@Body() data: AnalyzeNormalizationDto) {
    return this.normalizationService.analyze(data);
  }
}