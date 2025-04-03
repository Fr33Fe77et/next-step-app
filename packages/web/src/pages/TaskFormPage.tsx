import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createTask, updateTask, getTasks } from '../store/taskSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import Button from '../components/common/Button';
import { useLocation } from 'react-router-dom';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d4b6e;
  margin-bottom: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div<{ flex?: number }>`
  display: flex;
  flex-direction: column;
  flex: ${props => props.flex || 1};
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
`;

const StyledInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
`;

const StyledTextarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const StyledSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const TaskFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);
  
  const emailData = location.state as {
    fromEmail?: boolean;
    emailSubject?: string;
    emailBody?: string;
    emailId?: string;
  } | null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    category: '',
    estimatedTime: '',
    isRecurring: false,
    recurringType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    recurringDay: '',
    recurringWeekday: '1',
    recurringMonthDay: '1',
    recurringCustom: '',
    tags: '',
  });
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // If editing, load tasks if not already loaded
    if (isEditing && tasks.length === 0) {
      dispatch(getTasks());
    }
    
    // Populate form if editing an existing task
    if (isEditing && tasks.length > 0) {
      const task = tasks.find(t => (t.id === id || t._id === id));
      
      if (task) {
        // Parse recurringPattern if it exists
        let recurringType: 'daily' | 'weekly' | 'monthly' | 'custom' = 'daily';
        let recurringDay = '';
        let recurringWeekday = '1';
        let recurringMonthDay = '1';
        let recurringCustom = '';
        
        if (task.recurringPattern) {
          if (task.recurringPattern.startsWith('weekly:')) {
            recurringType = 'weekly';
            recurringWeekday = task.recurringPattern.split(':')[1] || '1';
          } else if (task.recurringPattern.startsWith('monthly:')) {
            recurringType = 'monthly';
            recurringMonthDay = task.recurringPattern.split(':')[1] || '1';
          } else if (task.recurringPattern === 'daily') {
            recurringType = 'daily';
          } else {
            recurringType = 'custom';
            recurringCustom = task.recurringPattern;
          }
        }

        // Parse due date and time
        let dueDate = '';
        let dueTime = '';
        
        if (task.dueDate) {
          const date = new Date(task.dueDate);
          dueDate = date.toISOString().split('T')[0];
          dueTime = date.toTimeString().slice(0, 5); // Get HH:MM format
        }
        
        setFormData({
          title: task.title,
          description: task.description || '',
          dueDate,
          dueTime,
          priority: task.priority,
          status: task.status,
          category: task.category || '',
          estimatedTime: task.estimatedTime ? String(task.estimatedTime) : '',
          isRecurring: task.isRecurring,
          recurringType,
          recurringDay,
          recurringWeekday,
          recurringMonthDay,
          recurringCustom,
          tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''),
        });
      } else {
        navigate('/tasks');
      }
    }
    // If navigated from email, pre-populate form with email data
    if (emailData?.fromEmail) {
      setFormData((prev) => ({
        ...prev,
        title: emailData.emailSubject || prev.title,
        description: `Email content:\n\n${emailData.emailBody || ''}`,
        // You can add additional default values for email-based tasks
        priority: 'medium',
        status: 'pending',
      }));
    }
  }, [user, navigate, isEditing, id, tasks, dispatch, emailData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'priority') {
      setFormData(prev => ({
        ...prev,
        priority: value as 'low' | 'medium' | 'high',
      }));
    } else if (name === 'status') {
      setFormData(prev => ({
        ...prev,
        status: value as 'pending' | 'in_progress' | 'completed',
      }));
    } else if (name === 'recurringType') {
      setFormData(prev => ({
        ...prev,
        recurringType: value as 'daily' | 'weekly' | 'monthly' | 'custom',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : value,
      }));
    }
  };
  
  const combineDateTime = () => {
    if (!formData.dueDate) {
      return undefined;
    }
    
    const dateStr = formData.dueDate;
    const timeStr = formData.dueTime || '00:00'; // Default to midnight if no time specified
    
    return `${dateStr}T${timeStr}:00`;
  };
  
  const getRecurringPattern = () => {
    if (!formData.isRecurring) {
      return undefined;
    }
    
    switch (formData.recurringType) {
      case 'daily':
        return 'daily';
      case 'weekly':
        return `weekly:${formData.recurringWeekday}`;
      case 'monthly':
        return `monthly:${formData.recurringMonthDay}`;
      case 'custom':
        return formData.recurringCustom;
      default:
        return undefined;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Process form data for API
    const taskData = {
      title: formData.title,
      description: formData.description,
      dueDate: combineDateTime(),
      priority: formData.priority,
      status: formData.status,
      category: formData.category,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      isRecurring: formData.isRecurring,
      recurringPattern: getRecurringPattern(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    
    if (isEditing) {
      await dispatch(updateTask({ id, taskData }));
    } else {
      await dispatch(createTask(taskData));
    }
    
    navigate('/tasks');
  };
  
  // Array of weekdays for the dropdown
  const weekdays = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];
  
  // Array of month days for the dropdown
  const monthDays = Array.from({ length: 31 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}${getDaySuffix(i + 1)}`,
  }));
  
  // Helper function to get the suffix for a day (1st, 2nd, 3rd, etc.)
  function getDaySuffix(day: number) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  
  return (
    <FormContainer>
      <FormHeader>
        <Title>{isEditing ? 'Edit Task' : 'Create New Task'}</Title>
      </FormHeader>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Task Title*</Label>
          <StyledInput
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <StyledTextarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="dueDate">Due Date</Label>
            <StyledInput
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="dueTime">Due Time</Label>
            <StyledInput
              type="time"
              id="dueTime"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="priority">Priority</Label>
            <StyledSelect
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </StyledSelect>
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <StyledSelect
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </StyledSelect>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="category">Category</Label>
            <StyledInput
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Work, Personal, Health"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <StyledInput
              type="number"
              id="estimatedTime"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <StyledInput
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., important, project, meeting"
          />
        </FormGroup>
        
        <FormGroup>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              style={{ marginRight: '0.5rem' }}
            />
            <Label htmlFor="isRecurring" style={{ margin: 0 }}>This is a recurring task</Label>
          </div>
        </FormGroup>
        
        {formData.isRecurring && (
          <>
            <FormGroup>
              <Label>Recurring Pattern</Label>
              <RadioGroup>
                <RadioOption>
                  <input
                    type="radio"
                    id="recurring-daily"
                    name="recurringType"
                    value="daily"
                    checked={formData.recurringType === 'daily'}
                    onChange={handleChange}
                  />
                  <span>Daily</span>
                </RadioOption>
                
                <RadioOption>
                  <input
                    type="radio"
                    id="recurring-weekly"
                    name="recurringType"
                    value="weekly"
                    checked={formData.recurringType === 'weekly'}
                    onChange={handleChange}
                  />
                  <span>Weekly</span>
                </RadioOption>
                
                <RadioOption>
                  <input
                    type="radio"
                    id="recurring-monthly"
                    name="recurringType"
                    value="monthly"
                    checked={formData.recurringType === 'monthly'}
                    onChange={handleChange}
                  />
                  <span>Monthly</span>
                </RadioOption>
                
                <RadioOption>
                  <input
                    type="radio"
                    id="recurring-custom"
                    name="recurringType"
                    value="custom"
                    checked={formData.recurringType === 'custom'}
                    onChange={handleChange}
                  />
                  <span>Custom</span>
                </RadioOption>
              </RadioGroup>
            </FormGroup>
            
            {formData.recurringType === 'weekly' && (
              <FormGroup>
                <Label htmlFor="recurringWeekday">Repeat on</Label>
                <StyledSelect
                  id="recurringWeekday"
                  name="recurringWeekday"
                  value={formData.recurringWeekday}
                  onChange={handleChange}
                >
                  {weekdays.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </StyledSelect>
              </FormGroup>
            )}
            
            {formData.recurringType === 'monthly' && (
              <FormGroup>
                <Label htmlFor="recurringMonthDay">Repeat on day</Label>
                <StyledSelect
                  id="recurringMonthDay"
                  name="recurringMonthDay"
                  value={formData.recurringMonthDay}
                  onChange={handleChange}
                >
                  {monthDays.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </StyledSelect>
              </FormGroup>
            )}
            
            {formData.recurringType === 'custom' && (
              <FormGroup>
                <Label htmlFor="recurringCustom">Custom Pattern</Label>
                <StyledInput
                  type="text"
                  id="recurringCustom"
                  name="recurringCustom"
                  value={formData.recurringCustom}
                  onChange={handleChange}
                  placeholder="e.g., every 2 weeks, first Monday of month"
                />
              </FormGroup>
            )}
          </>
        )}
        
        <ButtonContainer>
          <Button type="button" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
          <Button type="submit" primary disabled={isLoading}>
            {isLoading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
          </Button>
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

export default TaskFormPage;