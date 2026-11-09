"""Kept for the routers that still import it from here; the auditing lives in `application`."""
from application.match_audit import record_match

__all__ = ["record_match"]
