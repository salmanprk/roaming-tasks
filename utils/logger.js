import { format } from 'date-fns';

// Timestamp helper
export const ts = () => {
    const date = new Date();
    const day = date.getDate();
    // const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 != 10) * (day % 10)];
    return format(date, `HH:mm:ss.SSS xxx`);
};

// Color constants
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m"
};

// Helper to handle multiple arguments
const formatArgs = (...args) => args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
).join(' ');

// Logger with timestamp
export const log = {
    success: (...args) => console.log(`${colors.green}[${ts()}]${colors.reset}${colors.green}`, formatArgs(...args), colors.reset),
    error: (...args) => console.log(`${colors.red}[${ts()}]${colors.reset}${colors.red}`, formatArgs(...args), colors.reset),
    warn: (...args) => console.log(`${colors.yellow}[${ts()}]${colors.reset}${colors.yellow}`, formatArgs(...args), colors.reset),
    info: (...args) => console.log(`${colors.cyan}[${ts()}]${colors.reset}${colors.cyan}`, formatArgs(...args), colors.reset),
    debug: (...args) => console.log(`${colors.magenta}[${ts()}]${colors.reset}${colors.magenta}`, formatArgs(...args), colors.reset),
    raw: colors
}; 