export class AccessDeniedError extends Error { constructor(){super('FORBIDDEN');this.name='AccessDeniedError';this.code='FORBIDDEN';} }
// 404/410 de slice (AD-27): a revisão lida no manifesto saiu das legíveis; a raiz faz um único refresh.
export class RevisionSupersededError extends Error { constructor(){super('REVISION_SUPERSEDED');this.name='RevisionSupersededError';this.code='REVISION_SUPERSEDED';} }
