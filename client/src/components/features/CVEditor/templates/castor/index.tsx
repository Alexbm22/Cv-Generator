import React from 'react';
import { Page, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import * as CVComponents from './components';

Font.register({
    family: 'Nunito Sans',
    src: '/fonts/NunitoSans.ttf',
})

const styles = StyleSheet.create({
    page: { 
        fontFamily: 'Nunito Sans', 
    },
    pageContainer: {
        flexDirection: 'row',
        height: '100%',
        width: '100%'
    },
    leftContainer: {
        backgroundColor: '#424242', 
        width: '35%',
        color: 'white', 
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 25,
    },
    rightContaniner: {

    }
})

const HermesTemplate: React.FC = () => {

    return (
        <Document>
            <Page size='A4' style={styles.page}>
                <View style={styles.pageContainer}>
                    <View style={styles.leftContainer}>
                        <CVComponents.CVPhoto />
                        <CVComponents.GeneralInfos />
                        <CVComponents.SocialLinks />
                        <CVComponents.Languages />
                    </View>
                    <View style={styles.rightContaniner}>

                    </View>
                </View>
            </Page>
        </Document>
    )
}

export default HermesTemplate;