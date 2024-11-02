import React, { Suspense, useEffect, useState } from 'react';
import '@src/Panel.css';
import {
  Badge,
  Code,
  Flex,
  Grid,
  Heading,
  HStack,
  Kbd,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react';
import {
  currentDebugSourceStorage,
  DebugSource,
  DebugSourceWithSourceCode,
  editSource,
  getSource,
  openIDE,
  useStorage,
  withErrorBoundary,
  withSuspense,
  getSourcePath,
} from '@chrome-extension-boilerplate/shared';
import useHandleNetworkError from '@src/hooks/useHandleNetworkError';
import usePingDevTools from '@src/hooks/usePingDevTools';
import useKeyDownEffect, { withMeta } from '@src/hooks/useKeyDownEffect';
import ClipboardCopy from '@src/components/ClipboardCopy';
import SourceCodeEditor from '@src/components/SourceCodeEditor';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import getSourceTitle from '@src/debugSource/getSourceTitle';
import FocusedSourceInfo from '@src/components/FocusedSourceInfo';
import PropsViewer from '@src/components/PropsViewer';

const Panel = () => {
  const currentDebugSources = useStorage(currentDebugSourceStorage);
  const [currentDebugSourcesIndex, setCurrentDebugSourcesIndex] = useState<number>(0);
  const [currentDebugSourceWithSourceCode, setCurrentDebugSourceWithSourceCode] =
    useState<DebugSourceWithSourceCode | null>(null);
  const [portNumber, setPortNumber] = useState(3010);
  const toast = useToast();
  const { networkError, withHandleNetworkError } = useHandleNetworkError();

  // Ping devToolsStorage to keep the devTools open
  usePingDevTools();

  useKeyDownEffect(withMeta('k'), () => openEditor(), []);

  const fetchSourceCode = withHandleNetworkError(async (port: number, debugSource: DebugSource) => {
    const res = await getSource(port, debugSource.fileName);
    const { source } = await res.json();
    setCurrentDebugSourceWithSourceCode({ ...debugSource, sourceCode: source });
  });

  const openEditor = withHandleNetworkError(
    async () => {
      if (!currentDebugSourceWithSourceCode) {
        throw new Error('No source code to show');
      }
      await openIDE(portNumber, currentDebugSourceWithSourceCode);
    },
    () => {
      const debugSource = currentDebugSources.at(currentDebugSourcesIndex);
      if (debugSource) {
        const sourcePath = getSourcePath(debugSource);
        window.open(sourcePath, '_self');
      }
    },
  );

  const saveSourceCode = withHandleNetworkError(async (fileName: string, sourceCode: string) => {
    await editSource(portNumber, fileName, sourceCode);
    toast({ title: 'Saved!', duration: 1500, position: 'top-right' });
  });

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
    if (!networkError) {
      return;
    }
    const currentSource = currentDebugSources.at(currentDebugSourcesIndex);
    if (!currentSource) {
      return;
    }
    const intervalId = setInterval(() => {
      void fetchSourceCode(portNumber, currentSource);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [networkError, portNumber, currentDebugSourcesIndex]);

  return (
    <Grid className="App" gap={2}>
      <Flex alignItems="center" gap={2}>
        <ClipboardCopy>
          <Code colorScheme="yellow">{`npx react-code-finder-server -p ${portNumber}`}</Code>
        </ClipboardCopy>
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
            <Kbd>Window</Kbd> or <Kbd>CMD</Kbd> + <Kbd>s</Kbd>
          </Flex>
          <Flex gap="4px" h="18px" alignItems="end">
            <Text fontWeight="bold">OPEN:</Text>
            <Kbd>Window</Kbd> or <Kbd>CMD</Kbd> + <Kbd>k</Kbd>
          </Flex>
        </HStack>
        <SourceCodeEditor
          disabled={!!networkError}
          saveSourceCode={saveSourceCode}
          initialValue={currentDebugSourceWithSourceCode?.sourceCode}
          currentDebugSourceWithSourceCode={currentDebugSourceWithSourceCode}
        />
        <PropsViewer currentDebugSourceWithSourceCodeProps={currentDebugSources.at(currentDebugSourcesIndex)?.props} />
      </Grid>
    </Grid>
  );
};

export default withErrorBoundary(withSuspense(Panel, <div> Loading ... </div>), <div> Error Occur </div>);
