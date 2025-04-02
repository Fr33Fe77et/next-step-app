import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export interface ICalendarSetting {
  id?: string;
  userId: string;
  calendarId: string;
  calendarType: string;
  visible: boolean;
  considerInConflicts: boolean;
  summary?: string;
  description?: string;
  backgroundColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class CalendarSetting extends Model<ICalendarSetting> implements ICalendarSetting {
  public id!: string;
  public userId!: string;
  public calendarId!: string;
  public calendarType!: string;
  public visible!: boolean;
  public considerInConflicts!: boolean;
  public summary!: string;
  public description!: string;
  public backgroundColor!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CalendarSetting.init(
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
    calendarId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calendarType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'other_personal',
    },
    visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    considerInConflicts: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    summary: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    backgroundColor: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'CalendarSetting',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'calendarId'],
      },
    ],
  }
);

export default CalendarSetting;