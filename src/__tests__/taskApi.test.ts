import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
  id: 1,
  title: 'Test',
  description: null,
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('taskApi', () => {
  it('getTasks returns array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockTask]),
    }));
    const tasks = await getTasks();
    expect(tasks).toEqual([mockTask]);
    expect(fetch).toHaveBeenCalledWith('/api/tasks');
  });

  it('getTasks throws on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    }));
    await expect(getTasks()).rejects.toThrow('HTTP 500');
  });

  it('getTask returns single task', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTask),
    }));
    const task = await getTask(1);
    expect(task).toEqual(mockTask);
    expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
  });

  it('createTask sends POST request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTask),
    }));
    const task = await createTask({ title: 'Test', description: 'Desc' });
    expect(task).toEqual(mockTask);
    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({ method: 'POST' }));
  });

  it('updateTask sends PUT request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockTask, completed: true }),
    }));
    const task = await updateTask(1, { completed: true });
    expect(task.completed).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'PUT' }));
  });

  it('deleteTask sends DELETE request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    await expect(deleteTask(1)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('deleteTask throws on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found'),
    }));
    await expect(deleteTask(999)).rejects.toThrow('HTTP 404');
  });
});