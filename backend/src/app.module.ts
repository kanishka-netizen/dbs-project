import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'node:path';
import fs from 'node:fs';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NormalizationModule } from './normalization/normalization.module.js';

const rootDist = path.resolve(process.cwd(), 'frontend', 'dist');
const parentDist = path.resolve(process.cwd(), '..', 'frontend', 'dist');
const frontendDist = fs.existsSync(rootDist)
  ? rootDist
  : fs.existsSync(parentDist)
    ? parentDist
    : null;

const staticModules = frontendDist
  ? [
      ServeStaticModule.forRoot({
        rootPath: frontendDist,
        exclude: ['/normalization/*path', '/api/*path', '/health'],
      }),
    ]
  : [];

@Module({
  imports: [...staticModules, NormalizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}