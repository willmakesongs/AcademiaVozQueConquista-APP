import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from './supabaseClient';

const firebaseConfig = {
    apiKey: "AIzaSyAAm9oyGu8kWANd8QN49-RMWgX5d9d6YoE",
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

// Função auxiliar para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const requestForToken = async (userId: string) => {
    if (!messaging) return { token: null, error: 'Firebase Messaging não inicializado (navegador incompatível?)' };

    const MAX_RETRIES = 3;
    let currentRetry = 0;

    while (currentRetry < MAX_RETRIES) {
        try {
            let registration;

            if ('serviceWorker' in navigator) {
                // 0. Force Unregister Old Workers (Clean Slate)
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                    // Unregister only if it's the firebase SW or if we want to be aggressive
                    if (reg.scope.includes('firebase-messaging-sw')) {
                        await reg.unregister();
                        console.log('Service Worker antigo desregistrado para forçar atualização.');
                    }
                }

                // 1. Garantir que o SW está registrado e ATIVO
                try {
                    // Tenta registrar (idempotente)
                    await navigator.serviceWorker.register('/firebase-messaging-sw.js');

                    // Espera ele estar "ready"
                    registration = await navigator.serviceWorker.ready;
                    console.log('Service Worker pronto para FCM:', registration);
                } catch (swError) {
                    console.error(`[Tentativa ${currentRetry + 1}] Erro ao registrar/iniciar SW:`, swError);
                    // Se falhar o SW, lança erro para cair no catch e tentar novamente ou desistir
                    throw swError;
                }
            }

            // 2. Tentar obter o token
            const currentToken = await getToken(messaging, {
                vapidKey: 'BE5d3Uixky8HdFkLnU-k__Y2avMNdvVNcYhhj1kr_BxKNS-wKz4ZnIOZAHxzsOUFYMPluOJhuxonNmMdSBfoHKs',
                serviceWorkerRegistration: registration
            });

            if (currentToken) {
                console.log('Token FCM obtido com sucesso:', currentToken);

                // 3. Salvar no Supabase
                const { error } = await supabase
                    .from('profiles')
                    .update({ push_token: currentToken })
                    .eq('id', userId);

                if (error) {
                    console.error('Erro ao salvar token no Supabase (não fatal):', error);
                }

                return { token: currentToken, error: null }; // Sucesso! Retorna o token e sai do loop
            } else {
                console.warn('Nenhum token foi retornado (permissão pode estar pendente).');
                return { token: null, error: 'Permissão concedida mas nenhum token foi recebido do Google.' };
            }

        } catch (err) {
            currentRetry++;
            console.error(`Erro na tentativa ${currentRetry} de obter token FCM:`, err);

            if (currentRetry >= MAX_RETRIES) {
                console.error('Número máximo de tentativas atingido. Falha na geração do token.');
                return { token: null, error: `Infelizmente falhou após 3 tentativas. Erro: ${err instanceof Error ? err.message : String(err)}` };
            }

            console.log(`Aguardando ${1000 * currentRetry}ms antes da próxima tentativa...`);
            await delay(1000 * currentRetry); // Exponential backoff simples: 0ms (na verdade 1*1000=1s), 2s...
        }
    }

    return { token: null, error: 'Falha desconhecida após retentativas.' };
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            console.log('Mensagem recebida em foreground:', payload);
            resolve(payload);
        });
    });
