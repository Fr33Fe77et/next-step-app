import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import Button from '../common/Button';

const HeaderContainer = styled.header`
  background-color: #4A6FA5;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavContainer = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-right: 1.5rem; // Change margin-left to margin-right
  
  &:hover {
    text-decoration: underline;
  }
`;

const LogoutButton = styled(Button)`
  margin-left: 1.5rem; // Add some margin to the left of the button
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <Logo to="/">Next Step</Logo>
      <NavContainer>
        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/calendar">Calendar</NavLink>
            <NavLink to="/email">Email</NavLink>
            <LogoutButton onClick={onLogout}>Logout</LogoutButton>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header;