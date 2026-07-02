import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

const completedTask: Task = {
  ...mockTask,
  completed: true,
};

describe('TaskItem', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders task title and description', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders completed task with correct class', () => {
    render(<TaskItem task={completedTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
  });

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
  });

  it('calls onEdit when save button is clicked', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(onEdit).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Test Task' }));
  });

  it('cancels edit mode when cancel button is clicked', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onDelete on second delete click', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('renders task without description', () => {
    const taskNoDesc = { ...mockTask, description: null };
    render(<TaskItem task={taskNoDesc} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  // --- Nouveaux tests : couverture lignes 55-62 (handleDelete) ---

  it('shows confirmation icon after first delete click', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveTextContent('⚠️');
  });

  it('does not call onDelete after only one click', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('resets confirmation state after timeout', () => {
    vi.useFakeTimers();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveTextContent('⚠️');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveTextContent('🗑️');
  });

  // --- Nouveau test : couverture garde handleSave (titre vide) ---

  it('does not call onEdit when title is empty or whitespace', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    const input = screen.getByLabelText('Modifier le titre');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    expect(onEdit).not.toHaveBeenCalled();
    // reste en mode édition puisque la sauvegarde a été bloquée
    expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
  });
});
