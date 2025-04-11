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
  
  

  test('updateSettings updates font when "Set Font" button is clicked', async () => {
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
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByTestId('Text');
    fireEvent.click(textCategoryBtn);
  
    // Select the <select> input using its role and accessible name
    const fontSelect = screen.getByRole('combobox', { name: /font/i });
    fireEvent.change(fontSelect, { target: { value: 'Lato' } });
  
    // Click the "Set Font" button
    const setFontBtn = screen.getByRole('button', { name: /set font/i });
    fireEvent.click(setFontBtn);
  
    // Assert setSettings was called with merged values
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      font: 'Lato',
    });
  });
  

  test('scrollEvent stores scroll position in localStorage', async () => {
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
  
    const scrollElement = screen.getByTestId('settingsScroll');
  
    // Set a mock scroll position
    scrollElement.scrollTop = 150;
  
    // Fire the scroll event
    fireEvent.scroll(scrollElement);
  
    // Check that localStorage.setItem was called
    expect(localStorage.getItem('scroll-position-settings')).toBe("150");
  });

  test('clicking the log out button calls logout with setLoggedIn', async() => {
    await act(async () => {
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
    });

    await act(async () => {
      BasicSettingsBar.setSelectedCategory(null);
    });

    await act(async () => {
      const logoutBtn = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(logoutBtn);
    });
  
    expect(mockLogout).toHaveBeenCalledWith(mockSetLoggedIn);
  });
  
  test('clicking "Back to Top" resets scroll and focuses close button', () => {
    localStorage.clear(); // ensure menu view is shown
  
    act(() => {
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
    });
  
    const closeBtn = screen.getByTestId('closeSettingsBtn');
    const scrollContainer = screen.getByTestId('settingsScroll');
    const backToTopLink = screen.getByRole('link', { name: /back to top/i });
  
    // Simulate initial scroll
    scrollContainer.scrollTop = 200;
    document.body.scrollTop = 200;
  
    // Spy on focus
    const focusSpy = jest.spyOn(closeBtn, 'focus');
  
    act(() => {
      fireEvent.click(backToTopLink);
    });
  
    expect(scrollContainer.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
  });
  
  test('clicking "Decrease Text Size" updates font size', () => {
    localStorage.clear(); // ensure main menu renders
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, font_size: '14px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const decreaseBtn = screen.getByTestId('txtSizeDec');
  
    act(() => {
      fireEvent.click(decreaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      font_size: '13px',
    });
  });
  
  test('clicking "Increase Text Size" updates font size', () => {
    localStorage.clear(); // ensure initial state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, font_size: '14px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const increaseBtn = screen.getByTestId('txtSizeInc');
  
    act(() => {
      fireEvent.click(increaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      font_size: '15px',
    });
  });

  test('clicking "Decrease Letter Spacing" updates letter spacing', () => {
    localStorage.clear(); // ensure menu view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, letter_spacing: '4px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const decreaseBtn = screen.getByTestId('letterSpacingDec');
  
    act(() => {
      fireEvent.click(decreaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      letter_spacing: '3px',
    });
  });

  test('clicking "Increase Letter Spacing" updates letter spacing', () => {
    localStorage.clear(); // ensure default state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, letter_spacing: '2px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const increaseBtn = screen.getByTestId('letterSpacingInc');
  
    act(() => {
      fireEvent.click(increaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      letter_spacing: '3px',
    });
  });
  
  test('clicking "Decrease Word Spacing" updates word spacing', () => {
    localStorage.clear(); // ensure clean menu state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, word_spacing: '5px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const decreaseBtn = screen.getByRole('button', { name: /decrease word spacing/i });
  
    act(() => {
      fireEvent.click(decreaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      word_spacing: '4px',
    });
  });

  test('clicking "Increase Word Spacing" updates word spacing', () => {
    localStorage.clear(); // make sure we're starting from main menu view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, word_spacing: '3px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const increaseBtn = screen.getByRole('button', { name: /increase word spacing/i });
  
    act(() => {
      fireEvent.click(increaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      word_spacing: '4px',
    });
  });

  test('clicking "Decrease Line Height" updates line height', () => {
    localStorage.clear(); // reset state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, line_height: 2 }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const decreaseBtn = screen.getByRole('button', { name: /decrease line height/i });
  
    act(() => {
      fireEvent.click(decreaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      line_height: 1.5,
    });
  });
  
  
  test('clicking "Increase Line Height" updates line height', () => {
    localStorage.clear(); // ensure clean view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, line_height: 1.5 }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const increaseBtn = screen.getByRole('button', { name: /increase line height/i });
  
    act(() => {
      fireEvent.click(increaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      line_height: 2.0,
    });
  });

  test('changing text alignment updates temporary selection state', () => {
    localStorage.clear(); // ensure default tab
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, align_text: 'left' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Get the text alignment dropdown
    const alignSelect = screen.getByRole('combobox', { name: /text align/i });
  
    // Change the value
    act(() => {
      fireEvent.change(alignSelect, { target: { value: 'right' } });
    });
  
    expect(alignSelect.value).toBe('right');
  });
  
  test('clicking "Set Text Align" applies selected alignment', () => {
    localStorage.clear(); // ensure clean state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, align_text: 'left' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Change the align_text dropdown
    const alignSelect = screen.getByRole('combobox', { name: /text align/i });
    act(() => {
      fireEvent.change(alignSelect, { target: { value: 'right' } });
    });
  
    // Click the "Set Text Align" button
    const setBtn = screen.getByRole('button', { name: /set text align/i });
    act(() => {
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      align_text: 'right',
    });
  });
  
  test('clicking "Toggle Highlight Links" toggles the highlight_links setting', () => {
    localStorage.clear(); // ensure default view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_links: false }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle highlight links/i });
  
    act(() => {
      fireEvent.click(toggleBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      highlight_links: true,
    });
  });

  test('clicking "Set Highlight Link Color" updates highlight_links_color', () => {
    localStorage.clear(); // ensure fresh view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_links_color: '#FF0000' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const colorInput = screen.getByTestId("highlightLinkColorInput");
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#00FF00' } });
    });
  
    const setBtn = screen.getByRole('button', { name: /set highlight link color/i });
    act(() => {
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      highlight_links_color: '#00ff00',
    });
  });
  
  test('clicking in-category "Back to Top" focuses back button and resets scroll', () => {
    localStorage.clear(); // ensure fresh render
  
    act(() => {
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
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const backBtn = screen.getByTestId('backBtn');
    const backToTopLink = screen.getByRole('link', { name: /back to top/i });
  
    // Simulate scrolling
    document.body.scrollTop = 200;
    const focusSpy = jest.spyOn(backBtn, 'focus');
  
    act(() => {
      fireEvent.click(backToTopLink);
    });
  
    expect(document.body.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('clicking "Decrease Contrast" updates contrast', () => {
    localStorage.clear(); // reset view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, contrast: '100%' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const decreaseBtn = screen.getByTestId('contrastDec');
  
    act(() => {
      fireEvent.click(decreaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      contrast: '95%',
    });
  });

  test('clicking "Increase Contrast" updates contrast', () => {
    localStorage.clear(); // ensure clean view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, contrast: '100%' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const increaseBtn = screen.getByTestId('contrastInc');
  
    act(() => {
      fireEvent.click(increaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      contrast: '105%',
    });
  });
  
  test('clicking "Decrease Saturation" updates saturation', () => {
    localStorage.clear(); // reset state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, saturation: '100%' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const decreaseBtn = screen.getByTestId('saturationDec');
  
    act(() => {
      fireEvent.click(decreaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      saturation: '95%',
    });
  });
  
  test('clicking "Increase Saturation" updates saturation', () => {
    localStorage.clear(); // clean initial state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, saturation: '100%' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const increaseBtn = screen.getByTestId('saturationInc');
  
    act(() => {
      fireEvent.click(increaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      saturation: '105%',
    });
  });

  test('changing background color updates temporary state', () => {
    localStorage.clear(); // reset state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, background_color: '#FFFFFF' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('backgroundColorInput');
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#123456' } });
    });
  
    expect(colorInput.value).toBe('#123456');
  });

  test('clicking in-category profiles "Back to Top" focuses back button and resets scroll', () => {
    localStorage.clear(); // ensure fresh render
  
    act(() => {
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
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Profiles' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const backBtn = screen.getByTestId('backBtn');
    const backToTopLink = screen.getByRole('link', { name: /back to top/i });
  
    // Simulate scrolling
    document.body.scrollTop = 200;
    const focusSpy = jest.spyOn(backBtn, 'focus');
  
    act(() => {
      fireEvent.click(backToTopLink);
    });
  
    expect(document.body.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('clicking in-category interactions "Back to Top" focuses back button and resets scroll', () => {
    localStorage.clear(); // ensure fresh render
  
    act(() => {
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
    });
  
    // Open the "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const backBtn = screen.getByTestId('backBtn');
    const backToTopLink = screen.getByRole('link', { name: /back to top/i });
  
    // Simulate scrolling
    document.body.scrollTop = 200;
    const focusSpy = jest.spyOn(backBtn, 'focus');
  
    act(() => {
      fireEvent.click(backToTopLink);
    });
  
    expect(document.body.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('clicking enter while focused on category should set the category', () => {
    localStorage.clear(); // ensure fresh render
  
    act(() => {
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
    });

  
    const catBtn = screen.getByTestId('Text');

    const focusSpy = jest.spyOn(catBtn, 'focus');
  
    act(() => {
      fireEvent.keyDown(catBtn, { key: ' ' });
    });
  
    expect(screen.getByRole('heading', { level: 3, name: 'Text' })).toBeInTheDocument();
  });
  
  test('clicking "Set Background Color" updates background_color in settings', () => {
    localStorage.clear(); // ensure default state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, background_color: '#FFFFFF' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('backgroundColorInput');
    const setBtn = screen.getByRole('button', { name: /set background color/i });
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#123456' } });
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      background_color: '#123456',
    });
  });
  
  test('changing foreground color updates temporary state', () => {
    localStorage.clear(); // reset to base state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, foreground_color: '#000000' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('foregroundColorInput');
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#ABCDEF' } });
    });
  
    expect(colorInput.value).toBe('#abcdef');
  });

  test('clicking "Set Foreground Color" updates foreground_color in settings', () => {
    localStorage.clear(); // reset state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, foreground_color: '#000000' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('foregroundColorInput');
    const setBtn = screen.getByRole('button', { name: /set foreground color/i });
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#123123' } });
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      foreground_color: '#123123',
    });
  });
  
  test('changing text color updates temporary state', () => {
    localStorage.clear(); // ensure clean state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, text_color: '#111111' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('textColorInput');
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#FF33AA' } });
    });
  
    expect(colorInput.value).toBe('#ff33aa');
  });
  
  test('clicking "Set Text Color" updates text_color in settings', () => {
    localStorage.clear(); // ensure clean state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, text_color: '#111111' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('textColorInput');
    const setBtn = screen.getByRole('button', { name: /set text color/i });
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#00AAFF' } });
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      text_color: '#00aaff',
    });
  });
  
  test('clicking in-category "Back to Top" resets scroll and focuses back button', () => {
    localStorage.clear(); // ensure main menu opens
  
    act(() => {
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
    });
  
    // Open a category like "Visuals"
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const backBtn = screen.getByTestId('backBtn');
    const backToTopLink = screen.getAllByRole('link', { name: /back to top/i })[0]; // category version
  
    // Set scroll and spy on focus
    document.body.scrollTop = 200;
    const focusSpy = jest.spyOn(backBtn, 'focus');
  
    act(() => {
      fireEvent.click(backToTopLink);
    });
  
    expect(document.body.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('clicking "Increase Cursor Size" updates cursor_size in settings', () => {
    localStorage.clear(); // ensure clean start
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, cursor_size: 2 }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Cursor" category
    const cursorCategoryBtn = screen.getByRole('button', { name: 'Cursor' });
    act(() => {
      fireEvent.click(cursorCategoryBtn);
    });
  
    const increaseBtn = screen.getByRole('button', { name: /increase cursor size/i });
  
    act(() => {
      fireEvent.click(increaseBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      cursor_size: 3,
    });
  });

  test('changing cursor color updates temporary state', () => {
    localStorage.clear(); // reset state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, cursor_color: '#000000' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Cursor" category
    act(() => {
      BasicSettingsBar.setSelectedCategory("Cursor");
    });

    let colorInput;
  
    act(() => {
      colorInput = screen.getByTestId("cursorColorInput");
      fireEvent.change(colorInput, { target: { value: '#ABCDEF' } });
    });
  
    expect(colorInput.value).toBe('#abcdef');
  });
  
  test('clicking "Set Cursor Color" updates cursor_color in settings', () => {
    localStorage.clear(); // reset view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, cursor_color: '#000000' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    act(() => {
      BasicSettingsBar.setSelectedCategory("Cursor");
    });
  
    let colorInput;
    let setBtn;
  
    act(() => {
      colorInput = screen.getByTestId("cursorColorInput");
      setBtn = screen.getByTestId("cursorColorInputSetBtn");
      fireEvent.change(colorInput, { target: { value: '#123456' } });
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      cursor_color: '#123456',
    });
  });
  
  test('changing cursor border color updates temporary state', () => {
    localStorage.clear(); // reset view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, cursor_border_color: '#FFFFFF' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Cursor" category
    act(() => {
      BasicSettingsBar.setSelectedCategory("Cursor");
    });
  
    let colorInput;
    let setBtn;
  
    act(() => {
      colorInput = screen.getByTestId("cursorBorderColorInput");
      fireEvent.change(colorInput, { target: { value: '#00FFAA' } });
    });
  
    expect(colorInput.value).toBe('#00ffaa');
  });

  test('submitting font form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Get the form element by finding the font <select> and locating its parent form
    const fontSelect = screen.getByTestId("fontSelect");
    const fontForm = fontSelect.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      fontForm.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });

  test('submitting text size form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, font_size: '14px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Get the decrement button and locate the parent form
    const decBtn = screen.getByTestId('txtSizeDec');
    const sizeForm = decBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      sizeForm.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  
  test('submitting letter spacing form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, letter_spacing: '2px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Get the decrement button and its parent form
    const decBtn = screen.getByTestId('letterSpacingDec');
    const spacingForm = decBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      spacingForm.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting word spacing form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, word_spacing: '5px' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Locate the decrement button and its parent form
    const decBtn = screen.getByRole('button', { name: /decrease word spacing/i });
    const wordSpacingForm = decBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      wordSpacingForm.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting line height form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, line_height: 1.5 }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Locate the Decrease Line Height button and its parent form
    const decBtn = screen.getByRole('button', { name: /decrease line height/i });
    const lineHeightForm = decBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      lineHeightForm.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting text align form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, align_text: 'left' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const select = screen.getByTestId("alignTextSelect");
    const form = select.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting highlight links toggle form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_links: false }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    // Find the toggle button and its parent form
    const toggleBtn = screen.getByRole('button', { name: /toggle highlight links/i });
    const form = toggleBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting highlight link color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Text" category
    const textCategoryBtn = screen.getByRole('button', { name: 'Text' });
    act(() => {
      fireEvent.click(textCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('highlightLinkColorInput');
    const form = colorInput.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });

  test('submitting contrast form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, contrast: '100%' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const decBtn = screen.getByTestId('contrastDec');
    const form = decBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting saturation form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, saturation: '100%' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const decBtn = screen.getByTestId('saturationDec');
    const form = decBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting background color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const input = screen.getByTestId('backgroundColorInput');
    const form = input.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting foreground color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const input = screen.getByTestId('foregroundColorInput');
    const form = input.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting text color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Visuals" category
    const visualsCategoryBtn = screen.getByRole('button', { name: 'Visuals' });
    act(() => {
      fireEvent.click(visualsCategoryBtn);
    });
  
    const input = screen.getByTestId('textColorInput');
    const form = input.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting cursor size form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, cursor_size: 3 }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Cursor" category
    const cursorCategoryBtn = screen.getByRole('button', { name: 'Cursor' });
    act(() => {
      fireEvent.click(cursorCategoryBtn);
    });
  
    const decBtn = screen.getByRole('button', { name: /decrease cursor size/i });
    const form = decBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting cursor color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Cursor" category
    const cursorCategoryBtn = screen.getByRole('button', { name: 'Cursor' });
    act(() => {
      fireEvent.click(cursorCategoryBtn);
    });
  
    const input = screen.getByTestId('cursorColorInput');
    const form = input.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting cursor border color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Cursor" category
    const cursorCategoryBtn = screen.getByRole('button', { name: 'Cursor' });
    act(() => {
      fireEvent.click(cursorCategoryBtn);
    });
  
    const input = screen.getByTestId('cursorBorderColorInput');
    const form = input.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting mute sounds form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, mute_sounds: false }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Audio" category
    const audioCategoryBtn = screen.getByRole('button', { name: 'Audio' });
    act(() => {
      fireEvent.click(audioCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle mute sounds/i });
    const form = toggleBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting highlight hover form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_hover: false }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle highlight hover/i });
    const form = toggleBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting highlight hover color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const input = screen.getByTestId('highlightHoverInput');
    const form = input.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting highlight keyboard focus form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_keyboard_focus: false }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle highlight keyboard focus/i });
    const form = toggleBtn.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  test('submitting highlight keyboard focus color form prevents default behavior', () => {
    localStorage.clear();
  
    const preventDefault = jest.fn();
  
    act(() => {
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
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const input = screen.getByTestId('highlightKeyboardFocusColorInput');
    const form = input.closest('form');
  
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
  
    act(() => {
      form.dispatchEvent(submitEvent);
    });
  
    expect(preventDefault).toHaveBeenCalled();
  });
  
  
  test('changing cursor border color & pressing set btn updates settings', () => {
    localStorage.clear(); // reset view
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, cursor_border_color: '#FFFFFF' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Cursor" category
    act(() => {
      BasicSettingsBar.setSelectedCategory("Cursor");
    });
  
    let colorInput;
    let setBtn;
  
    act(() => {
      colorInput = screen.getByTestId("cursorBorderColorInput");
      setBtn = screen.getByTestId("cursorBorderColorInputSetBtn");
      fireEvent.change(colorInput, { target: { value: '#00FFAA' } });
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      cursor_border_color: '#00ffaa',
    });
  });

  test('clicking in-category "Back to Top" focuses back button and resets scroll', () => {
    localStorage.clear(); // ensure default render
  
    act(() => {
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
    });
  
    // Open "Cursor" category (or any category that has a Back to Top link)
    const cursorCategoryBtn = screen.getByRole('button', { name: 'Cursor' });
    act(() => {
      fireEvent.click(cursorCategoryBtn);
    });
  
    const backBtn = screen.getByTestId('backBtn');
    const backToTopLink = screen.getAllByRole('link', { name: /back to top/i })[0];
  
    // Simulate scrolling and spy on focus
    document.body.scrollTop = 300;
    const focusSpy = jest.spyOn(backBtn, 'focus');
  
    act(() => {
      fireEvent.click(backToTopLink);
    });
  
    expect(document.body.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('clicking "Toggle Mute Sounds" unmutes and plays sound', () => {
    localStorage.clear();
  
    const mockPlay = jest.fn().mockResolvedValue();
    global.Audio = jest.fn(() => ({
      play: mockPlay,
    }));
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, mute_sounds: true }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Audio" category
    const audioCategoryBtn = screen.getByRole('button', { name: 'Audio' });
    act(() => {
      fireEvent.click(audioCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle mute sounds/i });
  
    act(() => {
      fireEvent.click(toggleBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      mute_sounds: false,
    });
  
    expect(mockPlay).toHaveBeenCalled();
  });

  test('clicking "Toggle Mute Sounds" logs error if alert sound fails to play', async () => {
    localStorage.clear();
  
    const mockError = new Error('Audio failed');
    const mockPlay = jest.fn().mockRejectedValue(mockError);
    global.Audio = jest.fn(() => ({
      play: mockPlay,
    }));
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    await act(async () => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, mute_sounds: true }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Audio" category
    const audioCategoryBtn = screen.getByRole('button', { name: 'Audio' });
    act(() => {
      fireEvent.click(audioCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle mute sounds/i });
  
    await act(async () => {
      fireEvent.click(toggleBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      mute_sounds: false,
    });
  
    expect(mockPlay).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to play alert sound:', mockError);
  
    consoleErrorSpy.mockRestore();
  });

  test('clicking "Back to Top" focuses back button and resets scroll', () => {
    localStorage.clear(); // start clean
  
    act(() => {
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
    });
  
    // Open a category like "Audio" that contains a Back to Top link
    const audioCategoryBtn = screen.getByRole('button', { name: 'Audio' });
    act(() => {
      fireEvent.click(audioCategoryBtn);
    });
  
    const backBtn = screen.getByTestId('backBtn');
    const backToTopLink = screen.getAllByRole('link', { name: /back to top/i })[0];
  
    // Simulate scroll and spy on focus
    document.body.scrollTop = 400;
    const focusSpy = jest.spyOn(backBtn, 'focus');
  
    act(() => {
      fireEvent.click(backToTopLink);
    });
  
    expect(document.body.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
  });
  
  test('clicking Dyslexia profile button triggers updateSettings call', () => {
    localStorage.clear();
  
    act(() => {
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
    });
  
    // Open "Profiles" category
    const profilesCategoryBtn = screen.getByRole('button', { name: 'Profiles' });
    act(() => {
      fireEvent.click(profilesCategoryBtn);
    });
  
    const dyslexiaBtn = screen.getByTestId('dyslexiaBtn');
  
    act(() => {
      fireEvent.click(dyslexiaBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledTimes(1);
    expect(mockSetSettings).toHaveBeenCalledWith(expect.any(Object)); // just confirms updateSettings() was triggered
  });
  
  test('clicking Visual Impairment profile button triggers updateSettings call', () => {
    localStorage.clear();
  
    act(() => {
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
    });
  
    // Open "Profiles" category
    const profilesCategoryBtn = screen.getByRole('button', { name: 'Profiles' });
    act(() => {
      fireEvent.click(profilesCategoryBtn);
    });
  
    const visImpBtn = screen.getByTestId('visImpBtn');
  
    act(() => {
      fireEvent.click(visImpBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledTimes(1);
    expect(mockSetSettings).toHaveBeenCalledWith(expect.any(Object)); // covers updateSettings call
  });
  
  test('clicking Default profile button triggers updateSettings call', () => {
    localStorage.clear();
  
    act(() => {
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
    });
  
    // Open "Profiles" category
    const profilesCategoryBtn = screen.getByRole('button', { name: 'Profiles' });
    act(() => {
      fireEvent.click(profilesCategoryBtn);
    });
  
    const defaultBtn = screen.getByTestId('defaultBtn');
  
    act(() => {
      fireEvent.click(defaultBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledTimes(1);
    expect(mockSetSettings).toHaveBeenCalledWith(expect.any(Object));
  });
  
  test('clicking "Toggle Highlight Hover" toggles highlight_hover setting', () => {
    localStorage.clear();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_hover: false }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle highlight hover/i });
  
    act(() => {
      fireEvent.click(toggleBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      highlight_hover: true,
    });
  });
  
  test('changing highlight hover color updates temporary state', () => {
    localStorage.clear();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_hover_color: '#FF0000' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('highlightHoverInput');
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#00FF00' } });
    });
  
    expect(colorInput.value).toBe('#00ff00');
  });
  
  test('clicking "Set Highlight Hover Color" updates highlight_hover_color in settings', () => {
    localStorage.clear();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_hover_color: '#FF0000' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('highlightHoverInput');
    const setBtn = screen.getByRole('button', { name: /set highlight hover color/i });
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#00AAFF' } });
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      highlight_hover_color: '#00aaff',
    });
  });


  test('clicking "Toggle Highlight Keyboard Focus" toggles highlight_keyboard_focus setting', () => {
    localStorage.clear();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_keyboard_focus: false }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const toggleBtn = screen.getByRole('button', { name: /toggle highlight keyboard focus/i });
  
    act(() => {
      fireEvent.click(toggleBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      highlight_keyboard_focus: true,
    });
  });
  
  test('clicking "Set Highlight Keyboard Focus Color" updates setting', () => {
    localStorage.clear();
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, highlight_keyboard_focus_color: '#BD180F' }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open "Interactions" category
    const interactionsCategoryBtn = screen.getByRole('button', { name: 'Interactions' });
    act(() => {
      fireEvent.click(interactionsCategoryBtn);
    });
  
    const colorInput = screen.getByTestId('highlightKeyboardFocusColorInput');
    const setBtn = screen.getByRole('button', { name: /set highlight keyboard focus color/i });
  
    act(() => {
      fireEvent.change(colorInput, { target: { value: '#4444FF' } });
      fireEvent.click(setBtn);
    });
  
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      highlight_keyboard_focus_color: '#4444ff',
    });
  });
  

  test('clicking "Decrease Cursor Size" clamps cursor_size ≤ 0 to 1 before subtracting', () => {
    localStorage.clear(); // reset state
  
    act(() => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={mockOnClose}
          settings={{ ...mockSettings, cursor_size: 0 }}
          setSettings={mockSetSettings}
          logout={mockLogout}
          setLoggedIn={mockSetLoggedIn}
        />
      );
    });
  
    // Open the "Cursor" category
    const cursorCategoryBtn = screen.getByRole('button', { name: 'Cursor' });
    act(() => {
      fireEvent.click(cursorCategoryBtn);
    });
  
    const decreaseBtn = screen.getByRole('button', { name: /decrease cursor size/i });
  
    act(() => {
      fireEvent.click(decreaseBtn);
    });
  
    // If cursor_size was 0, it gets clamped to 1, then decremented to 0
    expect(mockSetSettings).toHaveBeenCalledWith({
      ...mockSettings,
      cursor_size: 0,
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
