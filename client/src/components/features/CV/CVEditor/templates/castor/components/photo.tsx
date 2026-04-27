import React from "react";
import { Image, StyleSheet, View } from '@react-pdf/renderer';


interface CVPhotoProps {
  CVPhoto?: string;
  fallbackUrl?: string;
}

const styles = StyleSheet.create({
  photoContainer: {
    width: '75%',
    height: 'auto',
    alignContent: 'center',
    marginBottom: 26,
  },
  photoStyles: {
    width: '100%',
    height: 'auto',
    borderRadius: 100,
    objectFit: 'cover',
    borderWidth: 3,
    borderColor: 'white',
    borderStyle: 'solid',
  }
})

const CVPhoto: React.FC<CVPhotoProps> = ({
  CVPhoto,
}) => {

  return (
    <View style={styles.photoContainer}>
      <Image 
          src={CVPhoto}
          style={styles.photoStyles}
      ></Image>
    </View>
  );
};

export default CVPhoto;