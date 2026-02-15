import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from './supabaseClient';

const firebaseConfig = {
    apiKey: "AIzaSyAAm9oyGu8kWAND8QN49-RMWgX5d9d6YoE",
    authDomain: "academia-vqc.firebaseapp.com",
    projectId: "academia-vqc",
    storageBucket: "academia-vqc.firebasestorage.app",
    messagingSenderId: "965989150400",
    appId: "1:965989150400:web:0af7f4efeed23019850725",
    measurementId: "G-1Q8WG9W314"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async (userId: string) => {
    if (!messaging) return null;

    try {
        const currentToken = await getToken(messaging, {
            vapidKey: 'BE5d3Uixky8HdFkLnU-k__Y2avMNdvVNCYhhj1kr_BxKNS-wKz4ZnIOZAHxzsOUFYMPluOJhuxonNmMdSBfoHKs'
        });

        if (currentToken) {
            console.log('Token FCM obtido:', currentToken);

            // Salvar no Supabase
            const { error } = await supabase
                .from('profiles')
                .update({ push_token: currentToken })
                .eq('id', userId);

            if (error) console.error('Erro ao salvar token no Supabase:', error);

            return currentToken;
        } else {
            console.log('Nenhum token disponível. Solicite permissão.');
            return null;
        }
    } catch (err) {
        console.error('Erro ao obter token FCM:', err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            console.log('Mensagem recebida em foreground:', payload);
            resolve(payload);
        });
    });
