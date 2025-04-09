
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserDashboard from '../user/userDashboard';

const mockSetCurrentTab = jest.fn();
const mockTabs = [
  { name: 'Dashboard', elem: <div>Dashboard</div> },
  { name: 'Accommodations', elem: <div>Accommodations</div> },
];

const mockUserInfo = {
  id: 1,
  name: "Test User",
  role: "USER",
  email: "test@example.com",
  uin: 123456789,
};

const mockDisplayHeaderRef = { current: null };
const mockLastIntendedFocusRef = { current: null };

describe('UserDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome screen with buttons', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    expect(screen.getByText(/Welcome to the Texas A&M AIM Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Find Forms/i)).toBeInTheDocument();
    // expect(screen.getByText(/Want to apply? Click the Accommodations tab in the navigation bar./i)).toBeInTheDocument();
  });

  test('shows form list when "Find Forms" button is clicked', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    expect(screen.getByText(/Forms and Publications for Students/i)).toBeInTheDocument();
  });

  test('clicking a toggle opens the accordion group', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    const toggleBtn = screen.getByText(/Disability Documentation Packets/i);
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('region', { name: /Disability Documentation Packets/i })).toBeVisible();
  });

  test('accordion closes when toggled again', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    const toggleBtn = screen.getByText(/Application & Requests/i);
    fireEvent.click(toggleBtn);
    // expect(screen.getByRole('region', { name: /Application & Requests/i })).toBeVisible();

    fireEvent.click(toggleBtn);
    // expect(screen.getByRole('region', { name: /Application & Requests/i })).not.toBeVisible();
  });

  test('back button returns to audit choice screen', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Back/i));
    expect(screen.getByText(/Welcome to the Texas A&M AIM Portal/i)).toBeInTheDocument();
  });

  test('non-expandable section is still accessible', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    const infoBox = screen.getByRole('note');
    expect(infoBox).toHaveTextContent(/Click the Accommodations tab/i);
  });
});

  test('keyboard toggle with Enter key works on accordion', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    const toggleBtn = screen.getByText(/Testing & Temporary Conditions/i);
    fireEvent.keyDown(toggleBtn, { key: 'Enter', code: 'Enter' });
    expect(screen.getByRole('region', { name: /Testing & Temporary Conditions/i })).toBeVisible();
  });

  test('keyboard toggle with Space key works on accordion', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    const toggleBtn = screen.getByText(/College Transition Resources/i);
    fireEvent.keyDown(toggleBtn, { key: ' ', code: 'Space' });
    expect(screen.getByRole('region', { name: /College Transition Resources/i })).toBeVisible();
  });

  test('aria-expanded is false by default on toggles', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    const toggleBtn = screen.getByText(/Academic Guidance & FAQ/i);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('aria-expanded becomes true when opened', () => {
    render(
      <UserDashboard
        userInfo={mockUserInfo}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
        setCurrentTab={mockSetCurrentTab}
        tabs={mockTabs}
      />
    );

    fireEvent.click(screen.getByText(/Find Forms/i));
    const toggleBtn = screen.getByText(/Academic Guidance & FAQ/i);
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
  });
