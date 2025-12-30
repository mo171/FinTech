/*
 * ApiResponse class
 * used for sending response
 * all the api response especially from controllers are sent using this class
 */
class ApiResponse {
    constructor(statusCode, data, message="Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
} 

export { ApiResponse };