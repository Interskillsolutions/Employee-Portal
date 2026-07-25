export const validateTaskPayload = (req, res, next) => {
  const { title, category, priority } = req.body;
  const errors = [];

  if (!title || !title.trim()) {
    errors.push({ field: 'title', message: 'Task title is required' });
  }

  if (!category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (!priority) {
    errors.push({ field: 'priority', message: 'Priority is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation Error',
      errors,
    });
  }

  next();
};
