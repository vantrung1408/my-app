import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface } from 'ethers/lib/utils';

type Callback = {
  event: string;
  callback: (...args) => void;
};
type Listener = {
  contract: Contract;
  callbacks: Callback[];
};

export class ContractEventListener {
  private static instance: ContractEventListener;
  static get Instance(): ContractEventListener {
    if (!ContractEventListener.instance) {
      ContractEventListener.instance = new ContractEventListener();
    }
    return ContractEventListener.instance;
  }
  get initialized(): boolean {
    return !!this.provider;
  }

  handlers: { [key: string]: Listener } = {};
  provider: JsonRpcProvider;

  init(rpc: string) {
    if (!rpc) {
      return;
    }
    if (this.provider && this.handlers) {
      for (const id in this.handlers) {
        this.removeListeners(id);
      }
      this.handlers = {};
    }
    this.provider = new JsonRpcProvider(rpc);
  }

  register(id: string, address: string, abi: Interface, callbacks: Callback[]) {
    if (!this.initialized) {
      return;
    }
    if (this.handlers[id]) {
      this.removeListeners(id);
    }
    const contract = new Contract(address, abi, this.provider);
    callbacks.forEach(({ callback, event }) => {
      contract.on(event, callback);
    });
    this.handlers[id] = {
      contract: contract,
      callbacks: callbacks,
    };
  }

  removeListeners(id: string) {
    if (!this.initialized) {
      return;
    }
    if (!this.handlers[id]) {
      return;
    }
    const { callbacks, contract } = this.handlers[id];
    callbacks.forEach(({ callback, event }) => {
      contract.off(event, callback);
    });
    delete this.handlers[id];
  }

  destroy() {
    if (!this.initialized) {
      return;
    }
    for (const id in this.handlers) {
      this.removeListeners(id);
    }
    this.handlers = {};
    this.provider = undefined;
  }
}
