// Custom error classes for NodeFlow

export class ValidationError extends Error {
  public readonly nodeId?: string
  public readonly field?: string

  constructor(message: string, nodeId?: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.nodeId = nodeId
    this.field = field
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class GraphError extends Error {
  public readonly graphId?: string

  constructor(message: string, graphId?: string) {
    super(message)
    this.name = 'GraphError'
    this.graphId = graphId
    Object.setPrototypeOf(this, GraphError.prototype)
  }
}

export class CycleDetectedError extends GraphError {
  public readonly nodeIds: string[]

  constructor(message: string, nodeIds: string[], graphId?: string) {
    super(message, graphId)
    this.name = 'CycleDetectedError'
    this.nodeIds = nodeIds
    Object.setPrototypeOf(this, CycleDetectedError.prototype)
  }
}

export class ExecutionError extends Error {
  public readonly nodeId: string
  public readonly executionId?: string

  constructor(message: string, nodeId: string, executionId?: string) {
    super(message)
    this.name = 'ExecutionError'
    this.nodeId = nodeId
    this.executionId = executionId
    Object.setPrototypeOf(this, ExecutionError.prototype)
  }
}

export class TimeoutError extends ExecutionError {
  public readonly timeout: number

  constructor(message: string, nodeId: string, timeout: number, executionId?: string) {
    super(message, nodeId, executionId)
    this.name = 'TimeoutError'
    this.timeout = timeout
    Object.setPrototypeOf(this, TimeoutError.prototype)
  }
}

export class PauseExecutionError extends Error {
  public readonly reason: string
  public readonly data?: any

  constructor(reason: string, data?: any) {
    super(`Execution paused: ${reason}`)
    this.name = 'PauseExecutionError'
    this.reason = reason
    this.data = data
    Object.setPrototypeOf(this, PauseExecutionError.prototype)
  }
}

export class PortConnectionError extends GraphError {
  public readonly sourceNodeId: string
  public readonly targetNodeId: string

  constructor(
    message: string,
    sourceNodeId: string,
    targetNodeId: string,
    graphId?: string
  ) {
    super(message, graphId)
    this.name = 'PortConnectionError'
    this.sourceNodeId = sourceNodeId
    this.targetNodeId = targetNodeId
    Object.setPrototypeOf(this, PortConnectionError.prototype)
  }
}
