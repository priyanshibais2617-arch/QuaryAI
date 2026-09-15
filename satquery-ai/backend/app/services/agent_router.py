"""
SatQuery AI - Autonomous Agent Router Service (Compatibility Wrapper)
Re-exports Router, AgentRouter, and router from app.services.router.
"""
from app.services.router import (
    Router,
    AgentRouter,
    router,
    agent_router,
    VALID_TASKS,
    SINGLE_FILE_TASKS,
    DUAL_FILE_TASKS,
    TASK_TO_WORKFLOW,
)

__all__ = [
    "Router",
    "AgentRouter",
    "router",
    "agent_router",
    "VALID_TASKS",
    "SINGLE_FILE_TASKS",
    "DUAL_FILE_TASKS",
    "TASK_TO_WORKFLOW",
]
