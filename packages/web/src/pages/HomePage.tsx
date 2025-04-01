import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/common/Button';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d4b6e;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 800px;
  color: #637b96;
`;

const CTAButton = styled(Button)`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
`;

const FeaturesSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
`;

const FeatureCard = styled.div`
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureTitle = styled.h3`
  color: #4a6fa5;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #637b96;
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <Title>Welcome to Next Step</Title>
        <Subtitle>
          The intelligent productivity assistant that helps professionals prioritize tasks,
          manage projects, and focus on what's most important.
        </Subtitle>
        <Link to="/register">
          <CTAButton primary>Get Started</CTAButton>
        </Link>
        <Link to="/login" style={{ marginTop: '1rem' }}>
          <CTAButton>Login</CTAButton>
        </Link>
      </HeroSection>
      
      <FeaturesSection>
        <FeatureCard>
          <FeatureTitle>Smart Task Prioritization</FeatureTitle>
          <FeatureDescription>
            Get personalized recommendations on which task to tackle next based on deadlines,
            importance, and your work patterns.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Long-term Project Management</FeatureTitle>
          <FeatureDescription>
            Never lose track of important long-term projects amidst daily tasks and
            urgent matters.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Integrations</FeatureTitle>
          <FeatureDescription>
            Connect with your calendar, email, and task management tools for a
            seamless productivity experience.
          </FeatureDescription>
        </FeatureCard>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default HomePage;