declare module 'virtual:reload-on-update-in-background-script' {
  export const reloadOnUpdate: (watchPath: string) => void;
  export default reloadOnUpdate;
}

declare module 'virtual:reload-on-update-in-view' {
  const refreshOnUpdate: (watchPath: string) => void;
  export default refreshOnUpdate;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: string;
  export default content;
}

// Mock Type
declare type Fiber = {
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

declare type Root = {
  current: Fiber;
};

declare type DebugSource = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
};

declare type DebugSourceWithSourceCode = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  sourceCode: string;
};

declare type MessageFromInjected =
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

declare type PostMessageToOutside = (msg: MessageFromInjected) => void;
