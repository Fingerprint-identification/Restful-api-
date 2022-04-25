const authRoute = require('./authRoutes');
const userRoute = require('./userRoutes');

const mountRoutes = (app, express) => {
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/users', userRoute);
};

module.exports = mountRoutes;
