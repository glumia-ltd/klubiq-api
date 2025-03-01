
export enum Priority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent',
}

export enum TransactionType {
    REVENUE = 'Revenue',
    EXPENSE = 'Expense',
}

export enum RevenueType {
    PROPERTY_SALES = 'Property Sales',
    PROPERTY_RENTAL = 'Property Rental',
}

export enum ExpenseType {
    PROPERTY_TAX = 'Property Tax',
}

export enum PaymentFrequency {
    WEEKLY = 'Weekly',
    BI_WEEKLY = 'Bi-Weekly',
    MONTHLY = 'Monthly',
    ANNUALLY = 'Annually',
    ONE_TIME = 'One-Time',
    BI_MONTHLY = 'Bi-Monthly',
    QUARTERLY = 'Quarterly',
    CUSTOM = 'Custom',
}

export enum MaintenanceStatus {
    NEW = 'New',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    ON_HOLD = 'On Hold',
}

export enum LeaseStatus {
    ACTIVE = 'Active',
    CANCELLED = 'Cancelled',
    EXPIRED = 'Expired',
    EXPIRING = 'Expiring',
    TERMINATED = 'Terminated',
    INACTIVE = 'Inactive',
}

export enum MaintenancePriority {
    LOW = Priority.LOW,
    MEDIUM = Priority.MEDIUM,
    HIGH = Priority.HIGH,
    URGENT = Priority.URGENT,
}

export enum MaintenanceType {
    MAINTENANCE = 'Maintenance',
    SERVICE = 'Service',
    INSPECTION = 'Inspection',
    OTHER = 'Other',
}




export enum UnitStatus {
    OCCUPIED = 'Occupied',
    VACANT = 'Vacant',
}

export enum PaymentStatus {
    PENDING = 'Pending',
    PAID = 'Paid',
    UNPAID = 'Unpaid',
    OVERDUE = 'Overdue',
    PARTIAL = 'Partial',
    FAILED = 'Failed',
    CANCELLED = 'Cancelled',
    REFUNDED = 'Refunded',
    OTHER = 'Other',
}



export enum NotificationPriority {
    LOW = Priority.LOW,
    MEDIUM = Priority.MEDIUM,
    HIGH = Priority.HIGH,
    URGENT = Priority.URGENT,
}
export enum NotificationPeriod {
    Today = 'Today',
    Yesterday = 'Yesterday',
    Last7Days = 'Last 7 days',
    Last30Days = 'Last 30 days',
    Older = 'Older',
}


