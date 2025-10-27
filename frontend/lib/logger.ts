/**
 * Frontend Logger
 * Client-side logging utility สำหรับ debugging และ error tracking
 */

/**
 * Log levels
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

/**
 * Log entry interface
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
  url?: string;
  userAgent?: string;
  userId?: string;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableLocalStorage: boolean;
  maxLocalStorageLogs: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
}

/**
 * Default configuration
 */
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO,
  enableConsole: true,
  enableLocalStorage: true,
  maxLocalStorageLogs: 100,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/logs` : undefined,
};

/**
 * Logger class
 */
class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.loadLogsFromStorage();
  }

  /**
   * Load logs from localStorage
   */
  private loadLogsFromStorage(): void {
    if (typeof window === 'undefined' || !this.config.enableLocalStorage) return;

    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogsToStorage(): void {
    if (typeof window === 'undefined' || !this.config.enableLocalStorage) return;

    try {
      // Keep only recent logs
      const recentLogs = this.logs.slice(-this.config.maxLocalStorageLogs);
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
      this.logs = recentLogs;
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  /**
   * Send logs to remote server
   */
  private async sendToRemote(log: LogEntry): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });
    } catch (error) {
      console.error('Failed to send log to remote server:', error);
    }
  }

  /**
   * Create log entry
   */
  private createLogEntry(level: LogLevel, message: string, meta?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      userId: this.getCurrentUserId(),
    };
  }

  /**
   * Get current user ID from auth store
   */
  private getCurrentUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      // Ignore error
    }
    return undefined;
  }

  /**
   * Log message
   */
  private log(level: LogLevel, message: string, meta?: any): void {
    // Check if log level is enabled
    const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex > currentLevelIndex) return;

    const logEntry = this.createLogEntry(level, message, meta);

    // Add to logs array
    this.logs.push(logEntry);

    // Console logging
    if (this.config.enableConsole) {
      const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' :
                           level === LOG_LEVELS.WARN ? 'warn' :
                           level === LOG_LEVELS.INFO ? 'info' : 'debug';
      
      console[consoleMethod](`[${logEntry.timestamp}] ${message}`, meta);
    }

    // Save to localStorage
    this.saveLogsToStorage();

    // Send to remote server (async)
    this.sendToRemote(logEntry);
  }

  /**
   * Log error
   */
  error(message: string, meta?: any): void {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  /**
   * Log warning
   */
  warn(message: string, meta?: any): void {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  /**
   * Log info
   */
  info(message: string, meta?: any): void {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  /**
   * Log debug
   */
  debug(message: string, meta?: any): void {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, meta?: any): void {
    this.debug(`API Request: ${method} ${url}`, meta);
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, duration?: number, meta?: any): void {
    const message = `API Response: ${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    
    if (status >= 400) {
      this.error(message, meta);
    } else if (status >= 300) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  /**
   * Log user action
   */
  userAction(action: string, meta?: any): void {
    this.info(`User Action: ${action}`, meta);
  }

  /**
   * Log page view
   */
  pageView(page: string, meta?: any): void {
    this.info(`Page View: ${page}`, meta);
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms', meta?: any): void {
    this.info(`Performance: ${metric} - ${value}${unit}`, meta);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs');
    }
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as file
   */
  downloadLogs(): void {
    if (typeof window === 'undefined') return;

    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Create logger instance
 */
const logger = new Logger({
  level: process.env.NEXT_PUBLIC_DEBUG === 'true' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO,
  enableConsole: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true',
});

/**
 * Global error handler
 */
if (typeof window !== 'undefined') {
  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise,
    });
  });
}

export default logger;
export type { Logger, LogLevel, LogEntry };
