import { Request, Response } from 'express';
import CalendarSetting from '../models/CalendarSetting';

// @desc    Get all calendar settings for a user
// @route   GET /api/calendar-settings
// @access  Private
export const getCalendarSettings = async (req: Request, res: Response) => {
  try {
    const settings = await CalendarSetting.findAll({
      where: { userId: req.user.id },
    });
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Create or update calendar setting
// @route   POST /api/calendar-settings
// @access  Private
export const upsertCalendarSetting = async (req: Request, res: Response) => {
  try {
    const {
      calendarId,
      calendarType,
      visible,
      considerInConflicts,
      summary,
      description,
      backgroundColor,
    } = req.body;

    // Check if setting already exists
    let setting = await CalendarSetting.findOne({
      where: { 
        userId: req.user.id,
        calendarId,
      },
    });

    if (setting) {
      // Update existing setting
      await setting.update({
        calendarType,
        visible,
        considerInConflicts,
        summary,
        description,
        backgroundColor,
      });
      
      // Reload to get updated data
      await setting.reload();
    } else {
      // Create new setting
      setting = await CalendarSetting.create({
        userId: req.user.id,
        calendarId,
        calendarType,
        visible,
        considerInConflicts,
        summary,
        description,
        backgroundColor,
      });
    }

    res.status(200).json(setting);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Delete calendar setting
// @route   DELETE /api/calendar-settings/:id
// @access  Private
export const deleteCalendarSetting = async (req: Request, res: Response) => {
  try {
    const setting = await CalendarSetting.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!setting) {
      return res.status(404).json({ message: 'Calendar setting not found' });
    }

    await setting.destroy();
    res.json({ message: 'Calendar setting removed' });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};