const authRoute = require('./authRoutes');
const userRoute = require('./userRoutes');
const reportRoute = require('./reportRoutes');

const mountRoutes = (app, express) => {
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/reports', reportRoute);
};

module.exports = mountRoutes;
