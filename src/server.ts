import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.get('/', (req, res) => {
  res.json({
    name: '租赁平台客服后端服务',
    version: '1.0.0',
    docs: `${API_PREFIX}/health`,
    endpoints: {
      consultations: `${API_PREFIX}/consultations`,
      complaints: `${API_PREFIX}/complaints`,
      'work-orders': `${API_PREFIX}/work-orders`,
      'service-records': `${API_PREFIX}/service-records`,
      'business-query': `${API_PREFIX}/business-query`,
      admin: `${API_PREFIX}/admin`,
    },
  });
});

app.use(API_PREFIX, routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
  🚀 租赁平台客服后端服务已启动
  📍 本地地址: http://localhost:${PORT}
  🔗 API 前缀: ${API_PREFIX}
  📊 健康检查: http://localhost:${PORT}${API_PREFIX}/health
  🛠  环境: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;
