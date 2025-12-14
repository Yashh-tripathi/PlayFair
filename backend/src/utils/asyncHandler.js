const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}


export {asyncHandler}
/* With try catch

const asyncHandler = (fn) => () => {
        try{
            fn(req,res,next)
        }catch(err){
            res.status(err.code || 500).json({
                success: false,
                message : err.message
            })
        }
    }

*/