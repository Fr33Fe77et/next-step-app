import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getTasks, getNextTask } from '../store/taskSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import Button from '../components/common/Button';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const WelcomeSection = styled.section`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #2d4b6e;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #637b96;
`;

const NextTaskSection = styled.section`
  margin-bottom: 2rem;
`;

const NextTaskCard = styled.div`
  background-color: #edf3ff;
  border-left: 5px solid #4a6fa5;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const TaskTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #2d4b6e;
`;

const TaskDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const TaskDetail = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: #e0e7ff;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #4a6fa5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-top: 1rem;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SummarySection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const SummaryCard = styled.div`
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const SummaryValue = styled.h3`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #4a6fa5;
`;

const SummaryLabel = styled.p`
  color: #637b96;
`;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, nextTask, isLoading } = useAppSelector((state) => state.tasks);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    dispatch(getTasks());
    dispatch(getNextTask());
  }, [user, navigate, dispatch]);
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  
  return (
    <DashboardContainer>
      <WelcomeSection>
        <Title>Welcome, {user?.name}</Title>
        <Subtitle>Here's an overview of your tasks and priorities</Subtitle>
      </WelcomeSection>
      
      <NextTaskSection>
        <Title>Your Next Step</Title>
        {isLoading ? (
          <p>Loading your next task...</p>
        ) : nextTask ? (
          <NextTaskCard>
            <TaskTitle>{nextTask.title}</TaskTitle>
            <p>{nextTask.description}</p>
            
            <TaskDetails>
              <TaskDetail>
                Priority: {nextTask.priority}
              </TaskDetail>
              <TaskDetail>
                Due: {nextTask.dueDate ? new Date(nextTask.dueDate).toLocaleDateString() : 'No deadline'}
              </TaskDetail>
              {nextTask.category && (
                <TaskDetail>
                  Category: {nextTask.category}
                </TaskDetail>
              )}
            </TaskDetails>
            
            <TaskActions>
              <Button primary onClick={() => navigate(`/tasks/${nextTask._id || nextTask.id}`)}>
                Start Working
              </Button>
              <Button onClick={() => navigate('/tasks')}>
                View All Tasks
              </Button>
            </TaskActions>
          </NextTaskCard>
        ) : (
          <EmptyState>
            <p>You don't have any tasks yet. Create your first task to get started!</p>
            <Button primary onClick={() => navigate('/tasks/new')} style={{ marginTop: '1rem' }}>
              Create Task
            </Button>
          </EmptyState>
        )}
      </NextTaskSection>
      
      <SummarySection>
        <SummaryCard>
          <SummaryValue>{totalTasks}</SummaryValue>
          <SummaryLabel>Total Tasks</SummaryLabel>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryValue>{completedTasks}</SummaryValue>
          <SummaryLabel>Completed Tasks</SummaryLabel>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryValue>{highPriorityTasks}</SummaryValue>
          <SummaryLabel>High Priority Tasks</SummaryLabel>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryValue>
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </SummaryValue>
          <SummaryLabel>Completion Rate</SummaryLabel>
        </SummaryCard>
      </SummarySection>
    </DashboardContainer>
  );
};

export default DashboardPage;