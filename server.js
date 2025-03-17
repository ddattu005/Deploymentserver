const jsonServer = require("json-server");
const server = jsonServer.create();
const middleware = jsonServer.defaults();
const router = jsonServer.router("data/db.json");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Use environment variable for port
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app-domain.vercel.app', 'http://localhost:5177']
    : 'http://localhost:5177',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
server.use(cors(corsOptions));
server.use(bodyParser.json());
server.use(middleware);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // In a real app, validate against database
  // This is just for demo purposes
  if (email && password) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ 
      token,
      user: {
        email,
        name: 'Demo User',
        balance: 100000
      }
    });
  } else {
    res.status(400).json({ message: 'Email and password required' });
  }
});

// Protected routes
server.use('/api', authenticateToken, router);

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
