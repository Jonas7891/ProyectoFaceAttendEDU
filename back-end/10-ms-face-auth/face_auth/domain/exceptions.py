class DuplicateUserError(Exception):
    """Raised when a username is already owned by another record."""


class PersistenceError(Exception):
    """Raised when a persistence operation cannot be completed."""


class BiometricNotFoundError(ValueError):
    """Raised when the subject or template does not exist."""


class TemplateRevokedError(PermissionError):
    """Raised when operating on a revoked template."""


class LivenessFailedError(PermissionError):
    """Raised when liveness cannot be proven."""


class BiometricNotRecognizedError(PermissionError):
    """Raised when 1:1 / 1:N matching fails."""