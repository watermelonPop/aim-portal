// CustomFileInput.test.js
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CustomFileInput from '../student/CustomFileInput.js';

test('renders CustomFileInput with default text', () => {
  render(<CustomFileInput onFileChange={jest.fn()} />);
  expect(screen.getByText(/No file chosen/i)).toBeInTheDocument();
});

test('updates displayed file name and calls onFileChange when a file is selected', async () => {
  const handleFileChange = jest.fn();
  render(<CustomFileInput onFileChange={handleFileChange} />);
  
  const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
  // Grab the hidden file input by its aria-label
  const fileInput = screen.getByLabelText(/Upload PDF file/i);

  // Use act to wrap the event that triggers a state update.
  await act(async () => {
    fireEvent.change(fileInput, { target: { files: [file] } });
  });
  
  expect(handleFileChange).toHaveBeenCalledWith(file);
  expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
});

test('clicking the Browse button triggers the file input click', async () => {
  render(<CustomFileInput onFileChange={jest.fn()} />);
  const fileInput = screen.getByLabelText(/Upload PDF file/i);
  
  // Spy on the click method of the file input.
  const clickSpy = jest.spyOn(fileInput, 'click');
  
  const browseButton = screen.getByRole('button', { name: /Browse/i });
  await act(async () => {
    fireEvent.click(browseButton);
  });
  
  expect(clickSpy).toHaveBeenCalled();
});
