import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';

function renderWithRouter(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<div>Pitch Monitor</div>} />
          <Route path="calibrate" element={<div>Calibration</div>} />
          <Route path="profile" element={<div>Profile</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AppLayout', () => {
  it('renders the outlet content', () => {
    renderWithRouter('/');
    expect(screen.getAllByText('Pitch Monitor').length).toBeGreaterThanOrEqual(1);
  });

  it('renders navigation items', () => {
    renderWithRouter('/');
    expect(screen.getByText('Calibration')).toBeInTheDocument();
  });

  it('renders theme toggle', () => {
    renderWithRouter('/');
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('renders header with app name', () => {
    renderWithRouter('/');
    expect(screen.getByText('Voice Profile')).toBeInTheDocument();
  });
});
