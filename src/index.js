require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index');
const { getEnvVar } = require('./utils/getEnvVar.js');
const errorMiddleware = require('./middlewares/error-middleware.js');

const PORT = process.env.PORT || 5000;
const app = express();

const ALLOWED_ORIGINS = process.env.CLIENT_URLS 
    ? process.env.CLIENT_URLS.split(',').map(url => url.trim()).filter(url => url.length > 0)
    : ['http://localhost:3002'];
console.log('Server Mode:', process.env.NODE_ENV || 'development');
console.log('✅ CORS allowed origins:', ALLOWED_ORIGINS);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    const normalizedOrigin = origin ? origin.trim() : ''; 

    if (!origin || ALLOWED_ORIGINS.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.error('❌ CORS BLOCKED REQUEST: Origin', origin);
      console.error('   Expected one of:', ALLOWED_ORIGINS);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(getEnvVar('MONGO_DB_URL'));
    app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();