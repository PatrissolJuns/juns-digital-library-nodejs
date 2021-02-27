require('dotenv').config();
const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');

const transport = new winstonRotator({
    'name': 'error-file',
    // 'level': 'error',
    'filename': './storage/logs/log_%DATE%.txt',
    'json': false,
    'datePattern': 'YYYY_MM_DD',
    'prepend': true,
    'zippedArchive': true,
    'maxSize': '20m',
    'maxFiles': '14d'
});

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

const logger = winston.createLogger({
    level: process.env.MODE === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        process.env.MODE === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ timestamp, level, message, splat }) => `[${timestamp}] ${level.toUpperCase()}: ${message} ${splat !== undefined ? splat : ''}`)
    ),
    transports: [
        transport,
        new winston.transports.Console({
            stderrLevels: ['error'],
        }),
    ],
});

module.exports = logger;
