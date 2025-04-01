import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getTasks, deleteTask } from '../store/taskSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import Button from '../components/common/Button';

const TasksContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const TasksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d4b6e;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TaskTitle = styled.h3`
  font-size: 1.2rem;
  color: #2d4b6e;
  margin: 0;
`;

const TaskPriority = styled.span<{ priority: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ priority }) => 
    priority === 'high' ? '#fecaca' : 
    priority === 'medium' ? '#fef3c7' : 
    '#e0f2fe'};
  color: ${({ priority }) => 
    priority === 'high' ? '#991b1b' : 
    priority === 'medium' ? '#92400e' : 
    '#0c4a6e'};
`;

const TaskDescription = styled.p`
  color: #4b5563;
  margin: 0.5rem 0;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f9fafb;
  border-radius: 8px;
`;

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    dispatch(getTasks());
  }, [user, dispatch, navigate]);

  const handleEdit = (id: string) => {
    navigate(`/tasks/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await dispatch(deleteTask(id));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <TasksContainer>
        <p>Loading tasks...</p>
      </TasksContainer>
    );
  }

  return (
    <TasksContainer>
      <TasksHeader>
        <Title>Your Tasks</Title>
        <Button primary onClick={() => navigate('/tasks/new')}>
          Create New Task
        </Button>
      </TasksHeader>

      {tasks.length === 0 ? (
        <EmptyState>
          <h3>No tasks found</h3>
          <p>Get started by creating your first task</p>
          <Button primary onClick={() => navigate('/tasks/new')} style={{ marginTop: '1rem' }}>
            Create Task
          </Button>
        </EmptyState>
      ) : (
        <TaskList>
          {tasks.map((task) => (
            <TaskCard key={task.id || task._id}>
              <TaskHeader>
                <TaskTitle>{task.title}</TaskTitle>
                <TaskPriority priority={task.priority}>{task.priority}</TaskPriority>
              </TaskHeader>
              
              {task.description && (
                <TaskDescription>{task.description}</TaskDescription>
              )}
              
              <TaskMeta>
                <div>Status: {task.status}</div>
                {task.dueDate && (
                  <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                )}
                {task.category && (
                  <div>Category: {task.category}</div>
                )}
              </TaskMeta>
              
              <TaskActions>
                <Button onClick={() => handleEdit(task.id || task._id!)}>Edit</Button>
                <Button danger onClick={() => handleDelete(task.id || task._id!)} disabled={isDeleting}>
                  Delete
                </Button>
              </TaskActions>
            </TaskCard>
          ))}
        </TaskList>
      )}
    </TasksContainer>
  );
};

export default TasksPage;