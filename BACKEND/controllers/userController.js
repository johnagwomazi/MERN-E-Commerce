import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { AppError } from '../middleware/errorMiddleware.js';

const validRoles = ['customer', 'manager', 'admin'];

export const getUsers = async (req, res, next) => {
  try {
    const { q = '', role = '' } = req.query;
    const filter = {};
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) { next(error); }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!validRoles.includes(role)) throw new AppError('Invalid role value', 400);
    if (String(req.user._id) === req.params.id) throw new AppError('You cannot change your own role', 400);
    const target = await User.findById(req.params.id);
    if (!target) throw new AppError('User not found', 404);
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (target.role === 'admin' && role !== 'admin' && adminCount <= 1) {
      throw new AppError('Cannot remove the last admin', 400);
    }
    target.role = role;
    await target.save();
    await AuditLog.create({ action: 'role_changed', performedBy: req.user._id, targetId: target._id, metadata: { role } });
    res.json({ success: true, message: 'Role updated successfully', user: { id: target._id, name: target.name, email: target.email, role: target.role, createdAt: target.createdAt } });
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) throw new AppError('Admin cannot delete themselves', 400);
    const target = await User.findById(req.params.id);
    if (!target) throw new AppError('User not found', 404);
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (target.role === 'admin' && adminCount <= 1) throw new AppError('Cannot delete the last remaining admin', 400);
    await User.findByIdAndDelete(req.params.id);
    await AuditLog.create({ action: 'user_deleted', performedBy: req.user._id, targetId: target._id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) { next(error); }
};
