import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WordRecordLayout({
  block,
  imageAsset,
  showImage = true,
  showPhonetic = true,
  showTipIcon = false,
  showInfoIcon = false,
  showEnglish = false,
  onToggleEnglish,
  onPhoneticPress,
}) {
  return (
    <View style={styles.container}>
      {showImage && (
        <Image source={imageAsset} style={styles.image} resizeMode="contain" />
      )}

      {/* Always show English overlay if block is tagged */}
      {showImage && block?.showIndex === "1" && (
        <View style={styles.englishOverlay}>
          <View style={styles.englishBackground}>
            <Text style={styles.englishText}>{block.english}</Text>
          </View>
        </View>
      )}

      {/* Show EN badge in bottom left if not tagged to always show */}
      {showImage && block?.showIndex !== "1" && showInfoIcon && !showEnglish && (
        <TouchableOpacity style={styles.langBadge} onPress={onToggleEnglish}>
          <Text style={styles.langBadgeText}>EN</Text>
        </TouchableOpacity>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.nativeText}>{block.native}</Text>

        {showPhonetic && !!block.phonetic && (
          <TouchableOpacity onPress={onPhoneticPress}>
            <Text style={styles.phoneticText}>{block.phonetic}</Text>
          </TouchableOpacity>
        )}

        {showEnglish && block?.english && (
          <Text style={styles.englishBelow}>{block.english}</Text>
        )}

        {showTipIcon && block.tip && (
          <Text style={styles.tipText}>💡 {block.tip}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'flex-start',
  },
  nativeText: {
    fontSize: 28,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
  },
  phoneticText: {
    fontSize: 22,
    color: '#ccc',
    marginBottom: 4,
  },
  englishBelow: {
    fontSize: 20,
    color: '#bbb',
    fontStyle: 'italic',
    marginTop: 8,
  },
  tipText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ccc',
  },
  englishOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  englishBackground: {
    backgroundColor: 'transparent',
  },
  englishText: {
    fontSize: 18,
    color: 'white',
    fontStyle: 'italic',
  },
  langBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langBadgeText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
