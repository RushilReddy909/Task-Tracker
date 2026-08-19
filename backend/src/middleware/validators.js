import { body, query, validationResult } from 'express-validator';

// Runs after a chain of express-validator checks; responds 400 with the
// collected field errors if any check failed, otherwise calls next().
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => `${e.path}: ${e.msg}`);
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

export const signupRules = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate,
];

export const loginRules = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const taskRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be 200 characters or fewer'),
  body('description').optional().isLength({ max: 2000 }),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be todo, in-progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
  validate,
];

export const taskQueryRules = [
  query('status').optional().isIn(['todo', 'in-progress', 'done']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['dueDate', 'priority', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  validate,
];
