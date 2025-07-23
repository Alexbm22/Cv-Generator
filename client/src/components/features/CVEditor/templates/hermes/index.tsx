import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { useCvEditStore } from '../../../../../Store';

const MyCV: React.FC = () => {

    const photo = useCvEditStore(state => state.photo)

    return (
        <Document>
            <Page size='A4'>
                <View>
                    <Text>CV TEST 1</Text>
                    <Text>sdad</Text>
                    <Image src={photo || ''}></Image>
                </View>
            </Page>
        </Document>
    )
}

export default MyCV;