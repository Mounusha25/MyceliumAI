"""
Runtime helpers for consistent uAgent network/registration behavior.
"""
import os

from uagents.registration import AlmanacApiRegistrationPolicy


def is_testnet_enabled() -> bool:
    raw = os.getenv("FET_USE_TESTNET", "true").strip().lower()
    return raw in {"1", "true", "yes", "on"}


def agent_network() -> str:
    return "testnet" if is_testnet_enabled() else "mainnet"


def _env_flag(name: str, default: bool) -> bool:
    raw = os.getenv(name, str(default)).strip().lower()
    return raw in {"1", "true", "yes", "on"}


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError:
        return default


def heartbeat_enabled() -> bool:
    return _env_flag("AGENT_HEARTBEAT_ENABLED", True)


def heartbeat_period_seconds() -> float:
    value = _env_float("AGENT_HEARTBEAT_SECONDS", 45.0)
    return max(10.0, value)


def startup_signal_enabled() -> bool:
    return _env_flag("AGENT_STARTUP_SIGNAL_ENABLED", True)


def mailbox_enabled() -> bool:
    # Keep Agentverse mailbox behavior by default; allow local direct mode when needed.
    return _env_flag("AGENT_MAILBOX_ENABLED", True)


def agent_endpoint(port: int) -> str | None:
    """
    Provide a local endpoint when mailbox transport is disabled.
    uAgents expects '/submit' for direct HTTP delivery.
    """
    if mailbox_enabled():
        return None
    host = os.getenv("AGENT_ENDPOINT_HOST", "127.0.0.1").strip() or "127.0.0.1"
    return f"http://{host}:{port}/submit"


def api_only_registration_policy() -> AlmanacApiRegistrationPolicy:
    """
    Use Almanac API registration only.
    This avoids on-chain Almanac contract registration/funding warnings.
    """
    return AlmanacApiRegistrationPolicy()
