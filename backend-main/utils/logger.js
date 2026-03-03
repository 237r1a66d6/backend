const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.errorLogPath = path.join(logsDir, 'error.log');
        this.combinedLogPath = path.join(logsDir, 'combined.log');
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaString}\n`;
    }

    writeToFile(filePath, message) {
        try {
            fs.appendFileSync(filePath, message);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }

    log(level, message, meta = {}) {
        if (logLevels[level] > logLevels[this.logLevel]) {
            return;
        }

        const formattedMessage = this.formatMessage(level, message, meta);

        // Always log to console in development
        if (process.env.NODE_ENV !== 'production') {
            const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
            console[consoleMethod](message, meta);
        }

        // Log to files in production
        if (process.env.NODE_ENV === 'production') {
            this.writeToFile(this.combinedLogPath, formattedMessage);
            
            if (level === 'error') {
                this.writeToFile(this.errorLogPath, formattedMessage);
            }
        }
    }

    error(message, meta) {
        this.log('error', message, meta);
    }

    warn(message, meta) {
        this.log('warn', message, meta);
    }

    info(message, meta) {
        this.log('info', message, meta);
    }

    debug(message, meta) {
        this.log('debug', message, meta);
    }
}

module.exports = new Logger();
