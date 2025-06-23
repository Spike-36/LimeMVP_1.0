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

        {showInfoIcon && showImage && !showEnglish && (
          <TouchableOpacity style={styles.langBadge} onPress={onToggleEnglish}>
            <Text style={styles.langBadgeText}>EN</Text>
          </TouchableOpacity>
        )}

        {showEnglish && (
          <View style={styles.englishOverlay}>
            <View style={styles.englishBackground}>
              <Text style={styles.englishText}>{block?.english}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.textSection}>
        {!hidePhonetic && <Text style={styles.phonetic}>{block?.phonetic}</Text>}
        {!hideThaiText && (
          <TouchableOpacity onPress={onPlayAudio}>
            <Text style={styles.foreign}>{block?.foreign}</Text>
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
  langBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // subtle dark background
    borderColor: '#555',
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  englishOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  englishBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  englishText: {
    color: 'white',
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
    paddingTop: 60,
  },
  foreign: {
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
    marginTop: 10,
  },
  phonetic: {
    color: '#FFD700',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 16,
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
