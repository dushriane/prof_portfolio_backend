const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role} role required.` });
    }
    
    next();
  };
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  
  next();
};

const isWriter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  if (req.user.role !== 'writer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Writer or admin role required.' });
  }
  
  next();
};

const isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  next();
};

module.exports = {
  checkRole,
  isAdmin,
  isWriter,
  isUser
};
