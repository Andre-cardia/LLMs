import { requireSynchronous } from '../contracts/primitives.mjs';
import { clone } from '../contracts/primitives.mjs';
// Porta transacional síncrona. Prova local; não representa um banco durável.
export class MemoryControl {
  #state;
  #active = false;
  constructor(initial = {}) { this.#state = clone(initial); }
  read() { return clone(this.#state); }
  transact(work) {
    if (this.#active) throw new Error('TRANSACTION_REENTRANT');
    this.#active = true;
    try {
      const draft = clone(this.#state);
      const result = work(draft);
      requireSynchronous(result,'TRANSACTION_MUST_BE_SYNCHRONOUS');
      const output = clone(result);
      this.#state = clone(draft);
      return output;
    } finally { this.#active = false; }
  }
}
