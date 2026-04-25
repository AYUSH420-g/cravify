const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Default error status and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Mongoose bad object ID
    if (err.name === 'CastError') {
        return res.status(404).json({
            success: false,
            message: `Resource not found with ID of ${err.value}`,
            errorCode: 'RESOURCE_NOT_FOUND',
            data: null
        });
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered',
            errorCode: 'DUPLICATE_ERROR',
            data: null
        });
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errorMsg = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({
            success: false,
            message: errorMsg,
            errorCode: 'VALIDATION_ERROR',
            data: null
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorCode: err.errorCode || 'SERVER_ERROR',
        data: null
    });
};

module.exports = errorHandler;
