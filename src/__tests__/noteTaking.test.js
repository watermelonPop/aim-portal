import React from 'react';
import { render, screen } from '@testing-library/react';
import NoteTaking from '../noteTaking';

// Mock the role-specific note-taking components
jest.mock('../student/studentNoteTaking', () => () => <div data-testid="student-note-taking" />);
jest.mock('../professor/professorNoteTaking', () => () => <div data-testid="professor-note-taking" />);
jest.mock('../staff/staffNoteTaking', () => () => <div data-testid="staff-note-taking" />);

describe('NoteTaking Component', () => {
  const baseProps = {
    displayHeaderRef: React.createRef(),
    settingsTabOpen: true,
    lastIntendedFocusRef: React.createRef()
  };

  test('renders StudentNoteTaking for STUDENT role', () => {
    render(<NoteTaking {...baseProps} userInfo={{ role: 'STUDENT' }} />);
    expect(screen.getByTestId('student-note-taking')).toBeInTheDocument();
  });

  test('renders ProfessorNoteTaking for PROFESSOR role', () => {
    render(<NoteTaking {...baseProps} userInfo={{ role: 'PROFESSOR' }} />);
    expect(screen.getByTestId('professor-note-taking')).toBeInTheDocument();
  });

  test('renders StaffNoteTaking for ADVISOR role', () => {
    render(<NoteTaking {...baseProps} userInfo={{ role: 'ADVISOR' }} />);
    expect(screen.getByTestId('staff-note-taking')).toBeInTheDocument();
  });

  test('renders nothing for unrecognized role', () => {
    const { container } = render(<NoteTaking {...baseProps} userInfo={{ role: 'GUEST' }} />);
    const main = container.querySelector('main');
    expect(main).toBeEmptyDOMElement();
  });
});
