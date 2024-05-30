module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/',
  jwtSecret: process.env.JWT_SECRET || 'your_default_jwt_secret'
};
