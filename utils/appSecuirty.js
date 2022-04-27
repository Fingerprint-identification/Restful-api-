const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const MemoryStore = require('memorystore')(session);
// const cookieParser = require("cookie-parser");
// const csrf = require("csurf");

// const csrfProtection = csrf({ cookie: true });

const security = (app) => {
  app.use(cors());
  app.options('*', cors());
  app.use(compression());
  app.use(helmet());
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
        secure: true,
        httpOnly: true,
      }),
      secret: process.env.JWT_SECRET_KEY,
      resave: true,
      saveUninitialized: true,
    })
  );

  // To remove data, use:
  app.use(mongoSanitize());
  app.use(xss());

  // middleware to protect against HTTP Parameter Pollution attacks
  app.use(
    hpp({
      whitelist: [
        'price',
        'sold',
        'quantity',
        'ratingsAverage',
        'ratingsQuantity',
      ],
    })
  );

  // CSRUF
  // app.use(cookieParser());
  // app.use("/api/v1/auth", csrfProtection);
  // app.get("/form", csrfProtection, (req, res) => {
  //   // pass the csrfToken to the view
  //   res.send(req.csrfToken());
  // });
};

module.exports = security;
