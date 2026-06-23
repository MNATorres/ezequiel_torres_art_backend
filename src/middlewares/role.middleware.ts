import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';

export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Allows the action when the requester is an ADMIN or is operating on their own record.
export const authorizeSelfOrAdmin = (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user in request' });
  }

  const isAdmin = req.user.role === UserRole.ADMIN;
  const isSelf = req.user.id === req.params.id;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Forbidden: You can only access your own account' });
  }

  next();
};

// Prevents a non-admin from setting or changing the `role` field (privilege escalation).
export const preventRoleEscalation = (req: Request, res: Response, next: NextFunction) => {
  const isAdmin = req.user?.role === UserRole.ADMIN;

  if (!isAdmin && req.body && req.body.role !== undefined) {
    return res.status(403).json({ error: 'Forbidden: You are not allowed to set the role field' });
  }

  next();
};
