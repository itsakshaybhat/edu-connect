export const updateProfileSchema = {
    body: {
        type: "object",
        required: ["name"],
        properties:{
            name: {type:"string", minLength: 2, maxLength: 100}
        },
        additionalProperties: false,
    }
} as const;

export const changePasswordSchema = {
    body: {
        type: "object",
        required: [
            "currentPassword",
            "newPassword",
        ],
        properties: {
            currentPassword: {
                type: "string",
                minLength: 8,
            },
            newPassword: {
                type: "string",
                minLength: 8,     
            }
        },
        additionalProperties: false,
    }
} as const;