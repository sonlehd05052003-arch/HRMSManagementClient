import axios from "axios";

/**
 * The message to show for a failed API call. The API answers errors with { message } (or a plain string from a
 * few older endpoints); thunks reject with this string so components never receive the raw response object.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data: unknown = error.response?.data;
        if (typeof data === "string" && data.trim()) return data;
        if (data && typeof data === "object") {
            const { message, title } = data as { message?: unknown; title?: unknown };
            if (typeof message === "string" && message) return message;
            if (typeof title === "string" && title) return title;
        }
    }
    return fallback;
}

/** antd's form.validateFields() rejects with { errorFields }; the form already shows those messages. */
export function isFormValidationError(error: unknown): boolean {
    return !!error && typeof error === "object" && "errorFields" in error;
}

/** The HTTP status of a failed API call, or 0 when the request never got an answer. */
export function apiErrorStatus(error: unknown): number {
    return axios.isAxiosError(error) ? error.response?.status ?? 0 : 0;
}

/**
 * The text of whatever a component caught: the string a thunk rejected with, an Error, or anything with a message.
 */
export function errorText(error: unknown, fallback: string): string {
    if (typeof error === "string" && error) return error;
    if (error && typeof error === "object" && "message" in error) {
        const { message } = error as { message?: unknown };
        if (typeof message === "string" && message) return message;
    }
    return fallback;
}
