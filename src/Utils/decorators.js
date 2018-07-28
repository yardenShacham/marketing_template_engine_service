export const addtionalFunctionalityDecorator = (func) => {
    return function decorator(target, name, descriptor) {
        const {value: original} = descriptor;
        if (typeof original === 'function') {
            try {
                func(original);
            } catch (e) {
                throw e;
            }
        }

        return descriptor;
    };
};