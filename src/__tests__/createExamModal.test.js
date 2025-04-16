import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateExamModal from '../professor/createExamModal';

const course = { id: 1, name: 'Test Course' };
const students = [
  { userId: 101, account: { name: 'Student One' } },
  { userId: 102, account: { name: 'Student Two' } },
];

describe('CreateExamModal Component', () => {
  let onClose;
  let addExamToStudent;
  let returnFocusRef;

  beforeEach(() => {
    onClose = jest.fn();
    addExamToStudent = jest.fn();
    returnFocusRef = { current: { focus: jest.fn() } };
  });

  afterEach(cleanup);

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={false}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders modal and displays form when isOpen is true', () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(`Create New Exam for ${course.name}`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Exam Name:/i)).toBeInTheDocument();
  });

  test('calls onClose when backdrop is clicked', () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    // The backdrop has role="presentation"
    fireEvent.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalled();
  });

  test('does not call onClose when clicking inside modal content', () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    // Clicking on the dialog (modal content) should not trigger onClose.
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('sets focus on heading (examName input) when modal opens', async () => {
    jest.useFakeTimers();
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    // The component uses setTimeout(..., 0), so advance timers.
    act(() => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/Exam Name:/i)).toHaveFocus();
    });
    jest.useRealTimers();
  });

  test('calls onClose when Escape key is pressed within the modal', () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('returns focus to returnFocusRef when modal is closed', () => {
    const { rerender } = render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    // Simulate closing the modal
    rerender(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={false}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    expect(returnFocusRef.current.focus).toHaveBeenCalled();
  });

  test('toggles the accommodation dropdown', () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    const accButton = screen.getByRole('button', { name: /Select Accommodations/i });
    // Initially, the dropdown should not be visible.
    expect(screen.queryByRole('listbox')).toBeNull();
    // Open the dropdown.
    fireEvent.click(accButton);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // Close the dropdown.
    fireEvent.click(accButton);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('toggles the student dropdown', () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    const stuButton = screen.getByRole('button', { name: /Select Students/i });
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.click(stuButton);
    // The select element should become visible as a listbox.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(stuButton);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('handles accommodation selection change using userEvent', async () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Select Accommodations/i }));
    const accSelect = screen.getByRole('listbox');
    // Use userEvent.selectOptions to select "Extended Time"
    await userEvent.selectOptions(accSelect, ['Extended Time']);
    expect(
      screen.getByRole('button', { name: /Selected 1 accommodation/i })
    ).toBeInTheDocument();
  });

  test('handles student selection change using userEvent', async () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Select Students/i }));
    const stuSelect = screen.getByRole('listbox');
    // Use userEvent.selectOptions to select the student with value "101"
    await userEvent.selectOptions(stuSelect, ['101']);
    expect(
      screen.getByRole('button', { name: /Selected 1 student/i })
    ).toBeInTheDocument();
  });

  test('handles file input change', () => {
    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );
    const fileInput = screen.getByLabelText(/Upload Exam File:/i);
    const file = new File(['dummy content'], 'exam.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files[0]).toEqual(file);
  });

  test('submits the form successfully and calls addExamToStudent and onClose', async () => {
    const newExam = { id: 999, name: 'New Exam' };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [newExam],
    });

    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );

    // Fill out the form fields.
    fireEvent.change(screen.getByLabelText(/Exam Name:/i), {
      target: { value: 'Midterm Exam' },
    });
    fireEvent.change(screen.getByLabelText(/Exam Date:/i), {
      target: { value: '2023-12-31' },
    });
    fireEvent.change(screen.getByLabelText(/Location:/i), {
      target: { value: 'Room 101' },
    });
    const file = new File(['dummy content'], 'exam.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/Upload Exam File:/i), {
      target: { files: [file] },
    });

    // Open and select an accommodation.
    // Open the accommodations dropdown and select an option
    fireEvent.click(screen.getByRole('button', { name: /Select Accommodations/i }));
    const accSelect = screen.getByLabelText(/Select Accommodations:/i);
    await userEvent.selectOptions(accSelect, ['Extended Time']);

    // Open the student dropdown and select a student
    fireEvent.click(screen.getByRole('button', { name: /Select Students/i }));
    const stuSelect = screen.getByLabelText(/Select Students:/i);
    await userEvent.selectOptions(stuSelect, ['101']);

    // Submit the form. We try to locate the form either by role or by finding the button's closest form.
    const form = screen.getByText(/Create Exam/i).closest('form');
    fireEvent.submit(form);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(addExamToStudent).toHaveBeenCalledWith(course.id, newExam);
    expect(onClose).toHaveBeenCalled();
  });

  test('handles form submission error and logs error', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CreateExamModal
        course={course}
        students={students}
        isOpen={true}
        onClose={onClose}
        returnFocusRef={returnFocusRef}
        addExamToStudent={addExamToStudent}
      />
    );

    fireEvent.change(screen.getByLabelText(/Exam Name:/i), {
      target: { value: 'Midterm Exam' },
    });
    fireEvent.change(screen.getByLabelText(/Exam Date:/i), {
      target: { value: '2023-12-31' },
    });
    fireEvent.change(screen.getByLabelText(/Location:/i), {
      target: { value: 'Room 101' },
    });
    const file = new File(['dummy content'], 'exam.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/Upload Exam File:/i), {
      target: { files: [file] },
    });

    const form = screen.getByText(/Create Exam/i).closest('form');
    fireEvent.submit(form);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
