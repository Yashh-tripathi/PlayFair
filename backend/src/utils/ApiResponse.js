class ApiRespose {
    constructor(
        statusCode,
        message = "successfull",
        data
    ){
        this.statusCode = statusCode,
        this.message = message,
        this.data = data,
        this.success = statusCode < 400
    }
}

export {ApiRespose}