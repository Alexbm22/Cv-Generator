import React from "react";
import { useCvEditStore } from "../../../../../../Store";
import { Image, StyleSheet, View } from '@react-pdf/renderer';

interface CVPhotoProps {
  fallbackUrl?: string;
}

const styles = StyleSheet.create({
  photoContainer: {
    width: '75%',
    height: 'auto',
    alignContent: 'center'
  },
  photoStyles: {
    width: '100%',
    height: 'auto',
    borderRadius: 100,
    objectFit: 'cover'
  }
})

const CVPhoto: React.FC<CVPhotoProps> = ({
  fallbackUrl = "/Images/anonymous_Picture.png",
}) => {
  const photo = useCvEditStore((state) => state.photo);
  const currentPhoto =  photo ?? fallbackUrl;

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