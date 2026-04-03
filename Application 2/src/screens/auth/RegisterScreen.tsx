import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../stores/auth.store';

export default function RegisterScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { registerUser, registerProvider } = useAuthStore();
    const [tab, setTab] = useState<'user' | 'provider'>('user');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '', fullName: '', password: '', phone: '',
        businessName: '', businessType: 'HOME', city: '', wilaya: '',
    });

    const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

    const handleSubmit = async () => {
        if (!form.email || !form.fullName || !form.password) return;
        setLoading(true);
        try {
            if (tab === 'user') {
                await registerUser({ email: form.email, fullName: form.fullName, password: form.password, phone: form.phone || undefined });
            } else {
                await registerProvider({
                    email: form.email, fullName: form.fullName, password: form.password, phone: form.phone || undefined,
                    businessName: form.businessName, businessType: form.businessType, city: form.city, wilaya: form.wilaya,
                });
            }
        } catch (err: any) {
            Alert.alert(t('registerFailed'), err.response?.data?.message || t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[theme.colors.background, '#0D0D1A']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <View style={styles.logoWrap}>
                        <LinearGradient colors={['#C6A75E', '#E2B65B']} style={styles.logo}>
                            <Text style={styles.logoText}>ر</Text>
                        </LinearGradient>
                        <Text style={styles.appName}>{t('register')}</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Tab Switcher */}
                        <View style={styles.tabs}>
                            <TouchableOpacity style={[styles.tab, tab === 'user' && styles.activeTab]} onPress={() => setTab('user')}>
                                <Text style={[styles.tabText, tab === 'user' && styles.activeTabText]}>👤 {t('user')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, tab === 'provider' && styles.activeTab]} onPress={() => setTab('provider')}>
                                <Text style={[styles.tabText, tab === 'provider' && styles.activeTabText]}>🏢 {t('provider')}</Text>
                            </TouchableOpacity>
                        </View>

                        <Input label={t('fullName')} value={form.fullName} onChangeText={(v: string) => update('fullName', v)} />
                        <Input label={t('email')} value={form.email} onChangeText={(v: string) => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
                        <Input label={t('password')} value={form.password} onChangeText={(v: string) => update('password', v)} secureTextEntry />
                        <Input label={t('phone')} value={form.phone} onChangeText={(v: string) => update('phone', v)} keyboardType="phone-pad" />

                        {tab === 'provider' && (
                            <>
                                <View style={styles.divider} />
                                <Input label={t('businessName')} value={form.businessName} onChangeText={(v: string) => update('businessName', v)} />
                                <Text style={styles.pickerLabel}>{t('businessType')}</Text>
                                <View style={styles.pickerWrap}>
                                    <TouchableOpacity style={[styles.typeBtn, form.businessType === 'HOME' && styles.typeBtnActive]} onPress={() => update('businessType', 'HOME')}>
                                        <Text style={styles.typeText}>🏠</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.typeBtn, form.businessType === 'HOTEL' && styles.typeBtnActive]} onPress={() => update('businessType', 'HOTEL')}>
                                        <Text style={styles.typeText}>🏨</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.typeBtn, form.businessType === 'RESTAURANT' && styles.typeBtnActive]} onPress={() => update('businessType', 'RESTAURANT')}>
                                        <Text style={styles.typeText}>🍲</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.typeBtn, form.businessType === 'TAXI' && styles.typeBtnActive]} onPress={() => update('businessType', 'TAXI')}>
                                        <Text style={styles.typeText}>🚕</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Input label={t('city')} value={form.city} onChangeText={(v: string) => update('city', v)} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Input label={t('wilaya')} value={form.wilaya} onChangeText={(v: string) => update('wilaya', v)} />
                                    </View>
                                </View>
                            </>
                        )}

                        <Button title={t('registerBtn')} onPress={handleSubmit} loading={loading} />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('hasAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.link}>{t('loginHere')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
    logoWrap: { alignItems: 'center', marginBottom: 24 },
    logo: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    logoText: { fontSize: 32, fontWeight: '800', color: theme.colors.background },
    appName: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.text, marginTop: 12 },
    form: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 20 },
    tabs: { flexDirection: 'row', backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, padding: 4, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
    activeTab: { backgroundColor: theme.colors.primary },
    tabText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: '600' },
    activeTabText: { color: theme.colors.background },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 16 },
    pickerLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: 8, fontWeight: '600' },
    pickerWrap: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.colors.inputBg, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border },
    typeBtnActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(198,167,94,0.15)' },
    typeText: { fontSize: 24 },
    row: { flexDirection: 'row' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 40, alignItems: 'center' },
    footerText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
    link: { color: theme.colors.primary, fontWeight: '700', fontSize: theme.fontSize.sm },
});
