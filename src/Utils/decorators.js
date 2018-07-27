export const overideMethodDecorator = (overideFunction) => {
    return function decorator(target, name, descriptor) {
        const {value: original} = descriptor;
        if (typeof original === 'function') {
            descriptor.value = (...args) => {
                try {
                    overideFunction(original, args);
                } catch (e) {
                    throw e;
                }
            }
        }

        return descriptor;
    };
};