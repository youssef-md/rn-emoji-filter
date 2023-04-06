import { View } from 'react-native';
import { styles } from './styles';
import { Camera, CameraType } from 'expo-camera';
import { useEffect } from 'react';

export function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    requestPermission()
  }, [])

  if (!permission?.granted) {
    return;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={CameraType.front} />
    </View>
  );
}
