import * as dotenv from 'dotenv';
import * as koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as winston from 'winston';
import { has } from './lib/utils';

const { combine, timestamp, prettyPrint } = winston.format;

dotenv.config();

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    prettyPrint()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = new koa();
app.use(bodyParser());

const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = 'logger server.';
  await next();
});

router.post('/api/log', async (ctx, next) => {
  const { body } = ctx.request;
  const allowedLevels = ['info', 'warn', 'error'];

  if (!has(body, 'level')) {
    ctx.body = 'level 不可缺';
    ctx.status = 400;
    await next();
    return;
  } else if (!allowedLevels.includes(body.level)) {
    ctx.body = 'level: '+ body.level +' 不属于' + allowedLevels.join(', ') + '中的任意一个';
    ctx.status = 400;
    await next();
    return;
  } else if (!has(body, 'message')) {
    ctx.body = 'message 不可缺';
    ctx.status = 400;
    await next();
    return;
  }
  
  logger.log(body);
  ctx.body = body;
  await next();
});

app.use(router.routes());

const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT || 3000, () => {
  console.log('visit app, http://127.0.0.1:' + PORT);
});
