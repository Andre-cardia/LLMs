export class AccessDeniedError extends Error { constructor(){super('FORBIDDEN');this.name='AccessDeniedError';this.code='FORBIDDEN';} }
