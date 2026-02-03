// Abstract base class for all nodes in NodeFlow
import { ConfigField, Node, NodeExecutionState } from '../types/core'
import { InputPorts, OutputPorts } from '../types/port'
import { ValidationError } from '../types/errors'

/**
 * Abstract base class that all node implementations must extend.
 * Defines the interface and common functionality for nodes.
 */
export abstract class BaseNode {
  public id: string
  public type: string
  public name: string
  public description?: string
  public category: 'Collect' | 'Edit' | 'Send' | 'Route' | 'Save' | 'Automate'  ;
  public inputPorts: InputPorts = {}
  public outputPorts: OutputPorts = {}
  public configSchema: ConfigField[] = []
  public config: Record<string, any> = {}
  public icon?: string

  constructor(
    id: string,
    type: string,
    name: string,
    category: 'source' | 'transform' | 'sink' | 'process' | 'storage' | 'automation',
    config: Record<string, any> = {}
  ) {
    this.id = id
    this.type = type
    this.name = name
    this.category = category
    this.config = config
  }

  /**
   * Execute the node with given inputs.
   * Must be implemented by subclasses.
   */
  abstract execute(inputs: Record<string, any>): Promise<Record<string, any>>

  /**
   * Validate node configuration before execution.
   * Can be overridden by subclasses for custom validation.
   */
  validate(): boolean {
    for (const field of this.configSchema) {
      if (field.required && !this.config[field.name]) {
        throw new ValidationError(
          `Required field "${field.label}" is missing`,
          this.id,
          field.name
        )
      }
      if (field.validation && !field.validation(this.config[field.name])) {
        throw new ValidationError(
          `Field "${field.label}" failed validation`,
          this.id,
          field.name
        )
      }
    }
    return true
  }

  /**
   * Get the full schema definition for this node.
   */
  getSchema() {
    return {
      type: this.type,
      category: this.category,
      name: this.name,
      description: this.description,
      icon: this.icon,
      inputPorts: this.inputPorts,
      outputPorts: this.outputPorts,
      configSchema: this.configSchema,
    }
  }

  /**
   * Convert to GraphQL-compatible Node format.
   */
  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.id,
      type: this.type,
      position,
      data: this.config,
      config: this.configSchema,
    }
  }

  /**
   * Update configuration from external source.
   */
  updateConfig(newConfig: Record<string, any>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get all input port names.
   */
  getInputPortNames(): string[] {
    return Object.keys(this.inputPorts)
  }

  /**
   * Get all output port names.
   */
  getOutputPortNames(): string[] {
    return Object.keys(this.outputPorts)
  }

  /**
   * Check if this node can receive input from another node.
   */
  canReceiveFrom(sourceNode: BaseNode): boolean {
    return this.getInputPortNames().length > 0
  }

  /**
   * Check if this node can send output to another node.
   */
  canSendTo(targetNode: BaseNode): boolean {
    return this.getOutputPortNames().length > 0
  }

  /**
   * Create execution state for this node.
   */
  createExecutionState(): NodeExecutionState {
    return {
      nodeId: this.id,
      status: 'pending',
      inputs: {},
      outputs: {},
      retryCount: 0,
    }
  }

  /**
   * Log for debugging.
   */
  protected log(message: string, data?: any): void {
    console.log(`[${this.name}] ${message}`, data || '')
  }

  /**
   * Error logging.
   */
  protected error(message: string, error?: Error): void {
    console.error(`[${this.name}] ERROR: ${message}`, error || '')
  }
}
