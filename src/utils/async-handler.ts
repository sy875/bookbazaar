// // TODO: we may need it later
// function asyncHandler(requestHandler){
//     return function(req, res, next){
//         Promise.resolve(requestHandler(req, res, next))
//         .catch(function(err){
//             next(err)
//         })
//     }
// }

// export {asyncHandler}


import {
  Request,
  Response,
  NextFunction,
  RequestHandler as ExpressRequestHandler,
} from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (requestHandler: ExpressRequestHandler | AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };


