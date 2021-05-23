// Define all errors of tha app
const ERRORS = {
    AUTH: {
        BAD_CREDENTIALS: {
            code: "auth/bad-credentials",
            message: "Incorrect username and/or password",
        },
        BAD_REFRESH_TOKEN: {
            code: "auth/bad-refresh-token",
            message: "Incorrect refresh token sent",
        }
    },
    USERS: {
        EMAIL_ALREADY_EXISTS: {
            code: "users/email-already-exists",
            message: "Email already exists",
        },
        INCORRECT_OLD_PASSWORD: {
            code: "users/old-password-incorrect",
            message: "Incorrect old password",
        }
    },
    FIELDS: {
        REQUIRED: {
            code: "fields/required",
            message: "This field is required",
            field: "title",
        },
        INVALID_EMAIL: {
            code: "fields/invalid-email",
            message: "Email is invalid",
        },
        WEAK_PASSWORD: {
            code: "fields/password_weak",
            message: "Password is too weak. Please provide a one with length of at least 4",
        }
    },
    SERVER: {
        NO_DATA_SENT: {
            code: "server/no-data-sent",
            message: "No data found!",
        },
        INTERNAL_SERVER_ERROR: {
            code: "server/internal-server-error",
            message: "Internal server error",
        }
    },
    FOLDERS: {
        NAME_ALREADY_EXISTS: {
            code: "folders/name-already-exists",
            message: "The name specified is already in use",
        },
        UNKNOWN_FOLDER: {
            code: "folders/unknown-folder",
            message: "Unknown folder id",
        },
        UNKNOWN_PARENT_FOLDER: {
            code: "folders/unknown-parent-folder",
            message: "Unknown parent folder id",
        }
    },
    AUDIO: {
        INCORRECT_ID: {
            code: "audio/incorrect-id",
            message: "Incorrect id given",
        },
        NOT_FOUND: {
            code: "audio/not-found",
            message: "Audio could not be found",
        },
    },
    VIDEO: {
        INCORRECT_ID: {
            code: "video/incorrect-id",
            message: "Incorrect id given",
        },
        NOT_FOUND: {
            code: "video/not-found",
            message: "Video could not be found",
        },
    },
    MEDIA: {
        UPLOAD: {
            FILE_NOT_FOUND: {
                code: "media/uploads/file-not-found",
                message: "No file found. Please upload a file",
            },
            WRONG_FILE_GIVEN: {
                code: "media/uploads/wrong-file-given",
                message: mediaType => `Only ${mediaType} files are allowed!`,
            },
        },
        FILE_NOT_FOUND: {
            code: "media/file-not-found",
            message: "Media file could not be found",
        },
    }
};

// Mongo db error code
const MONGODB_ERRORS_CODE = {
    UNIQUE: 11000
};

module.exports = {
    ERRORS,
    MONGODB_ERRORS_CODE
};
