export interface ProfileResponse {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
};

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
};