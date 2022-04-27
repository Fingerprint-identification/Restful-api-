const express = require('express');
const { useTreblle } = require('treblle');
const dotenv = require('dotenv');
const morgan = require('morgan');

const dbConnection = require('./config/database');
const mountRoutes = require('./routes');

const globalErrorHandler = require('./middlewares/errorMiddelware');
const appSecuirty = require('./utils/appSecuirty');
const ApiError = require('./utils/apiError');

dotenv.config();
dbConnection();
const app = express();

app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
// MONITOR ONLY the "production" ENVIROMENT
if (process.env.NODE_ENV === 'production') {
  useTreblle(app, {
    apiKey: 'KwJvDxuS0ZNxpMbb86xlPveYsG9tPahP',
    projectId: 'R6huJ8xblkd41Gfp',
  });
}
appSecuirty(app);
// Mountes Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  // Create Error and send it to error handler
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});

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
