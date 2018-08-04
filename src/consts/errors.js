export const errorTypes = {
    generalError: "generalError",
    validationError: "validationError"
};

export const errors = {
    [errorTypes.generalError]: {
        status: 500,
        code: "gen500o"
    },
    [errorTypes.validationError]: {
        status: 400,
        code: "val400o"
    }
};
