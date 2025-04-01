import React from 'react';
import styled from 'styled-components';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const InputLabel = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: 0.5rem;
  border: 1px solid ${(props) => (props.hasError ? '#dc3545' : '#d0d8e2')};
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4A6FA5;
  }
  
  &:disabled {
    background-color: #f4f6f8;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  id,
  name,
  required = false,
  disabled = false,
  error,
  label,
}) => {
  return (
    <InputContainer>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <StyledInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        hasError={!!error}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;