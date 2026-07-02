import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types/task';

const mockTasks: Task[] = [
  { id: 1, title: 'Premiere tache', description: 'Description 1', completed: false, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { id: 2, title: 'Deuxieme tache', description: null, completed: true, createdAt: '2026-01-16T10:00:00Z', updatedAt: '2026-01-16T10:00:00Z' },
];

describe('TaskList', () => {
  it('shows loading state', () => {
    render(<TaskList tasks={[]} loading={true} error={null} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<TaskList tasks={[]} loading={false} error="Une erreur" onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<TaskList tasks={[]} loading={false} error={null} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('renders list of tasks', () => {
    render(<TaskList tasks={mockTasks} loading={false} error={null} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Premiere tache')).toBeInTheDocument();
    expect(screen.getByText('Deuxieme tache')).toBeInTheDocument();
  });

  it('shows correct task count', () => {
    render(<TaskList tasks={mockTasks} loading={false} error={null} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    const taskCount = screen.getByText(/2 tâche/);
    expect(taskCount).toBeInTheDocument();
  });
  
  it('calls onToggle when task is toggled', () => {
    const onToggle = vi.fn();
    render(<TaskList tasks={mockTasks} loading={false} error={null} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getAllByTestId('task-item')).toHaveLength(2);
  });
});
