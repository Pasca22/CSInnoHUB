import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TermsAndConditions = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.fullScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.title}>Termeni și Condiții</Title>

                <Paragraph style={styles.paragraph}>
                    Bine ați venit la [Numele Aplicației]! Acești termeni și condiții descriu regulile și regulamentele pentru utilizarea website-ului/aplicației [Numele Aplicației], localizat la [Adresa URL a Aplicației/Website-ului - dacă există].
                </Paragraph>

                <Paragraph style={styles.paragraph}>
                    Prin accesarea acestei aplicații, presupunem că acceptați acești termeni și condiții. Nu continuați să utilizați [Numele Aplicației] dacă nu sunteți de acord să respectați toți termenii și condițiile menționate pe această pagină.
                </Paragraph>

                <Title style={styles.subTitle}>Licență</Title>
                <Paragraph style={styles.paragraph}>
                    Cu excepția cazului în care se specifică altfel, [Numele Companiei/Dezvoltatorului] și/sau licențiatorii săi dețin drepturile de proprietate intelectuală pentru tot materialul de pe [Numele Aplicației]. Toate drepturile de proprietate intelectuală sunt rezervate. Puteți accesa acest material de pe [Numele Aplicației] pentru uzul personal, supus restricțiilor stabilite în acești termeni și condiții.
                </Paragraph>
                <Paragraph style={styles.paragraph}>
                    Nu trebuie să:
                    {'\n'}- Republicați material de pe [Numele Aplicației]
                    {'\n'}- Vindeți, închiriați sau sub-licențiați material de pe [Numele Aplicației]
                    {'\n'}- Reproduceți, duplicați sau copiați material de pe [Numele Aplicației]
                    {'\n'}- Redistribuiți conținut de pe [Numele Aplicației]
                </Paragraph>

                {/* --- ADD MORE SECTIONS AS NEEDED --- */}
                {/* Exemple: Contul Utilizatorului, Conținutul Utilizatorului, Limitarea Răspunderii, Modificări ale Termenilor, Legea Aplicabilă etc. */}

                <Paragraph style={styles.paragraph}>
                    Acești Termeni vor fi guvernați și interpretați în conformitate cu legile din România, fără a ține cont de dispozițiile sale privind conflictul de legi.
                </Paragraph>

                <Paragraph style={styles.paragraph}>
                    Ultima actualizare: 18 Octombrie 2025
                </Paragraph>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 20,
        marginTop: 15,
        marginBottom: 10,
    },
    paragraph: {
        marginBottom: 15,
        lineHeight: 22,
    },
});

export default TermsAndConditions;