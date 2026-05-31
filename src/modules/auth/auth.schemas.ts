export const registerSchema = {
    body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
            name: {type: "string", minLength: 2, maxLength: 100},
            email: {type: "string", format: "email"},
            password: {type: "string", minLength: 8, maxLength: 72},
        },
        additionalProperties: false,
    }
} as const;

export const loginSchema = {
    body: {
        type: "object",
        required: ["email", "password"],
        properties:{
            email: {type: "string", format: "email"},
            password: {type: "string", minLength: 8, maxLength: 72},
        },
        additionalProperties: false,
    },
} as const;