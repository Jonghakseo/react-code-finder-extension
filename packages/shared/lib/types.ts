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
  pendingProps?: Record<string, unknown>;
};

export type Root = {
  current: Fiber;
};

export type DebugSource = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  props: Record<string, unknown>;
};

export type DebugSourceWithSourceCode = DebugSource & {
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
