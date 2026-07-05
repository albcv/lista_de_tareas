const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { frontend_url, port } = require('./config');


const taskRoutes = require('./routes/tasks.routes');
const userRoutes = require('./routes/users.routes');
const googleRoutes = require('./routes/google.routes');

const app = express();


app.use(cors({
  origin: frontend_url,
  credentials: true,
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.use(googleRoutes);  
app.use(userRoutes);   
app.use(taskRoutes);     


app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message });
});


app.listen(port, () => console.log(`✅ Servidor en puerto ${port}`));