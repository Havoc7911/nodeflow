/**
 * TriggerSystem.ts
 * Automation trigger system for scheduled and event-based workflow execution
 * Uses cron-parser for schedule parsing and management
 */

import cronParser from 'cron-parser';

export type TriggerType = 'schedule' | 'event' | 'webhook' | 'manual';

export interface Trigger {
  id: string;
  type: TriggerType;
  workflowId: string;
  enabled: boolean;
  config: TriggerConfig;
  lastRun?: Date;
  nextRun?: Date;
}

export interface TriggerConfig {
  // For schedule triggers
  cron?: string;
  timezone?: string;
  
  // For event triggers
  eventType?: string;
  eventSource?: string;
  
  // For webhook triggers
  webhookPath?: string;
  webhookSecret?: string;
}

export interface TriggerExecution {
  triggerId: string;
  workflowId: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export class TriggerSystem {
  private triggers: Map<string, Trigger> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, Set<string>> = new Map();
  private executionHistory: TriggerExecution[] = [];

  /**
   * Register a new trigger
   */
  registerTrigger(trigger: Trigger): void {
    this.triggers.set(trigger.id, trigger);
    
    if (trigger.enabled) {
      this.enableTrigger(trigger.id);
    }

    console.log(`[TriggerSystem] Registered trigger: ${trigger.id} (${trigger.type})`);
  }

  /**
   * Unregister a trigger
   */
  unregisterTrigger(triggerId: string): void {
    this.disableTrigger(triggerId);
    this.triggers.delete(triggerId);
    console.log(`[TriggerSystem] Unregistered trigger: ${triggerId}`);
  }

  /**
   * Enable a trigger
   */
  enableTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      console.error(`[TriggerSystem] Trigger not found: ${triggerId}`);
      return;
    }

    trigger.enabled = true;

    switch (trigger.type) {
      case 'schedule':
        this.scheduleNext(trigger);
        break;
      case 'event':
        this.registerEventListener(trigger);
        break;
      case 'webhook':
        this.setupWebhook(trigger);
        break;
    }

    console.log(`[TriggerSystem] Enabled trigger: ${triggerId}`);
  }

  /**
   * Disable a trigger
   */
  disableTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return;

    trigger.enabled = false;

    // Clear any scheduled timers
    const timer = this.timers.get(triggerId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(triggerId);
    }

    // Remove event listeners
    if (trigger.type === 'event' && trigger.config.eventType) {
      const listeners = this.eventListeners.get(trigger.config.eventType);
      if (listeners) {
        listeners.delete(triggerId);
      }
    }

    console.log(`[TriggerSystem] Disabled trigger: ${triggerId}`);
  }

  /**
   * Schedule the next execution for a cron-based trigger
   */
  private scheduleNext(trigger: Trigger): void {
    if (!trigger.config.cron) {
      console.error(`[TriggerSystem] No cron expression for trigger: ${trigger.id}`);
      return;
    }

    try {
          //@ts-expect-error
      const interval = cronParser.parseExpression(trigger.config.cron, {
        currentDate: new Date(),
        tz: trigger.config.timezone
      });

      const nextRun = interval.next().toDate();
      trigger.nextRun = nextRun;

      const delay = nextRun.getTime() - Date.now();

      // Clear any existing timer
      const existingTimer = this.timers.get(trigger.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Schedule the next execution
      const timer = setTimeout(() => {
        this.executeTrigger(trigger.id);
        // Schedule the next run after this one
        if (trigger.enabled) {
          this.scheduleNext(trigger);
        }
      }, delay);

      this.timers.set(trigger.id, timer);

      console.log(
        `[TriggerSystem] Scheduled trigger ${trigger.id} for ${nextRun.toISOString()}`
      );
    } catch (error) {
      console.error(
        `[TriggerSystem] Invalid cron expression for trigger ${trigger.id}:`,
        error
      );
    }
  }

  /**
   * Register an event listener for event-based triggers
   */
  private registerEventListener(trigger: Trigger): void {
    if (!trigger.config.eventType) return;

    const eventType = trigger.config.eventType;
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }

    this.eventListeners.get(eventType)!.add(trigger.id);
    console.log(`[TriggerSystem] Listening for event: ${eventType}`);
  }

  /**
   * Setup webhook endpoint (placeholder - needs integration with server)
   */
  private setupWebhook(trigger: Trigger): void {
    console.log(
      `[TriggerSystem] Webhook trigger ${trigger.id} ready at path: ${trigger.config.webhookPath}`
    );
    // In a full implementation, this would register with an Express server
  }

  /**
   * Execute a trigger
   */
  private async executeTrigger(triggerId: string): Promise<void> {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return;

    console.log(`[TriggerSystem] Executing trigger: ${triggerId}`);

    const execution: TriggerExecution = {
      triggerId,
      workflowId: trigger.workflowId,
      timestamp: new Date(),
      success: false
    };

    try {
      // Execute the workflow (this would integrate with ExecutionEngine)
      // For now, just mark as successful
      await this.runWorkflow(trigger.workflowId);
      
      execution.success = true;
      trigger.lastRun = new Date();
    } catch (error) {
      execution.success = false;
      execution.error = error instanceof Error ? error.message : String(error);
      console.error(`[TriggerSystem] Trigger execution failed:`, error);
    }

    this.executionHistory.push(execution);

    // Keep only last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory.shift();
    }
  }

  /**
   * Fire an event to trigger any listening event-based triggers
   */
  fireEvent(eventType: string, eventData?: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (!listeners || listeners.size === 0) {
      console.log(`[TriggerSystem] No listeners for event: ${eventType}`);
      return;
    }

    console.log(
      `[TriggerSystem] Firing event ${eventType} to ${listeners.size} listener(s)`
    );

    listeners.forEach((triggerId) => {
      this.executeTrigger(triggerId);
    });
  }

  /**
   * Placeholder for workflow execution
   * In production, this would integrate with ExecutionEngine
   */
  private async runWorkflow(workflowId: string): Promise<void> {
    console.log(`[TriggerSystem] Running workflow: ${workflowId}`);
    // Integration point with ExecutionEngine
    return Promise.resolve();
  }

  /**
   * Get all registered triggers
   */
  getTriggers(): Trigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get a specific trigger
   */
  getTrigger(triggerId: string): Trigger | undefined {
    return this.triggers.get(triggerId);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 50): TriggerExecution[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Validate a cron expression
   */
  validateCron(cronExpression: string): { valid: boolean; error?: string; next?: Date } {
    try {
          //@ts-expect-error
      const interval = cronParser.parseExpression(cronExpression);
      const next = interval.next().toDate();
      return { valid: true, next };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid cron expression'
      };
    }
  }

  /**
   * Cleanup all triggers and timers
   */
  shutdown(): void {
    console.log('[TriggerSystem] Shutting down...');
    
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.eventListeners.clear();
    this.triggers.clear();
    
    console.log('[TriggerSystem] Shutdown complete');
  }
}

// Singleton instance
export const triggerSystem = new TriggerSystem();

export default TriggerSystem;