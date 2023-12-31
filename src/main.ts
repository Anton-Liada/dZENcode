import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = +process.env.APP_PORT || 3000;

  app.enableCors({
    origin: process.env.FRONTEND_URL_DEV,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Accept, Authorization, Access-Control-Allow-Methods',
  });

  app.use(passport.initialize());
  app.use(cookieParser());

  await app.listen(PORT);
}
bootstrap();
