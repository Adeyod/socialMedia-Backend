import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import DBConfig from './DBConfig/DBConfig.js';
import userRoute from './routes/usersRoute.js';
import authRoute from './routes/authRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// serving my static files
app.use(express.static(path.join(__dirname, './utils/emailTemplates')));

app.get('/verify', (req, res) => {
  console.log('done');
  res.sendFile(
    path.join(__dirname, './utils/emailTemplates', 'verifyEmail.html')
  );
});

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
