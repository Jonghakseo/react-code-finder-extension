import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { editor } from 'monaco-editor';
import '@pages/sidepanel/SidePanel.css';
import useStorage from '@src/shared/hooks/useStorage';
import {
  Code,
  Flex,
  Grid,
  Heading,
  Link,
  NumberInput,
  NumberInputField,
  Kbd,
  Badge,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  Select,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { openIDE } from '@src/shared/cli/openIDE';
import { getSource } from '@src/shared/cli/getSource';
import { editSource } from '@src/shared/cli/editSource';
import { currentDebugSourceStorage } from '@src/shared/storages/currentDebugSourceStorage';
import { tempDebugSourceStorage } from '@src/shared/storages/tempDebugSourceStorage';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const SidePanel = () => {
  const monacoEl = useRef(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const currentDebugSources = useStorage(currentDebugSourceStorage);
  const [currentDebugSourcesIndex, setCurrentDebugSourcesIndex] = useState<number>(0);
  const [currentDebugSourceWithSourceCode, setCurrentDebugSourceWithSourceCode] =
    useState<DebugSourceWithSourceCode | null>(null);
  const [portNumber, setPortNumber] = useState(3010);
  const toast = useToast();
  const [networkError, setNetworkError] = useState<Error | null>(null);

  async function fetchSourceCode(port: number, debugSource: DebugSource) {
    try {
      const res = await getSource(port, debugSource.fileName);
      const { source } = await res.json();
      setCurrentDebugSourceWithSourceCode({ ...debugSource, sourceCode: source });
      setNetworkError(null);
    } catch (e) {
      if (e instanceof Error) {
        setNetworkError(e);
      }
    }
  }

  const saveSourceCode = useCallback(async () => {
    if (!currentDebugSourceWithSourceCode) {
      return;
    }
    const source = editorRef.current?.getValue();
    if (source) {
      try {
        await editSource(portNumber, currentDebugSourceWithSourceCode.fileName, source);
        setNetworkError(null);
        toast({ title: 'Saved!', duration: 1500, position: 'top-right' });
      } catch (e) {
        if (e instanceof Error) {
          setNetworkError(e);
        }
      }
    }
  }, [currentDebugSourceWithSourceCode, portNumber, toast]);

  const openEditor = useCallback(async () => {
    if (!currentDebugSourceWithSourceCode) {
      return;
    }
    try {
      await openIDE(portNumber, currentDebugSourceWithSourceCode);
      setNetworkError(null);
    } catch (e) {
      if (e instanceof Error) {
        setNetworkError(e);
      }
    }
  }, [portNumber, currentDebugSourceWithSourceCode]);

  useKeyDownEffect(withCtrl('s'), saveSourceCode, [saveSourceCode]);
  useKeyDownEffect(withCtrl('o'), openEditor, [openEditor]);

  useEffect(() => {
    const firstSource = currentDebugSources.at(0);
    if (!firstSource) {
      return;
    }
    void fetchSourceCode(portNumber, firstSource);
    setCurrentDebugSourcesIndex(0);
  }, [currentDebugSources]);

  useEffect(() => {
    const currentSource = currentDebugSources.at(currentDebugSourcesIndex);
    if (!currentSource) {
      return;
    }
    void fetchSourceCode(portNumber, currentSource);
  }, [portNumber, currentDebugSourcesIndex]);

  useEffect(() => {
    editorRef.current = editor.create(monacoEl.current!, {
      value: currentDebugSourceWithSourceCode?.sourceCode,
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
    });

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && currentDebugSourceWithSourceCode) {
      editorRef.current.setValue(currentDebugSourceWithSourceCode.sourceCode);
      editorRef.current.setSelection({
        startLineNumber: currentDebugSourceWithSourceCode.lineNumber,
        endLineNumber: currentDebugSourceWithSourceCode.lineNumber,
        startColumn: 0,
        endColumn: 999,
      });
      editorRef.current.revealPositionInCenter({
        lineNumber: currentDebugSourceWithSourceCode.lineNumber,
        column: currentDebugSourceWithSourceCode.columnNumber,
      });
    }
  }, [currentDebugSourceWithSourceCode]);

  return (
    <Grid className="App" gap={2}>
      <Flex alignItems="center" gap={2}>
        <Code colorScheme="yellow">{`npx react-code-finder-server -p ${portNumber}`}</Code>
        <NumberInput
          size="sm"
          width={'100px'}
          value={portNumber}
          onChange={valueString => {
            setPortNumber(Number(valueString));
          }}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Badge width={'fit-content'} colorScheme={networkError ? 'red' : 'blue'}>
          {networkError ? networkError.message : 'connected'}
        </Badge>
      </Flex>

      <Suspense>
        <FocusedSourceInfo />
      </Suspense>
      <Grid gap={2}>
        <HStack gap={2}>
          <Select size="md" onChange={event => setCurrentDebugSourcesIndex(Number(event.currentTarget.value))}>
            {currentDebugSources.map((source, index) => (
              <option key={source.fileName} value={index} selected={currentDebugSourcesIndex === index}>
                {getSourceTitle(source)}
              </option>
            ))}
          </Select>
          <Link onClick={openEditor} isExternal>
            <Heading size="md">
              <ExternalLinkIcon ml={2} mr={4} />
            </Heading>
          </Link>
        </HStack>
        <HStack>
          <Flex gap="4px" h="18px" alignItems="end">
            <Text fontWeight="bold">SAVE:</Text>
            <Kbd>CMD</Kbd> or <Kbd>CMD</Kbd> + <Kbd>S</Kbd>
          </Flex>
          <Flex gap="4px" h="18px" alignItems="end">
            <Text fontWeight="bold">OPEN:</Text>
            <Kbd>CMD</Kbd> or <Kbd>CMD</Kbd> + <Kbd>O</Kbd>
          </Flex>
        </HStack>
        <div
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
          }}
          ref={monacoEl}
        />
      </Grid>
    </Grid>
  );
};

function FocusedSourceInfo() {
  const tempDebugSource = useStorage(tempDebugSourceStorage);
  return <Text>{getSourceTitle(tempDebugSource)}</Text>;
}

function useKeyDownEffect(checkKey: (event: KeyboardEvent) => boolean, callback: () => unknown, deps: unknown[]) {
  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if (checkKey(e)) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => {
      window.removeEventListener('keydown', handleSave);
    };
  }, deps);
}

function withCtrl(key: string) {
  return (e: KeyboardEvent): boolean => (e.metaKey || e.ctrlKey) && e.key === key;
}

function getSourceTitle(debugSource: DebugSource | null) {
  if (!debugSource) {
    return '';
  }
  const fileName = String(debugSource.fileName.split('/').at(-1));
  const parentFolder = debugSource.fileName.split('/').at(-2);
  const lineNumber = debugSource.lineNumber;
  if (fileName.length < 30) {
    return `${parentFolder ? parentFolder + '/' : ''}${fileName} L:${lineNumber}`;
  }
  return `${fileName} L:${lineNumber}`;
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
