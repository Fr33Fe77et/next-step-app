import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  primary?: boolean;
  danger?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const StyledButton = styled.button<{
  $primary?: boolean;
  $danger?: boolean;
  $fullWidth?: boolean;
}>`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  /* Primary or default styles */
  background-color: ${(props) => (props.$primary ? '#4A6FA5' : '#ffffff')};
  color: ${(props) => (props.$primary ? '#ffffff' : '#4A6FA5')};
  border: 1px solid ${(props) => (props.$primary ? '#4A6FA5' : '#d0d8e2')};
  
  /* Danger style */
  ${(props) =>
    props.$danger &&
    `
    background-color: #dc3545;
    color: #ffffff;
    border: 1px solid #dc3545;
  `}
  
  /* Full width */
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};
  
  /* Disabled state */
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  
  &:hover {
    opacity: 0.9;
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  primary = false,
  danger = false,
  fullWidth = false,
  type = 'button',
  disabled = false,
  onClick,
  style,
}) => {
  return (
    <StyledButton
      $primary={primary}
      $danger={danger}
      $fullWidth={fullWidth}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </StyledButton>
  );
};

export default Button;