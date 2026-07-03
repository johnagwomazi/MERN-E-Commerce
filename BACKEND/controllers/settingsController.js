import Setting from '../models/Setting.js';
import { AppError } from '../middleware/errorMiddleware.js';
import AuditLog from '../models/AuditLog.js';

const getSettingsDoc = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return settings;
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { requireManagerApproval } = req.body;
    if (typeof requireManagerApproval !== 'boolean') {
      throw new AppError('requireManagerApproval must be a boolean', 400);
    }
    const settings = await Setting.findOneAndUpdate({}, { requireManagerApproval }, { new: true, upsert: true });
    await AuditLog.create({ action: 'settings_changed', performedBy: req.user._id, targetId: settings._id, metadata: { requireManagerApproval } });
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const resolveSettings = getSettingsDoc;
