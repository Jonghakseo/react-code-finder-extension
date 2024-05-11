import React, { Suspense, useEffect, useState } from 'react';
import '@pages/panel/Panel.css';
import useStorage from '@src/shared/hooks/useStorage';
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
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { openIDE } from '@src/shared/cli/openIDE';
import { getSource } from '@src/shared/cli/getSource';
import { editSource } from '@src/shared/cli/editSource';
import { currentDebugSourceStorage } from '@src/shared/storages/currentDebugSourceStorage';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ClipboardCopy from '@pages/panel/components/ClipboardCopy';
import usePingDevTools from '@pages/panel/hooks/usePingDevTools';
import getSourceTitle from '@pages/panel/debugSource/getSourceTitle';
import FocusedSourceInfo from '@pages/panel/components/FocusedSourceInfo';
import useKeyDownEffect, { withMeta } from '@pages/panel/hooks/useKeyDownEffect';
import MonacoEditor from '@pages/panel/components/MonacoEditor';
import useHandleNetworkError from '@pages/panel/hooks/useHandleNetworkError';

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

  const openEditor = withHandleNetworkError(async () => {
    if (!currentDebugSourceWithSourceCode) {
      return;
    }
    await openIDE(portNumber, currentDebugSourceWithSourceCode);
  });

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
    }, 300);

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
        <MonacoEditor
          saveSourceCode={saveSourceCode}
          initialValue={currentDebugSourceWithSourceCode?.sourceCode}
          currentDebugSourceWithSourceCode={currentDebugSourceWithSourceCode}
        />
      </Grid>
    </Grid>
  );
};

export default withErrorBoundary(withSuspense(Panel, <div> Loading ... </div>), <div> Error Occur </div>);
