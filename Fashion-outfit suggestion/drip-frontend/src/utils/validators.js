/**
 * @fileoverview Zod validation schemas for forms.
 */

import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Please provide a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[@$!%*?&]/, 'Must contain special character (@$!%*?&)'),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required')
})

export const partnerRegisterSchema = z.object({
  brandName: z.string().min(2, 'Brand name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[@$!%*?&]/, 'Must contain special character'),
  category: z.enum(['casual','formal','streetwear','sportswear','ethnic','luxury',
                    'accessories','footwear','kids','other'], {
    required_error: 'Please select a category'
  })
})

export const checkoutSchema = z.object({
  deliveryAddress: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    addressLine1: z.string().min(1, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }),
  paymentMethod: z.enum(['stripe', 'cod'])
})

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(500, 'Max 500 characters')
})

export const messageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(1000, 'Max 1000 characters')
})

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  phone: z.string().optional()
})

export const outfitSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.string().min(1, 'Price is required').or(z.number().min(1, 'Price must be greater than 0')),
  originalPrice: z.string().optional().or(z.number().optional()),
  category: z.enum(['casual','formal','streetwear','sportswear','ethnic','luxury',
                     'accessories','footwear','kids','other'], {
    required_error: 'Please select a category'
  }),
  stock: z.string().optional().or(z.number().min(0).optional())
})
