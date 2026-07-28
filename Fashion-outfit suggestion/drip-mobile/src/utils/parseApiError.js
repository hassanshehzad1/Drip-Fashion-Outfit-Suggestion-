export const parseApiError = (error) => {
  const response = error?.response?.data

  if (!response) {
    return {
      message: error?.message === 'Network Error'
        ? 'Cannot connect to server. Check your internet connection.'
        : 'Something went wrong. Please try again.',
      fieldErrors: {}
    }
  }

  // 422 validation errors with field-level detail
  if (response.errors && Array.isArray(response.errors)) {
    const fieldErrors = {}
    response.errors.forEach(({ field, message }) => {
      fieldErrors[field] = message
    })
    return { message: response.message || 'Validation failed', fieldErrors }
  }

  if (error?.response?.status === 429) {
    return {
      message: response.message || 'Too many attempts. Please wait.',
      fieldErrors: {}
    }
  }

  return {
    message: response.message || 'Something went wrong.',
    fieldErrors: {}
  }
}
