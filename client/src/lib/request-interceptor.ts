
// Request Interceptor - Automatically log and check all API requests

interface RequestLog {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
  domain?: string;
}

interface ResponseLog extends RequestLog {
  status: number;
  statusText: string;
  responseData?: any;
  duration: number;
  error?: string;
}

// Store request logs
const requestLogs: ResponseLog[] = [];

// Get max logs to keep in memory
const MAX_LOGS = 100;

// Original fetch
const originalFetch = window.fetch;

// Enhanced fetch with automatic logging
export const setupRequestInterceptor = () => {
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const startTime = performance.now();
    
    // Parse request info
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';
    
    // Get domain from localStorage
    const domain = localStorage.getItem('domain') || 'NOT_SET';
    const currentOrigin = window.location.origin;
    
    // Clone init to avoid mutating the original
    const enhancedInit = { ...init };
    
    // Ensure headers object exists
    if (!enhancedInit.headers) {
      enhancedInit.headers = {};
    }
    
    // Convert headers to plain object if it's a Headers instance
    let headersObj: Record<string, string> = {};
    if (enhancedInit.headers instanceof Headers) {
      enhancedInit.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else if (Array.isArray(enhancedInit.headers)) {
      enhancedInit.headers.forEach(([key, value]) => {
        headersObj[key] = value;
      });
    } else {
      headersObj = { ...enhancedInit.headers as Record<string, string> };
    }
    
    // Auto-inject X-Tenant-Domain header if domain exists and not already set
    if (domain && domain !== 'NOT_SET' && !headersObj['X-Tenant-Domain'] && !headersObj['x-tenant-domain']) {
      headersObj['X-Tenant-Domain'] = domain;
      console.log(`✅ Auto-injected X-Tenant-Domain: ${domain}`);
    }
    
    // Auto-inject Origin header if not already set
    if (!headersObj['Origin'] && !headersObj['origin']) {
      headersObj['Origin'] = currentOrigin;
      console.log(`✅ Auto-injected Origin: ${currentOrigin}`);
    }
    
    // Update init with enhanced headers
    enhancedInit.headers = headersObj;
    
    // Create request log
    const requestLog: RequestLog = {
      url,
      method,
      headers: { ...headersObj },
      body: init?.body ? JSON.parse(JSON.stringify(init.body)) : undefined,
      timestamp: new Date().toISOString(),
      domain
    };

    // Log request to console
    console.group(`🌐 [REQUEST] ${method} ${url}`);
    console.log('📤 Request Details:', {
      url,
      method,
      headers: requestLog.headers,
      body: requestLog.body,
      domain,
      autoInjectedHeaders: {
        'X-Tenant-Domain': headersObj['X-Tenant-Domain'],
        'Origin': headersObj['Origin']
      }
    });
    console.groupEnd();

    try {
      // Make actual request with enhanced headers
      const response = await originalFetch(input, enhancedInit);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Clone response to read body
      const clonedResponse = response.clone();
      let responseData: any;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await clonedResponse.json();
        } else {
          responseData = await clonedResponse.text();
        }
      } catch (e) {
        responseData = 'Could not parse response';
      }

      // Create response log
      const responseLog: ResponseLog = {
        ...requestLog,
        status: response.status,
        statusText: response.statusText,
        responseData,
        duration
      };

      // Add to logs array
      requestLogs.push(responseLog);
      if (requestLogs.length > MAX_LOGS) {
        requestLogs.shift(); // Remove oldest log
      }

      // Log response to console
      const statusEmoji = response.ok ? '✅' : '❌';
      console.group(`${statusEmoji} [RESPONSE] ${method} ${url} - ${response.status}`);
      console.log('📥 Response Details:', {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration.toFixed(2)}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      });
      console.groupEnd();

      // Check for common issues
      if (!response.ok) {
        console.warn(`⚠️ [REQUEST FAILED] ${method} ${url}`, {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
      }

      // Check for missing domain
      if (!domain || domain === 'NOT_SET') {
        console.warn(`⚠️ [MISSING DOMAIN] Request made without tenant domain set in localStorage`);
      }

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Create error log
      const errorLog: ResponseLog = {
        ...requestLog,
        status: 0,
        statusText: 'Network Error',
        duration,
        error: error instanceof Error ? error.message : String(error)
      };

      // Add to logs array
      requestLogs.push(errorLog);
      if (requestLogs.length > MAX_LOGS) {
        requestLogs.shift();
      }

      // Log error to console
      console.group(`❌ [REQUEST ERROR] ${method} ${url}`);
      console.error('Error Details:', {
        error,
        duration: `${duration.toFixed(2)}ms`,
        url,
        method
      });
      console.groupEnd();

      throw error;
    }
  };

  console.log('✅ Request interceptor activated - All fetch requests will be logged');
};

// Get all request logs
export const getRequestLogs = (): ResponseLog[] => {
  return [...requestLogs];
};

// Clear request logs
export const clearRequestLogs = () => {
  requestLogs.length = 0;
  console.log('🗑️ Request logs cleared');
};

// Export logs as JSON
export const exportRequestLogs = () => {
  const dataStr = JSON.stringify(requestLogs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `request-logs-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  console.log('📥 Request logs exported');
};

// Add global helper functions
if (typeof window !== 'undefined') {
  (window as any).getRequestLogs = getRequestLogs;
  (window as any).clearRequestLogs = clearRequestLogs;
  (window as any).exportRequestLogs = exportRequestLogs;
}
