
const { check, validationResult} = require("express-validator");

const validateLogin = [
    //check("username", "Username lenght must be between 1 and 32").isLength({min: 1, max:32}),
    //check("password").isLength({min: 8}).withMessage("Password must be at least 8 characters long.")
    //               .matches('[0-9]').withMessage('Password Must Contain a Number')
    //                .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter')
];

const validateRegister = [
    check("username", "Username lenght must be between 1 and 32.").isLength({min: 1, max:32}),
    check("password").isLength({min: 8}).withMessage("Password must be at least 8 characters long.")
                   .matches('[0-9]').withMessage('Password Must Contain a Number.')
                    .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter.')
];

module.exports = {
    validateLogin,
    validateRegister
}