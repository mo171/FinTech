/* 
  - AUTH MIDDLEWARE
  - JWT PARSING AND INFO PROCCESING 
*/

import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // * Authorization: Bearer <token> SENT FROM FRONTEND
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.replace('Bearer ', ''); // * Remove "Bearer " prefix

    const decoded = jwt.decode(token); // * DECODE JWT

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }
   
    /* 
      - SET USER INFO IN REQUEST OBJECT
      - THIS USER INFO WILL BE USED IN CONTROLLERS
    */
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
