import {ZodError} from 'zod';

export default function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const errorMessages = err.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message
        }));

        return res.status(400).json({
            message: 'Validation failed',
            errors: errorMessages
        });
    }

    if (err.message === 'Invalid credentials') {
        return res.status(401).json({
            message: 'Invalid email or password'
        });
    }

    res.status(400).json({
        message: err?.message || 'Something went wrong',
    });
}

