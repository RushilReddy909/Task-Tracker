import mongoose from 'mongoose';
import Task from '../models/Task.js';

// GET /api/tasks
// Supports: ?status=&priority=&search=&page=&limit=&sortBy=&order=
export const getTasks = async (req, res) => {
  const {
    status,
    priority,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Task.countDocuments(filter),
  ]);

  res.json({
    tasks,
    total,
    page: Number(page),
    pages: Math.max(Math.ceil(total / limit), 1),
  });
};

// GET /api/tasks/analytics
export const getAnalytics = async (req, res) => {
  const result = await Task.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = { todo: 0, 'in-progress': 0, done: 0 };
  result.forEach((r) => {
    counts[r._id] = r.count;
  });

  const total = counts.todo + counts['in-progress'] + counts.done;
  const completed = counts.done;
  const pending = counts.todo + counts['in-progress'];
  const completionPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.json({
    total,
    completed,
    pending,
    inProgress: counts['in-progress'],
    todo: counts.todo,
    completionPercent,
  });
};

// GET /api/tasks/:id
export const getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ task });
};

// POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    user: req.user._id,
  });

  res.status(201).json({ task });
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();

  res.json({ task });
};

// PATCH /api/tasks/:id/complete
export const completeTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.status = 'done';
  await task.save();

  res.json({ task });
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  res.json({ message: 'Task deleted', id: req.params.id });
};
