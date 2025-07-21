// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// Error response formatter
const formatErrorResponse = (error) => {
  const response = {
    error: error.message || 'Something went wrong',
    status: error.status || 'error'
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = error;
  }

  return response;
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user ? req.user._id : 'unauthenticated'
  });

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new ValidationError(`${field} already exists`);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    err = new ValidationError(errors.join(', '));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    err = new AuthenticationError('Token expired');
  }

  // Send error response
  res.status(err.statusCode).json(formatErrorResponse(err));
};

// Validation helper
const validateRequired = (data, fields) => {
  const missing = [];
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Success response formatter
const formatSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  formatErrorResponse,
  formatSuccessResponse,
  asyncHandler,
  globalErrorHandler,
  validateRequired
};
