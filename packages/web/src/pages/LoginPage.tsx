import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { login, reset } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const LoginContainer = styled.div`
  max-width: 500px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #2d4b6e;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #842029;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
`;

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/dashboard');
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  return (
    <LoginContainer>
      <Title>Login to Next Step</Title>
      
      {isError && <ErrorMessage>{message}</ErrorMessage>}
      
      <Form onSubmit={onSubmit}>
        <Input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Enter your email"
          label="Email"
          required
        />
        
        <Input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Enter your password"
          label="Password"
          required
        />
        
        <Button 
          type="submit" 
          primary 
          fullWidth 
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Login'}
        </Button>
      </Form>
    </LoginContainer>
  );
};

export default LoginPage;