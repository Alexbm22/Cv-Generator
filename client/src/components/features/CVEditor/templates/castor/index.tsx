import React from 'react';
import { Page, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import * as CVComponents from './components';
import { TemplateComponentProps } from '../../../../../interfaces/cv';
import { parseQuillToReactPDF } from '../../../../../utils/parseHtmlToPdf';

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
        alignItems: 'center',
        padding: 25,
    },
    rightContaniner: {

    }
})


const Castor: React.FC<TemplateComponentProps> = ({ CV }) => {

    const ParsedHTML = parseQuillToReactPDF(CV.professionalSummary);

    return (
        <Document>
            <Page size='A4' style={styles.page}>
                <View style={styles.pageContainer}>
                    <View style={styles.leftContainer}>
                        <CVComponents.CVPhoto CVPhoto={CV.photo}/>
                        <CVComponents.GeneralInfos 
                            phoneNumber={CV.phoneNumber}
                            email={CV.email}
                            address={CV.address}
                            birthDate={CV.birthDate}
                        />
                        <CVComponents.SocialLinks 
                            socialLinks={CV.socialLinks}
                        />
                        <CVComponents.Languages 
                            languages={CV.languages}
                        />
                    </View>
                    <View style={styles.rightContaniner}>
                        <View>
                            {ParsedHTML}
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

export default Castor;