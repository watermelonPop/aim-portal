import React from 'react';
import { render, screen } from '@testing-library/react';
import Testing from '../testing';

// Mock the child components
jest.mock('../student/studentTesting', () => () => <div data-testid="student-testing" />);
jest.mock('../professor/professorTesting', () => () => <div data-testid="professor-testing" />);
jest.mock('../staff/staffTesting', () => () => <div data-testid="staff-testing" />);

describe('Testing Component', () => {
  const baseProps = {
    displayHeaderRef: React.createRef(),
    settingsTabOpen: true,
    lastIntendedFocusRef: React.createRef()
  };

  test('renders StudentTesting for STUDENT role', () => {
    render(<Testing {...baseProps} userInfo={{ role: 'STUDENT' }} />);
    expect(screen.getByTestId('student-testing')).toBeInTheDocument();
  });

  test('renders ProfessorTesting for PROFESSOR role', () => {
    render(<Testing {...baseProps} userInfo={{ role: 'PROFESSOR' }} />);
    expect(screen.getByTestId('professor-testing')).toBeInTheDocument();
  });

  test('renders StaffTesting for ADVISOR role', () => {
    render(<Testing {...baseProps} userInfo={{ role: 'ADVISOR' }} />);
    expect(screen.getByTestId('staff-testing')).toBeInTheDocument();
  });

  test('renders nothing for unrecognized role', () => {
    const { container } = render(<Testing {...baseProps} userInfo={{ role: 'GUEST' }} />);
    const main = container.querySelector('main');
    expect(main).toBeEmptyDOMElement();
  });
});
