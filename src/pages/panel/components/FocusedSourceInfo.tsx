import useStorage from '@src/shared/hooks/useStorage';
import { tempDebugSourceStorage } from '@src/shared/storages/tempDebugSourceStorage';
import { Text } from '@chakra-ui/react';
import getSourceTitle from '@pages/panel/debugSource/getSourceTitle';

export default function FocusedSourceInfo() {
  const tempDebugSource = useStorage(tempDebugSourceStorage);
  return <Text>{getSourceTitle(tempDebugSource)}</Text>;
}
