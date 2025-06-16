import { Entypo, FontAwesome } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export default function WordRecordLayout({
  block,
  imageAsset,
  showImage = true,
  onPlayAudio,
  onToggleEnglish,
  onShowTip,
  showTipIcon = true,
  showInfoIcon = true,
  showEnglish = false,
  hideThaiText = false,
  hidePhonetic = false,
  hideAudioButton = false,
  bottomContent,
}) {
  return (
    <View style={styles.container}>
      <View
        style={[styles.imageContainer, !showImage && { height: screenHeight * 0.478 }]}
      >
        {showImage && imageAsset && (
          <Image source={imageAsset} style={styles.image} resizeMode="cover" />
        )}

        {showInfoIcon && showImage && (
          <TouchableOpacity style={styles.infoIconFloating} onPress={onToggleEnglish}>
            <Entypo name="info-with-circle" size={26} color="white" />
          </TouchableOpacity>
        )}

        {showTipIcon && showImage && (
          <TouchableOpacity style={styles.tipIconFloating} onPress={onShowTip}>
            <Entypo name="light-bulb" size={26} color="white" />
          </TouchableOpacity>
        )}

        {showEnglish && (
          <View style={styles.englishOverlay}>
            <Text style={styles.englishText}>{block?.english}</Text>
          </View>
        )}
      </View>

      <View style={styles.textSection}>
        {!hideThaiText && <Text style={styles.foreign}>{block?.foreign}</Text>}
        {!hidePhonetic && <Text style={styles.phonetic}>{block?.phonetic}</Text>}
        {!hideAudioButton && (
          <TouchableOpacity style={styles.audioButton} onPress={onPlayAudio}>
            <FontAwesome name="volume-up" size={28} color="black" />
          </TouchableOpacity>
        )}
        {bottomContent && <View style={styles.bottomArea}>{bottomContent}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    height: screenHeight * 0.5,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  tipIconFloating: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  infoIconFloating: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  englishOverlay: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    transform: [{ translateY: -15 }],
    alignItems: 'center',
  },
  englishText: {
    color: '#BFFF00',
    fontSize: 26,
    fontWeight: '600',
    textShadowColor: 'black',
    textShadowRadius: 4,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  foreign: {
    color: 'white',
    fontSize: 36,
    textAlign: 'center',
  },
  phonetic: {
    color: '#FFD700',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 6,
  },
  audioButton: {
    backgroundColor: '#FFD700',
    borderRadius: 50,
    padding: 16,
    marginTop: 20,
  },
  bottomArea: {
    marginTop: 30,
    alignItems: 'center',
  },
});
