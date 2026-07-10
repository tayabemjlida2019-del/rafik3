import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../stores/auth.store';

export default function LoginScreen({ navigation }: any) {
    const { t } = useTranslation();
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            Alert.alert(t('loginFailed'), err.response?.data?.message || t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[theme.colors.background, '#0D0D1A']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {/* Logo */}
                    <View style={styles.logoWrap}>
                        <LinearGradient colors={['#C6A75E', '#E2B65B']} style={styles.logo}>
                            <Text style={styles.logoText}>ر</Text>
                        </LinearGradient>
                        <Text style={styles.appName}>{t('welcome')}</Text>
                        <Text style={styles.subtitle}>{t('subtitle')}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input label={t('email')} value={email} onChangeText={setEmail}
                            placeholder="ahmed@example.com" keyboardType="email-address" autoCapitalize="none" />
                        <Input label={t('password')} value={password} onChangeText={setPassword}
                            placeholder="••••••••" secureTextEntry />
                        <Button title={t('loginBtn')} onPress={handleLogin} loading={loading} />
                    </View>

                    {/* Register link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('noAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.link}>{t('registerHere')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoWrap: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    logoText: { fontSize: 40, fontWeight: '800', color: theme.colors.background },
    appName: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text, marginTop: 16 },
    subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 4 },
    form: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 24, ...theme.shadow.md },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center' },
    footerText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
    link: { color: theme.colors.primary, fontWeight: '700', fontSize: theme.fontSize.sm },
});
