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
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, !showImage && { height: screenHeight * 0.478 }]}>
        {showImage && imageAsset && (
          <Image source={imageAsset} style={styles.image} resizeMode="cover" />
        )}

        {stars && <View style={styles.starRow}>{stars}</View>}

        {onPressFind && (
          <TouchableOpacity style={styles.findButton} onPress={onPressFind}>
            <Ionicons name="search" size={25} color="#aaa" />
          </TouchableOpacity>
        )}

        {showSlowAudioIcon && (
          <TouchableOpacity style={styles.slowAudioIcon} onPress={onSlowAudioPress}>
            <FontAwesome name="volume-down" size={24} color="#ccc" />
          </TouchableOpacity>
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
        {block?.foreign && !hideThaiText && (
          <Text style={styles.foreign}>{block.foreign}</Text>
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
    backgroundColor: 'black',
  },
  imageContainer: {
    height: screenHeight * 0.5,
    width: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  starRow: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  findButton: {
    position: 'absolute',
    top: 49,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  slowAudioIcon: {
    position: 'absolute',
    top: 49,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  langBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#555',
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  langBadgeText: {
    color: '#aaa',
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
    zIndex: 2,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
    zIndex: 100,
    position: 'relative',
    pointerEvents: 'auto',
  },
  foreign: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
});
