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
    },
    FIELDS: {
        REQUIRED: {
            code: "fields/required",
            message: "This field is required",
            field: "",
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
