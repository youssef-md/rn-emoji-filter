import { useEffect, useState } from 'react';
import { ImageSourcePropType, View } from 'react-native';

import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'

import { styles } from './styles';
import neutralEmoji from '../assets/neutral.png';
import smilingEmoji from '../assets/smiling.png';
import smilingHardEmoji from '../assets/smiling-hard.png';
import winkingEmoji from '../assets/winking.png';

export function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralEmoji);

  const faceValues = useSharedValue({ width: 0, height: 0, x: 0, y: 0 });

  function handleFaceDetection({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;
    const hasFace = !!face;

    setFaceDetected(hasFace);
    if (!hasFace) return;

    const { size: { width, height }, origin: { x, y } } = face.bounds;
    faceValues.value = {
      width, height,
      x, y
    }

    const isSmiling = face.smilingProbability > 0.5;
    const isLeftEyeClosed = face.leftEyeOpenProbability < 0.5;
    const isRightEyeClosed = face.rightEyeOpenProbability < 0.5;
    const isRightEyeOpen = face.rightEyeOpenProbability > 0.5;
    const isWinking = isLeftEyeClosed && isRightEyeOpen;
    const isAnyEyesClosed = isLeftEyeClosed || isRightEyeClosed;

    if (isSmiling && !isAnyEyesClosed) {
      setEmoji(smilingHardEmoji);
    }
    else if (isWinking) {
      setEmoji(winkingEmoji);
    } else {
      setEmoji(neutralEmoji);
    }

  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
  }))

  useEffect(() => {
    requestPermission()
  }, [])

  if (!permission?.granted) {
    return;
  }

  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image style={animatedStyle} source={emoji} />}
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFaceDetection}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
