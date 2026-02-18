import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req: any, res: any, next: any) => {
    console.log('➡️ REQUEST');
    console.log({
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      query: req.query,
    });

    const oldJson: any = res.json;
    const oldSend: any = res.send;

    res.json = function (body: any) {
      console.log('⬅️ RESPONSE');
      console.log({
        statusCode: res.statusCode,
        body,
      });
      return oldJson.call(this, body);
    };

    res.send = function (body: any) {
      console.log('⬅️ RESPONSE');
      console.log({
        statusCode: res.statusCode,
        body,
      });
      return oldSend.call(this, body);
    };

    next();
  });

  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
