export const formatErrorResponse = (error) => ({
    message: error.issues.map(issue => ({
        code: issue.code,
        message: issue.message,
        path: issue.path,
    })),
});