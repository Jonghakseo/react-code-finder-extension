// Mock Type
export type Fiber = {
  stateNode?: HTMLElement;
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: Function | string;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  _debugSource: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
  _debugOwner: Fiber | null;
};

export type Root = {
  current: Fiber;
};

export type DebugSource = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
};

export type DebugSourceWithSourceCode = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  sourceCode: string;
};

export type MessageFromInjected =
  | {
      type: 'setCurrentDebugSources';
      data: string;
    }
  | {
      type: 'setTempDebugSource';
      data: string;
    }
  | {
      type: 'getCurrentState';
      data?: never;
    };

export type PostMessageToOutside = (msg: MessageFromInjected) => void;
