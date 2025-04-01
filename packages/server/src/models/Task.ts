import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Task attributes interface
interface TaskAttributes {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  category?: string;
  estimatedTime?: number;
  actualTime?: number;
  isRecurring: boolean;
  recurringPattern?: string;
  tags?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new task (id is optional)
interface TaskCreationAttributes extends Optional<TaskAttributes, 'id'> {}

// Task instance
class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public dueDate!: Date;
  public priority!: 'low' | 'medium' | 'high';
  public status!: 'pending' | 'in_progress' | 'completed';
  public category!: string;
  public estimatedTime!: number;
  public actualTime!: number;
  public isRecurring!: boolean;
  public recurringPattern!: string;
  public tags!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending',
    },
    category: {
      type: DataTypes.STRING,
    },
    estimatedTime: {
      type: DataTypes.INTEGER, // in minutes
    },
    actualTime: {
      type: DataTypes.INTEGER, // in minutes
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurringPattern: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.STRING, // Store as comma-separated values
    },
  },
  {
    sequelize,
    modelName: 'Task',
    indexes: [
      {
        fields: ['userId', 'dueDate'],
      },
      {
        fields: ['userId', 'status'],
      },
    ],
  }
);

export default Task;