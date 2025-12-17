import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.decode(token);
    console.log('Decoded JWT:', decoded);

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
    console.log('Authenticated user:', req.user);

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
