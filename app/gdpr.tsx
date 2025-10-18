import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GDPRPolicy = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.fullScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.title}>Politica de Confidențialitate (GDPR)</Title>

                <Paragraph style={styles.paragraph}>
                    Această Politică de Confidențialitate descrie cum [Numele Companiei/Dezvoltatorului] ("noi", "nouă" sau "nostru") colectează, utilizează și partajează informații despre dvs. prin intermediul aplicației mobile [Numele Aplicației] ("Serviciul"). Vă rugăm să citiți cu atenție această politică de confidențialitate.
                </Paragraph>

                <Title style={styles.subTitle}>Informații pe care le colectăm</Title>
                <Paragraph style={styles.paragraph}>
                    Putem colecta informații despre dvs. în diverse moduri. Informațiile pe care le putem colecta prin intermediul Aplicației includ:
                </Paragraph>
                <Paragraph style={styles.paragraph}>
                    **Date Personale:** Informații de identificare personală, cum ar fi numele dvs., adresa de e-mail, departamentul, anul admiterii și competențele pe care le furnizați voluntar atunci când vă înregistrați în Aplicație sau când alegeți să participați la diverse activități legate de Aplicație (cum ar fi crearea profilului, solicitarea de mentorat etc.).
                </Paragraph>
                <Paragraph style={styles.paragraph}>
                    **Date Derivate:** Informații pe care serverele noastre le colectează automat atunci când accesați Aplicația, cum ar fi acțiunile native, cum ar fi like-urile, comentariile sau răspunsurile la postări, precum și alte interacțiuni cu Aplicația.
                </Paragraph>

                <Title style={styles.subTitle}>Utilizarea Informațiilor Dvs.</Title>
                <Paragraph style={styles.paragraph}>
                    Având informații precise despre dvs. ne permite să vă oferim o experiență lină, eficientă și personalizată. În mod specific, putem utiliza informațiile colectate despre dvs. prin intermediul Aplicației pentru a:
                    {'\n'}- Crea și gestiona contul dvs.
                    {'\n'}- Facilita comunicarea între utilizatori (de ex., cereri de mentorat, mesaje de proiect).
                    {'\n'}- Vă trimite notificări legate de cont sau de Serviciu.
                    {'\n'}- Îmbunătăți eficiența și funcționarea Aplicației.
                    {'\n'}- Monitoriza și analiza utilizarea și tendințele pentru a îmbunătăți experiența dvs. cu Aplicația.
                </Paragraph>

                {/* --- ADD MORE SECTIONS AS NEEDED --- */}
                {/* Exemple: Dezvăluirea Informațiilor Dvs., Securitatea Informațiilor Dvs., Drepturile Dvs. GDPR, Politica privind Copiii, Contact etc. */}

                <Title style={styles.subTitle}>Drepturile Dvs. Conform GDPR</Title>
                <Paragraph style={styles.paragraph}>
                    Dacă sunteți rezident al Spațiului Economic European (SEE), aveți anumite drepturi privind protecția datelor. [Numele Companiei/Dezvoltatorului] își propune să ia măsuri rezonabile pentru a vă permite să corectați, modificați, ștergeți sau limitați utilizarea Datelor Dvs. Personale. Aveți dreptul de a accesa, actualiza sau șterge informațiile pe care le avem despre dvs., dreptul la rectificare, dreptul de a obiecta, dreptul la restricționare, dreptul la portabilitatea datelor și dreptul de a retrage consimțământul. Puteți exercita aceste drepturi contactându-ne la [Adresa de E-mail de Contact].
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

export default GDPRPolicy;