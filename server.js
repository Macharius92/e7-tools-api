const debug = require('debug')('E7ToolsAPI');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const cors = require ('cors');

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

//Cross-Origin Requests allowed
app.use(cors());

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Logging
if (app.get('env') === 'development') {
    app.use(morgan('dev'));
}


// Sessions
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/characters', require('./routes/characters'));

const PORT = process.env.PORT || 3000;

app.listen(
    PORT,
    debug(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);