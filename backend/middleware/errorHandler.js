// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Database specific errors
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(404).json({ message: 'Referenced record not found.' });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate entry - record already exists.' });
  }
  
  if (err.code === 'ER_PARSE_ERROR') {
    return res.status(500).json({ message: 'Database query error.' });
  }
  
  // Default error
  res.status(500).json({ message: 'Something broke!' });
}; 