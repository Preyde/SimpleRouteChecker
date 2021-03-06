import { Logger } from "./logger.ts";
import { BaseHandler, ConsoleHandler, FileHandler, RotatingFileHandler, WriterHandler, } from "./handlers.ts";
import { assert } from "../_util/assert.ts";
export { LogLevels } from "./levels.ts";
export { Logger } from "./logger.ts";
export class LoggerConfig {
}
const DEFAULT_LEVEL = "INFO";
const DEFAULT_CONFIG = {
    handlers: {
        default: new ConsoleHandler(DEFAULT_LEVEL),
    },
    loggers: {
        default: {
            level: DEFAULT_LEVEL,
            handlers: ["default"],
        },
    },
};
const state = {
    handlers: new Map(),
    loggers: new Map(),
    config: DEFAULT_CONFIG,
};
export const handlers = {
    BaseHandler,
    ConsoleHandler,
    WriterHandler,
    FileHandler,
    RotatingFileHandler,
};
export function getLogger(name) {
    if (!name) {
        const d = state.loggers.get("default");
        assert(d != null, `"default" logger must be set for getting logger without name`);
        return d;
    }
    const result = state.loggers.get(name);
    if (!result) {
        const logger = new Logger(name, "NOTSET", { handlers: [] });
        state.loggers.set(name, logger);
        return logger;
    }
    return result;
}
export function debug(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").debug(msg, ...args);
    }
    return getLogger("default").debug(msg, ...args);
}
export function info(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").info(msg, ...args);
    }
    return getLogger("default").info(msg, ...args);
}
export function warning(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").warning(msg, ...args);
    }
    return getLogger("default").warning(msg, ...args);
}
export function error(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").error(msg, ...args);
    }
    return getLogger("default").error(msg, ...args);
}
export function critical(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").critical(msg, ...args);
    }
    return getLogger("default").critical(msg, ...args);
}
export async function setup(config) {
    state.config = {
        handlers: { ...DEFAULT_CONFIG.handlers, ...config.handlers },
        loggers: { ...DEFAULT_CONFIG.loggers, ...config.loggers },
    };
    state.handlers.forEach((handler) => {
        handler.destroy();
    });
    state.handlers.clear();
    const handlers = state.config.handlers || {};
    for (const handlerName in handlers) {
        const handler = handlers[handlerName];
        await handler.setup();
        state.handlers.set(handlerName, handler);
    }
    state.loggers.clear();
    const loggers = state.config.loggers || {};
    for (const loggerName in loggers) {
        const loggerConfig = loggers[loggerName];
        const handlerNames = loggerConfig.handlers || [];
        const handlers = [];
        handlerNames.forEach((handlerName) => {
            const handler = state.handlers.get(handlerName);
            if (handler) {
                handlers.push(handler);
            }
        });
        const levelName = loggerConfig.level || DEFAULT_LEVEL;
        const logger = new Logger(loggerName, levelName, { handlers: handlers });
        state.loggers.set(loggerName, logger);
    }
}
await setup(DEFAULT_CONFIG);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFckMsT0FBTyxFQUNMLFdBQVcsRUFDWCxjQUFjLEVBQ2QsV0FBVyxFQUNYLG1CQUFtQixFQUNuQixhQUFhLEdBQ2QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFeEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVyQyxNQUFNLE9BQU8sWUFBWTtDQUd4QjtBQVdELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQztBQUM3QixNQUFNLGNBQWMsR0FBYztJQUNoQyxRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUUsSUFBSSxjQUFjLENBQUMsYUFBYSxDQUFDO0tBQzNDO0lBRUQsT0FBTyxFQUFFO1FBQ1AsT0FBTyxFQUFFO1lBQ1AsS0FBSyxFQUFFLGFBQWE7WUFDcEIsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDO1NBQ3RCO0tBQ0Y7Q0FDRixDQUFDO0FBRUYsTUFBTSxLQUFLLEdBQUc7SUFDWixRQUFRLEVBQUUsSUFBSSxHQUFHLEVBQXVCO0lBQ3hDLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBa0I7SUFDbEMsTUFBTSxFQUFFLGNBQWM7Q0FDdkIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRztJQUN0QixXQUFXO0lBQ1gsY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsbUJBQW1CO0NBQ3BCLENBQUM7QUFHRixNQUFNLFVBQVUsU0FBUyxDQUFDLElBQWE7SUFDckMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMs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