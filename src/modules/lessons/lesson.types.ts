export interface CreateLessonInput {
    title: string;
    content?: string;
    lessonOrder: number;
}

export interface UpdateLessonInput {
    title?: string;
    content?: string;
    lessonOrder?: number;
}