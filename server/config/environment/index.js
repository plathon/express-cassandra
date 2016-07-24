var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  require('dotenv').config();
}