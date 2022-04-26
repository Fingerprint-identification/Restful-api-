const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const dbConnection = require('./config/database');
const mountRoutes = require('./routes');

const globalErrorHandler = require('./middlewares/errorMiddelware');
const appSecuirty = require('./utils/appSecuirty');

dotenv.config();
dbConnection();
const app = express();
appSecuirty(app);

app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mountes Routes
mountRoutes(app);

app.use(globalErrorHandler);
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

// handling Rejection Errors
process.on('unhandledRejection', (err) => {
  console.error(`unhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
