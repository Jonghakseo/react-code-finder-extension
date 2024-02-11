import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import '@pages/sidepanel/SidePanel.css';
import useStorage from '@src/shared/hooks/useStorage';
import {
  Code,
  Flex,
  FormLabel,
  Grid,
  Heading,
  Link,
  NumberInput,
  NumberInputField,
  Text,
  Kbd,
  Badge,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
} from '@chakra-ui/react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { openIDE } from '@src/shared/cli/openIDE';
import { getSource } from '@src/shared/cli/getSource';
import { editSource } from '@src/shared/cli/editSource';
import { currentDebugSourceStorage } from '@src/shared/storages/currentDebugSourceStorage';
import { tempDebugSourceStorage } from '@src/shared/storages/tempDebugSourceStorage';

const SidePanel = () => {
  const monacoEl = useRef(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const currentDebugSource = useStorage(currentDebugSourceStorage);
  const [currentDebugSourceWithSourceCode, setCurrentDebugSourceWithSourceCode] =
    useState<DebugSourceWithSourceCode | null>(null);
  const tempDebugSource = useStorage(tempDebugSourceStorage);
  const [portNumber, setPortNumber] = useState(3010);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetchSourceCode(port: number, debugSource: DebugSource) {
    try {
      const res = await getSource(port, debugSource.fileName);
      const { source } = await res.json();
      setCurrentDebugSourceWithSourceCode({
        ...debugSource,
        sourceCode: source,
      });
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      }
    }
  }

  const saveSourceCode = async (port: number, fileName: string) => {
    if (!currentDebugSourceWithSourceCode) {
      return;
    }
    const source = editorRef.current?.getValue();
    if (source) {
      try {
        await editSource(port, fileName, source);
        setError(null);
        setIsSaved(true);
        setTimeout(() => {
          setIsSaved(false);
        }, 1000);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
      }
    }
  };

  useEffect(() => {
    if (!currentDebugSource) {
      return;
    }
    void fetchSourceCode(portNumber, currentDebugSource);
    const id = setInterval(() => {
      void fetchSourceCode(portNumber, currentDebugSource);
    }, 2000);

    return () => {
      clearInterval(id);
    };
  }, [portNumber, currentDebugSource?.fileName, currentDebugSource?.lineNumber]);

  useEffect(() => {
    if (!monacoEl.current) {
      return;
    }
    editorRef.current = monaco.editor.create(monacoEl.current!, {
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
      editorRef.current?.setSelection({
        startLineNumber: currentDebugSourceWithSourceCode.lineNumber || 1,
        startColumn: 0,
        endLineNumber: currentDebugSourceWithSourceCode.lineNumber || 1,
        endColumn: 999,
      });
      editorRef.current.revealPositionInCenter({
        lineNumber: currentDebugSourceWithSourceCode.lineNumber || 1,
        column: currentDebugSourceWithSourceCode.columnNumber || 1,
      });
    }
  }, [currentDebugSourceWithSourceCode?.fileName]);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if (!currentDebugSourceWithSourceCode) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveSourceCode(portNumber, currentDebugSourceWithSourceCode.fileName);
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => {
      window.removeEventListener('keydown', handleSave);
    };
  }, [portNumber, currentDebugSourceWithSourceCode?.fileName]);

  const openEditor = async () => {
    if (!currentDebugSourceWithSourceCode) {
      return;
    }
    try {
      await openIDE(portNumber, currentDebugSourceWithSourceCode);
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      }
    }
  };

  return (
    <Grid className="App" gap={2}>
      <Badge width={'fit-content'} colorScheme={error ? 'red' : 'blue'}>
        {error ? error.message : 'connected'}
      </Badge>
      <Flex alignItems="center" gap={2}>
        <Code colorScheme="yellow">{`npx react-code-finder-server -p ${portNumber}`}</Code>
        <Text>port</Text>
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
      </Flex>

      <FormLabel>
        Next target is... <Code>{getSourceTitle(tempDebugSource)}</Code>
      </FormLabel>

      <Grid gap={2}>
        <Link onClick={openEditor} isExternal>
          <Heading size="md">
            {getSourceTitle(currentDebugSourceWithSourceCode)} <ExternalLinkIcon ml={2} />
          </Heading>
        </Link>
        <Flex gap="4px" h="18px" alignItems="end">
          <Kbd>CMD</Kbd> or <Kbd>CMD</Kbd> + <Kbd>S</Kbd>
          {isSaved && (
            <Badge ml={1} colorScheme="blue" variant="solid" fontSize="12px">
              saved!
            </Badge>
          )}
        </Flex>
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

function getSourceTitle(debugSource: DebugSource | null) {
  if (!debugSource) {
    return '';
  }
  const fileName = debugSource.fileName.split('/').at(-1);
  const parentFolder = debugSource.fileName.split('/').at(-2);
  const lineNumber = debugSource.lineNumber;
  return `${parentFolder ? parentFolder + '/' : ''}${fileName} L:${lineNumber}`;
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
