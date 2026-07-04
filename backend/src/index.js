const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { frontend_url } = require('./config')


const taskRoutes = require('./routes/tasks.routes')
const userRoutes = require('./routes/users.routes')

const app = express();

app.use(cors({
  origin: frontend_url, 
  credentials: true 
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.use(userRoutes);
app.use(taskRoutes);

app.use((err, req, res, next) =>{

    return res.json({
        message: err.message
    });

});

app.listen(4000);

console.log('Server on port 4000');