import express from 'express';
import {
  getCalendarSettings,
  upsertCalendarSetting,
  deleteCalendarSetting,
} from '../controllers/calendarSettingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getCalendarSettings)
  .post(protect, upsertCalendarSetting);

router.route('/:id')
  .delete(protect, deleteCalendarSetting);

export default router;