/**
 * System Health Monitoring
 * Track server performance, resource usage, and system metrics
 */

import os from 'os';
import fs from 'fs/promises';
import path from 'path';

// ==
// SYSTEM MONITOR
// ==

class SystemMonitor {
  constructor() {
    this.metrics = {
      cpu: [],
      memory: [],
      disk: [],
      requests: [],
      errors: []
    };
    this.maxMetrics = 1000;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    
    // Start periodic collection
    this.startCollection();
  }

  startCollection() {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Initial collection
    this.collectMetrics();
  }

  async collectMetrics() {
    const timestamp = new Date().toISOString();

    // CPU Usage
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    this.metrics.cpu.push({
      timestamp,
      usage: cpuUsage,
      cores: cpus.length
    });

    // Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    this.metrics.memory.push({
      timestamp,
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usage: memUsagePercent
    });

    // Disk Usage (approximate for workspace)
    try {
      const diskUsage = await this.getDiskUsage();
      this.metrics.disk.push({
        timestamp,
        ...diskUsage
      });
    } catch (error) {
      // Disk metrics not available
    }

    // Trim old metrics
    this.trimMetrics();
  }

  async getDiskUsage() {
    const workspaceDir = process.cwd();
    let totalSize = 0;

    async function getDirectorySize(dir) {
      let size = 0;
      try {
        const files = await fs.readdir(dir, { withFileTypes: true });
        
        for (const file of files) {
          const filePath = path.join(dir, file.name);
          
          // Skip node_modules and large directories
          if (file.name === 'node_modules' || file.name === '.git' || file.name === '_site') {
            continue;
          }

          if (file.isDirectory()) {
            size += await getDirectorySize(filePath);
          } else {
            const stats = await fs.stat(filePath);
            size += stats.size;
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
      
      return size;
    }

    totalSize = await getDirectorySize(workspaceDir);

    return {
      workspaceSize: totalSize,
      workspaceSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  trimMetrics() {
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > this.maxMetrics) {
        this.metrics[key] = this.metrics[key].slice(-this.maxMetrics);
      }
    });
  }

  recordRequest(duration, endpoint, status) {
    this.requestCount++;
    this.metrics.requests.push({
      timestamp: new Date().toISOString(),
      duration,
      endpoint,
      status
    });

    if (status >= 400) {
      this.errorCount++;
      this.metrics.errors.push({
        timestamp: new Date().toISOString(),
        endpoint,
        status
      });
    }
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      processUptime: process.uptime(),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0]?.model,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem()
    };
  }

  getCurrentMetrics() {
    const latest = {
      cpu: this.metrics.cpu[this.metrics.cpu.length - 1],
      memory: this.metrics.memory[this.metrics.memory.length - 1],
      disk: this.metrics.disk[this.metrics.disk.length - 1]
    };

    return {
      ...latest,
      uptime: process.uptime(),
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
      }
    };
  }

  getMetricsHistory(type, limit = 100) {
    if (!this.metrics[type]) {
      return [];
    }

    return this.metrics[type].slice(-limit);
  }

  getPerformanceStats() {
    const recentRequests = this.metrics.requests.slice(-100);
    
    if (recentRequests.length === 0) {
      return {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        requestsPerMinute: 0
      };
    }

    const durations = recentRequests.map(r => r.duration);
    const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minResponseTime = Math.min(...durations);
    const maxResponseTime = Math.max(...durations);

    // Calculate requests per minute
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const recentRequestsCount = recentRequests.filter(r => 
      new Date(r.timestamp).getTime() > oneMinuteAgo
    ).length;

    return {
      avgResponseTime: avgResponseTime.toFixed(2),
      minResponseTime,
      maxResponseTime,
      requestsPerMinute: recentRequestsCount
    };
  }

  getHealthStatus() {
    const current = this.getCurrentMetrics();
    
    let status = 'healthy';
    let issues = [];

    // Check CPU
    if (current.cpu?.usage > 90) {
      status = 'critical';
      issues.push('High CPU usage');
    } else if (current.cpu?.usage > 70) {
      status = 'warning';
      issues.push('Elevated CPU usage');
    }

    // Check Memory
    if (current.memory?.usage > 90) {
      status = 'critical';
      issues.push('High memory usage');
    } else if (current.memory?.usage > 75) {
      status = 'warning';
      issues.push('Elevated memory usage');
    }

    // Check Error Rate
    if (current.requests?.errorRate > 10) {
      status = 'warning';
      issues.push('High error rate');
    }

    return {
      status,
      issues,
      timestamp: new Date().toISOString()
    };
  }
}

export const systemMonitor = new SystemMonitor();

// ==
// REQUEST TIMING MIDDLEWARE
// ==

export function requestTimingMiddleware(req, res, next) {
  const startTime = Date.now();

  // Capture original end function
  const originalEnd = res.end;

  res.end = function(...args) {
    const duration = Date.now() - startTime;
    systemMonitor.recordRequest(duration, req.path, res.statusCode);
    originalEnd.apply(res, args);
  };

  next();
}

// ==
// HEALTH CHECK ENDPOINTS
// ==

export function getHealthCheckData() {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: systemMonitor.getSystemInfo(),
    metrics: systemMonitor.getCurrentMetrics(),
    performance: systemMonitor.getPerformanceStats(),
    health: systemMonitor.getHealthStatus()
  };
}

export default {
  systemMonitor,
  requestTimingMiddleware,
  getHealthCheckData
};
