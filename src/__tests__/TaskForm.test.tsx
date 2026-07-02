import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders create mode by default', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });

  it('renders edit mode with initial values', () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{ title: 'Existing title', description: 'Existing desc' }}
      />
    );
    expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toHaveValue('Existing title');
    expect(screen.getByLabelText('Description')).toHaveValue('Existing desc');
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
  });

  it('shows a validation error when submitting an empty title', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the validation error as soon as the user types a title', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'New title' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('submits trimmed title and description', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: '  My task  ' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '  Some details  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My task',
      description: 'Some details',
    });
  });

  it('submits description as undefined when left empty', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Only a title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Only a title',
      description: undefined,
    });
  });

  it('resets fields after submit in create mode', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Task to reset' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(screen.getByLabelText('Titre')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });

  it('does not reset fields after submit in edit mode', () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{ title: 'Keep me', description: 'Keep this too' }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    expect(screen.getByLabelText('Titre')).toHaveValue('Keep me');
    expect(screen.getByLabelText('Description')).toHaveValue('Keep this too');
  });

  it('does not render a cancel button when onCancel is not provided', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
