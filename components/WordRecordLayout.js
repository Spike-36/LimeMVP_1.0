import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StageAdvanceButton from './StageAdvanceButton';

const { height: screenHeight } = Dimensions.get('window');

export default function WordRecordLayout({
  block,
  imageAsset,
  showImage = true,
  onPlayAudio,
  onToggleEnglish,
  onShowTip,
  onPressFind,
  stars = null,
  showTipIcon = true,
  showInfoIcon = true,
  showEnglish = false,
  hideThaiText = false,
  hideAudioButton = false,
  topContent,
  bottomContent,
  showAnswer = true,
  stage,
  wordId,
  onAdvanceStage = () => {},
  showSlowAudioIcon = false,
  onSlowAudioPress,
  targetLang,
}) {
  const resolvedText = block?.[targetLang];
  const resolvedPhonetic = block?.[`${targetLang}Phonetic`];

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, !showImage && { height: screenHeight * 0.478 }]}>
        {showImage && (
          imageAsset ? (
            <Image source={imageAsset} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.fallback]}>
              <Text style={styles.fallbackText}>Image not found</Text>
            </View>
          )
        )}

        {stars && <View style={styles.starRow}>{stars}</View>}

        {showSlowAudioIcon && (
          <TouchableOpacity style={styles.slowAudioIcon} onPress={onSlowAudioPress}>
            <FontAwesome name="volume-down" size={24} color="#ccc" />
          </TouchableOpacity>
        )}

        {onPressFind && (
          <TouchableOpacity style={styles.findButton} onPress={onPressFind}>
            <Ionicons name="search" size={25} color="#aaa" />
          </TouchableOpacity>
        )}

        {(block?.showIndex === '1' || showEnglish) && (
          <View style={styles.englishOverlay}>
            <View style={styles.englishBackground}>
              <Text style={styles.englishText}>{block.english}</Text>
            </View>
          </View>
        )}

        {showInfoIcon && (
          <TouchableOpacity style={styles.langBadge} onPress={onToggleEnglish}>
            <Text style={styles.langBadgeText}>EN</Text>
          </TouchableOpacity>
        )}

        {typeof stage === 'number' && stage < 4 && wordId && (
          <StageAdvanceButton
            wordId={wordId}
            currentStage={stage}
            onStageChange={onAdvanceStage}
            skipLearn={true}
          />
        )}
      </View>

      <View style={styles.textSection} pointerEvents="auto">
        {resolvedText && !hideThaiText && (
          <Text style={styles.foreign}>{resolvedText}</Text>
        )}

        {resolvedPhonetic && (
          <Text style={styles.phonetic}>{resolvedPhonetic}</Text>
        )}

        {topContent}
        {bottomContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: screenHeight * 0.478,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  fallbackText: {
    color: '#888',
    fontSize: 16,
  },
  starRow: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  slowAudioIcon: {
    position: 'absolute',
    top: 50, // ← moved up
    left: 10,
    backgroundColor: '#111',
    padding: 6,
    borderRadius: 20,
  },
  findButton: {
    position: 'absolute',
    top: 50, // ← moved up
    right: 10,
    backgroundColor: '#111',
    padding: 6,
    borderRadius: 20,
  },
  englishOverlay: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    alignItems: 'center',
  },
  englishBackground: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  englishText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  langBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  textSection: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  foreign: {
    fontSize: 36,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  phonetic: {
    fontSize: 24,
    color: '#ccc',
    marginBottom: 12,
  },
});
