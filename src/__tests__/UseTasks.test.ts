import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi', () => ({
  getTasks: vi.fn(),
  getTask: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

const mockTask2: Task = {
  id: 2,
  title: 'Second Task',
  description: null,
  completed: false,
  createdAt: '2026-01-16T10:00:00Z',
  updatedAt: '2026-01-16T10:00:00Z',
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads tasks on mount', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual([mockTask]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when loadTasks fails with an Error', async () => {
    vi.mocked(taskApi.getTasks).mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network failure');
    expect(result.current.tasks).toEqual([]);
  });

  it('sets a generic error message when a non-Error is thrown', async () => {
    vi.mocked(taskApi.getTasks).mockRejectedValue('some string error');

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Une erreur est survenue');
  });

  it('addTask prepends the new task to the list', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
    vi.mocked(taskApi.createTask).mockResolvedValue(mockTask2);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask({ title: 'Second Task' });
    });

    expect(result.current.tasks).toEqual([mockTask2, mockTask]);
    expect(taskApi.createTask).toHaveBeenCalledWith({ title: 'Second Task' });
  });

  it('editTask updates the matching task in place', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
    const editedTask = { ...mockTask, title: 'Updated title' };
    vi.mocked(taskApi.updateTask).mockResolvedValue(editedTask);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editTask(1, { title: 'Updated title' });
    });

    expect(result.current.tasks).toEqual([editedTask]);
  });

  it('removeTask deletes the task from the list', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask, mockTask2]);
    vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeTask(1);
    });

    expect(result.current.tasks).toEqual([mockTask2]);
    expect(taskApi.deleteTask).toHaveBeenCalledWith(1);
  });

  it('toggleComplete flips completion state of the matching task', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
    const toggledTask = { ...mockTask, completed: true };
    vi.mocked(taskApi.updateTask).mockResolvedValue(toggledTask);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(1);
    });

    expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
    expect(result.current.tasks).toEqual([toggledTask]);
  });

  it('toggleComplete does nothing when the task id is not found', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(999);
    });

    expect(taskApi.updateTask).not.toHaveBeenCalled();
    expect(result.current.tasks).toEqual([mockTask]);
  });

  it('loadTasks can be called manually to refresh the list', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValueOnce([mockTask]);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(taskApi.getTasks).mockResolvedValueOnce([mockTask, mockTask2]);

    await act(async () => {
      await result.current.loadTasks();
    });

    expect(result.current.tasks).toEqual([mockTask, mockTask2]);
  });
});