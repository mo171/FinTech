/* 
  
  - This function takes an asynchronous function (fn) as an argument.
  - It returns a new function that takes the standard Express.js parameters: req, res, and next.
  - Inside the returned function, it uses a try-catch block to handle errors.
  - It awaits the execution of the original asynchronous function (fn) with the provided req, res, and next.
  - If an error occurs during the execution of fn, it catches the error and sends a JSON response with a 500 status code, indicating an internal server error, along with the error message.

*/
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// alternate ways
// ---------------shorter way---------------------
// const asyncHandler = (fn) => {
//   return function (req, res, next) {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// };

export {asyncHandler};
