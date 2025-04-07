import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App.js';
import BasicSettingsBar from '../basicSettingsBar.js';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const mockSetLoggedIn = jest.fn();
const mockSetSettings = jest.fn();
const mockLogout = jest.fn();
const mockOnClose = jest.fn();

const mockSettings = {
  cursor_color: '#000000',
  cursor_border_color: '#FFFFFF',
  background_color: '#FFFFFF',
  foreground_color: '#000000',
  text_color: '#111111',
  highlight_hover_color: '#FF0000',
  align_text: 'left',
  font_size: '14px',
  letter_spacing: '2px',
  contrast: '100%',
  saturation: '100%',
  cursor_size: 2,
  mute_sounds: false,
  highlight_hover: false,
  font: 'Roboto',
};

describe('settingsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/accountConnected')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ exists: true }) });
      }
      if (url.includes('/api/checkAccount')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ exists: true, user_info: { id: 123 } }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  test('by default, settings panel should NOT be open', async () => {
    render(
      <BasicSettingsBar
        isOpen={false}
        onClose={mockOnClose}
        settings={mockSettings}
        setSettings={mockSetSettings}
        logout={mockLogout}
        setLoggedIn={mockSetLoggedIn}
      />
    );
  
    const panel = screen.getByTestId('settings');
    expect(panel).toHaveAttribute('aria-hidden', 'true');
  });

  test('opens the settings panel when isOpen is true', async () => {
    render(
      <BasicSettingsBar
        isOpen={true}
        onClose={mockOnClose}
        settings={mockSettings}
        setSettings={mockSetSettings}
        logout={mockLogout}
        setLoggedIn={mockSetLoggedIn}
      />
    );
  
    const panel = screen.getByTestId('settings');
    expect(panel).toHaveAttribute('aria-hidden', 'false');
  });

  test('settings panel should have no accessibility violations', async () => {
    const { container } = render(
      <BasicSettingsBar
        isOpen={true}
        onClose={mockOnClose}
        settings={mockSettings}
        setSettings={mockSetSettings}
        logout={mockLogout}
        setLoggedIn={mockSetLoggedIn}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('clicking close button triggers onClose', async () => {
    render(
      <BasicSettingsBar
        isOpen={true}
        onClose={mockOnClose}
        settings={mockSettings}
        setSettings={mockSetSettings}
        logout={mockLogout}
        setLoggedIn={mockSetLoggedIn}
      />
    );

    const closeBtn = screen.getByTestId('closeSettingsBtn');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
