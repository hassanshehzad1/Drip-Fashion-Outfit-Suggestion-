/**
 * @fileoverview Parse backend API errors into a standardized format.
 * Handles 422 validation errors and general errors.
 * @param {Error} error - The Axios error object
 * @returns {{message: string, fieldErrors: Object}} Parsed error data
 */

export const parseApiError = (error) => {
  const response = error?.response?.data

  if (!response) {
    return {
      message: error?.message === 'Network Error'
        ? 'Cannot connect to server. Is the backend running?'
        : 'Something went wrong. Please try again.',
      fieldErrors: {}
    }
  }

  if (response.errors && Array.isArray(response.errors)) {
    const fieldErrors = {}
    response.errors.forEach(({ field, message }) => {
      fieldErrors[field] = message
    })
    return { message: response.message || 'Validation failed', fieldErrors }
  }

  if (error?.response?.status === 429) {
    return {
      message: response.message || 'Too many attempts. Please wait and try again.',
      fieldErrors: {}
    }
  }

  return {
    message: response.message || 'Something went wrong.',
    fieldErrors: {}
  }
}
