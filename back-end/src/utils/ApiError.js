/*
 * ApiError class
 * used for sending error response
 * can still use the normal error class but this is more structured
 * and reminds you of which backend is sending that error
 */

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.message = message;
        this.data = null;
        this.success = false;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }   
}

export { ApiError };