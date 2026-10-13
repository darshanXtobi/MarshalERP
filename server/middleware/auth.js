import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'marshal_erp_jwt_secret_key_2026_super_secure';

export function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['eps-token'] || req.headers['x-access-token'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired.' });
    }
    req.user = user;
    next();
  });
}

export function requireRole(...permittedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.userType === 'staff' && (permittedRoles.includes(req.user.role) || req.user.role === 'super_admin')) {
      return next();
    }
    return res.status(403).json({ error: `Forbidden: Requires one of [${permittedRoles.join(', ')}] roles.` });
  };
}

export function enforceStudentIsolation(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  // If user is staff, allow access
  if (req.user.userType === 'staff') return next();

  // If user is student, they can only view their own record
  const requestedStudentId = req.params.studentId || req.query.studentId || req.body.studentId;
  if (requestedStudentId && requestedStudentId !== req.user.studentId) {
    return res.status(403).json({ error: 'AccessForbidden: You are not authorized to view another student records.' });
  }
  next();
}
