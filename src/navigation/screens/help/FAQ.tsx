import * as React from 'react';
import { View, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { SEHeader } from '../../../components';
import { ScrollView } from 'react-native-gesture-handler';
import { spaces } from '../../../styles/sizes';
import { sharedStyles } from '../../../styles';
import { YouTube } from '../../../components';
import { width } from '../../../utilities/dimensions';
import { Body, H6, H7 } from '@pxblue/react-native-components';
import { FAQData } from '../../../data/FAQ';
import { splitParagraphs } from '../../../utilities/general';

export const FAQ = (props) => (
    <View style={sharedStyles.pageContainer}>
        <SEHeader title={'FAQ'} subtitle={'...common questions'} />
        <ScrollView contentContainerStyle={sharedStyles.paddingMedium}>
            <H6>Frequently Asked Questions</H6>
            {FAQData.map((faq, ind) => (
                <React.Fragment key={`FAQ_${ind}`}>
                    <H7 style={sharedStyles.textTitle}>{faq.question}</H7>
                    {!faq.platform_specific ?
                        (splitParagraphs(faq.answer).map((p: string, pInd: number) => (
                            <Body key={`faq-${ind}-${pInd}`} style={sharedStyles.paragraph}>{p}</Body>)
                        )) :
                        (<>
                            {Platform.OS === 'ios' && splitParagraphs(faq.answer_ios).map((p: string, pInd: number) => (
                                <Body key={`faq-${ind}-${pInd}`} style={sharedStyles.paragraph}>{p}</Body>
                            ))}
                            {Platform.OS === 'android' && splitParagraphs(faq.answer_android).map((p: string, pInd: number) => (
                                <Body key={`faq-${ind}-${pInd}`} style={sharedStyles.paragraph}>{p}</Body>
                            ))}
                        </>)
                    }
                    {faq.video === '' ? null :
                        <YouTube videoId={faq.video} style={styles.video}/>
                    }
                </React.Fragment>
            ))}
            <SafeAreaView />
        </ScrollView>
    </View>
);
const styles = StyleSheet.create({
    video: {
        height: (width - 2 * spaces.medium) * (9 / 16),
        marginTop: spaces.small,
    }
});