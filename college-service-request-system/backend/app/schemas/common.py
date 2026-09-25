from enum import Enum


class Role(str, Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    SERVICE_STAFF = "SERVICE_STAFF"
    SERVICE_LEAD = "SERVICE_LEAD"
    ADMIN = "ADMIN"


class ServiceCategory(str, Enum):
    BONAFIDE_CERTIFICATE = "BONAFIDE_CERTIFICATE"
    ID_CARD = "ID_CARD"
    HOSTEL = "HOSTEL"
    TRANSPORT = "TRANSPORT"
    LIBRARY = "LIBRARY"
    IT_SUPPORT = "IT_SUPPORT"


CATEGORY_LABELS = {
    ServiceCategory.BONAFIDE_CERTIFICATE: "Bonafide Certificate",
    ServiceCategory.ID_CARD: "ID Card",
    ServiceCategory.HOSTEL: "Hostel",
    ServiceCategory.TRANSPORT: "Transport",
    ServiceCategory.LIBRARY: "Library",
    ServiceCategory.IT_SUPPORT: "IT Support",
}


class RequestStatus(str, Enum):
    NEW = "NEW"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REOPENED = "REOPENED"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SlaStatus(str, Enum):
    WITHIN_SLA = "WITHIN_SLA"
    APPROACHING_SLA = "APPROACHING_SLA"
    SLA_BREACHED = "SLA_BREACHED"


# Allowed forward status transitions (business rule, not AI)
ALLOWED_TRANSITIONS = {
    RequestStatus.NEW: [RequestStatus.ASSIGNED],
    RequestStatus.ASSIGNED: [RequestStatus.IN_PROGRESS],
    RequestStatus.IN_PROGRESS: [RequestStatus.ON_HOLD, RequestStatus.RESOLVED],
    RequestStatus.ON_HOLD: [RequestStatus.IN_PROGRESS],
    RequestStatus.RESOLVED: [RequestStatus.CLOSED, RequestStatus.REOPENED],
    RequestStatus.REOPENED: [RequestStatus.IN_PROGRESS],
    RequestStatus.CLOSED: [],
}
