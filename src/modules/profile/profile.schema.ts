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