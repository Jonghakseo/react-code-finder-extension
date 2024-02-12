import React, { Suspense, useEffect, useRef, useState } from 'react';
import { editor } from 'monaco-editor';
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
  Kbd,
  Badge,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  Select,
  HStack,
  Text,
} from '@chakra-ui/react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { openIDE } from '@src/shared/cli/openIDE';
import { getSource } from '@src/shared/cli/getSource';
import { editSource } from '@src/shared/cli/editSource';
import { currentDebugSourceStorage } from '@src/shared/storages/currentDebugSourceStorage';
import { tempDebugSourceStorage } from '@src/shared/storages/tempDebugSourceStorage';
import { ExternalLinkIcon } from '@chakra-ui/icons';

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

const SidePanel = () => {
  const monacoEl = useRef(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const currentDebugSources = useStorage(currentDebugSourceStorage) ?? [];
  const [currentDebugSourcesIndex, setCurrentDebugSourcesIndex] = useState<number>(0);
  const [currentDebugSourceWithSourceCode, setCurrentDebugSourceWithSourceCode] =
    useState<DebugSourceWithSourceCode | null>(null);
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
    if (!monacoEl.current) {
      return;
    }
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
  }, [currentDebugSourceWithSourceCode]);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if (!currentDebugSourceWithSourceCode) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void saveSourceCode(portNumber, currentDebugSourceWithSourceCode.fileName);
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => {
      window.removeEventListener('keydown', handleSave);
    };
  }, [portNumber, currentDebugSourceWithSourceCode?.fileName]);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if (!currentDebugSourceWithSourceCode) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        void openEditor();
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
        <Badge width={'fit-content'} colorScheme={error ? 'red' : 'blue'}>
          {error ? error.message : 'connected'}
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
        <Flex gap="4px" h="18px" alignItems="end">
          <Text fontWeight="bold">SAVE:</Text>
          <Kbd>CMD</Kbd> or <Kbd>CMD</Kbd> + <Kbd>S</Kbd>
          {isSaved && (
            <Badge ml={1} colorScheme="blue" variant="solid" fontSize="12px">
              saved!
            </Badge>
          )}
        </Flex>
        <Flex gap="4px" h="18px" alignItems="end">
          <Text fontWeight="bold">OPEN:</Text>
          <Kbd>CMD</Kbd> or <Kbd>CMD</Kbd> + <Kbd>O</Kbd>
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

function FocusedSourceInfo() {
  const tempDebugSource = useStorage(tempDebugSourceStorage);
  return (
    <FormLabel>
      Focused on... <br />
      <Code>{getSourceTitle(tempDebugSource)}</Code>
    </FormLabel>
  );
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
