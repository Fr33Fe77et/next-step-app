import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Task from '../models/Task';

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      category,
      estimatedTime,
      isRecurring,
      recurringPattern,
      tags,
      status = 'pending', // Add default status
    } = req.body;

    const task = await Task.create({
      userId: req.user.id,
      title,
      description,
      dueDate,
      priority,
      status, // Include status field
      category,
      estimatedTime,
      isRecurring,
      recurringPattern,
      tags: Array.isArray(tags) ? tags.join(',') : tags,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    
    // Format the response - convert tags from string to array
    const formattedTasks = tasks.map(task => {
      const plain = task.get({ plain: true });
      return {
        ...plain,
        tags: plain.tags ? plain.tags.split(',') : []
      };
    });
    
    res.json(formattedTasks);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Format the response - convert tags from string to array
    const plain = task.get({ plain: true });
    const formattedTask = {
      ...plain,
      tags: plain.tags ? plain.tags.split(',') : []
    };

    res.json(formattedTask);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: Request, res: Response) => {
  try {
    // Process tags if they're in the request
    if (req.body.tags && Array.isArray(req.body.tags)) {
      req.body.tags = req.body.tags.join(',');
    }

    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task
    await task.update(req.body);
    
    // Reload to get updated data
    await task.reload();

    // Format the response - convert tags from string to array
    const plain = task.get({ plain: true });
    const formattedTask = {
      ...plain,
      tags: plain.tags ? plain.tags.split(',') : []
    };

    res.json(formattedTask);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Get next task recommendation
// @route   GET /api/tasks/next
// @access  Private

export const getNextTask = async (req: Request, res: Response) => {
  console.log('getNextTask controller called with user:', req.user?.id);
  try {
    // Simple rule-based implementation for MVP
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // High priority tasks due today
    let nextTask = await Task.findOne({
      where: {
        userId: req.user.id,
        status: { [Op.ne]: 'completed' },
        priority: 'high',
        dueDate: { [Op.gte]: today, [Op.lt]: tomorrow }
      },
      order: [['dueDate', 'ASC']]
    });
    
    // Any tasks due today
    if (!nextTask) {
      nextTask = await Task.findOne({
        where: {
          userId: req.user.id,
          status: { [Op.ne]: 'completed' },
          dueDate: { [Op.gte]: today, [Op.lt]: tomorrow }
        },
        order: [['priority', 'DESC'], ['dueDate', 'ASC']]
      });
    }
    
    // High priority tasks due in the future
    if (!nextTask) {
      nextTask = await Task.findOne({
        where: {
          userId: req.user.id,
          status: { [Op.ne]: 'completed' },
          priority: 'high',
          dueDate: { [Op.gte]: tomorrow }
        },
        order: [['dueDate', 'ASC']]
      });
    }
    
    // Any incomplete tasks
    if (!nextTask) {
      nextTask = await Task.findOne({
        where: {
          userId: req.user.id,
          status: { [Op.ne]: 'completed' }
        },
        order: [['priority', 'DESC'], ['dueDate', 'ASC']]
      });
    }
    
    if (nextTask) {
      // Format the response - convert tags from string to array
      const plain = nextTask.get({ plain: true });
      const formattedTask = {
        ...plain,
        tags: plain.tags ? plain.tags.split(',') : []
      };
      
      res.json(formattedTask);
    } else {
      res.status(404).json({ message: 'No tasks found' });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};