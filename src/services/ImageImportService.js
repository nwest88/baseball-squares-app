import { getFunctions, httpsCallable } from 'firebase/functions';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Initialize Functions
const functions = getFunctions();

export const pickAndProcessImage = async () => {
  // 1. Permission Check
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Sorry, we need camera roll permissions to make this happen!');
    return null;
  }

  // 2. Pick the Image
  let result = await ImagePicker.launchImageLibraryAsync({
    // FIX: Updated from MediaTypeOptions to MediaType (Expo 50+ change)
    mediaTypes: ImagePicker.MediaType.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) return null;

  const originalUri = result.assets[0].uri;

  // 3. Compress (The Skateboard Trick)
  // Resize to 800px width. Big enough for AI, small enough for fast upload.
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    originalUri,
    [{ resize: { width: 800 } }], 
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  // 4. Send to Cloud
  try {
    const parseGridFunction = httpsCallable(functions, 'parseGridImage');
    const response = await parseGridFunction({ 
      imageBase64: manipulatedImage.base64 
    });
    
    return response.data; 

  } catch (error) {
    // This will now be caught by the "Loud" error handler in PlayerManager
    throw error;
  }
};