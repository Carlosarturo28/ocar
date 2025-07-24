import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

// Interfaz para los datos de la carta
interface Card {
  id: string;
  name: string;
  imageUrl: string;
  type?: string;
}

// Props que recibirá el componente
interface CardComponentProps {
  carta: Card;
}

const CardItem = ({ carta }: CardComponentProps) => {
  return (
    <View style={styles.cardContainer}>
      <Image
        source={{ uri: carta.imageUrl }}
        style={styles.cardImage}
        resizeMode='cover'
      />
    </View>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width / 3 - 20;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    width: cardWidth,
    height: cardWidth * 1.4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardName: {
    position: 'absolute',
    bottom: 5,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
    borderRadius: 5,
  },
});

export default CardItem;
