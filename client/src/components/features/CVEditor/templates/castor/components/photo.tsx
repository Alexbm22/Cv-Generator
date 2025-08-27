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
    marginTop: 25,
  },
  photoStyles: {
    width: '100%',
    height: 'auto',
    borderRadius: 100,
    objectFit: 'cover'
  }
})

const CVPhoto: React.FC<CVPhotoProps> = ({
  CVPhoto,
  fallbackUrl = "/Images/anonymous_Picture.png",
}) => {
  const currentPhoto =  CVPhoto ?? fallbackUrl;

  return (
    <View style={styles.photoContainer}>
      <Image 
          src={currentPhoto}
          style={styles.photoStyles}
      ></Image>
    </View>
  );
};

export default CVPhoto;