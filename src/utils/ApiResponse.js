export class ApiResponse{
    constructor(statusCode,data,message){
        this.statusCode = statusCode;
        this.data = data == null ? null : data;
        this.success = statusCode < 400;
        this.message = message;
    }
}