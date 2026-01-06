import { Vocalize, User, StudentSummary, Appointment, Module, TwisterExercise } from './types';

// CONFIGURAÇÃO GLOBAL: Desativar todos os players para manutenção/assinantes
export const DISABLE_ALL_PLAYERS = false;

// URL BASE PARA ARMAZENAMENTO (Áudio e Vídeo)
// Quando migrar para o Backblaze, basta trocar esta URL pela nova URL do Bucket
export const STORAGE_BASE_URL = 'https://AcademiaVQC-App.s3.us-east-005.backblazeb2.com';

// URL da foto da Lorena (IA).
export const LORENA_AVATAR_URL = 'https://academiavqc-app.s3.us-east-005.backblazeb2.com/PNGs-JPEG/LorenaIA.png';

// -----------------------------------------------------------
// TWISTERS DATA
// -----------------------------------------------------------
export const TWISTERS_DATA: TwisterExercise[] = [
    // MÓDULO A: BILABIAIS
    {
        id: 't-a1',
        module: 'A',
        moduleTitle: 'Bilabiais (P, B, M)',
        focus: 'Explosão e clareza labial',
        title: 'O Peito de Pedro',
        difficulty: 'Nível 1',
        text: 'O peito do pé de Pedro é preto. Quem disser que o peito do pé de Pedro é preto, tem o peito do pé mais preto que o peito do pé de Pedro.',
        instructions: 'Exagere no fechamento dos lábios nas consoantes P e B. Não deixe vazar ar antes da hora.',
        targetBpm: 80
    },
    {
        id: 't-a2',
        module: 'A',
        moduleTitle: 'Bilabiais (P, B, M)',
        focus: 'Alternância P/B',
        title: 'Bota no Bote',
        difficulty: 'Nível 2',
        text: 'Bote a bota no bote e tire o pote do bote.',
        instructions: 'Cuidado para não confundir a sonoridade surda (P) com a sonora (B).',
        targetBpm: 140
    },
    // MÓDULO B: ALVEOLARES
    {
        id: 't-b1',
        module: 'B',
        moduleTitle: 'Alveolares (T, D, L, N)',
        focus: 'Ponta da língua',
        title: 'Três Tigres',
        difficulty: 'Nível 1',
        text: 'Três pratos de trigo para três tigres tristes.',
        instructions: 'Mantenha a mandíbula estável. Use apenas a ponta da língua batendo nos dentes superiores.',
        targetBpm: 90
    },
    {
        id: 't-b2',
        module: 'B',
        moduleTitle: 'Alveolares (T, D, L, N)',
        focus: 'Agilidade Dental',
        title: 'Terra do Tatau',
        difficulty: 'Desafio',
        text: 'Disseram que na terra do Tatau o teto tinha telha, mas o teto da terra do Tatau não tem telha, tem teto de palha.',
        instructions: 'Velocidade é consequência. Foque na clareza do T e D.',
        targetBpm: 130
    },
    // MÓDULO C: SIBILANTES
    {
        id: 't-c1',
        module: 'C',
        moduleTitle: 'Sibilantes e Palatais',
        focus: 'Vibração de ponta (R)',
        title: 'O Rato de Roma',
        difficulty: 'Nível 1',
        text: 'O rato roeu a roupa do rei de Roma, o rato roeu a roupa do rei de Rússia, o rato roeu a roupa do rodovalho.',
        instructions: 'Mantenha o suporte de ar constante para o R não falhar.',
        targetBpm: 110
    },
    {
        id: 't-c2',
        module: 'C',
        moduleTitle: 'Sibilantes e Palatais',
        focus: 'Controle de Sibilância',
        title: 'Sapa Sapeca',
        difficulty: 'Nível 2',
        text: 'A sapa sapeca saltou o saco do sapo, o sapo no saco deu um salto no sapato da sapa.',
        instructions: 'Evite o chiado excessivo no S.',
        targetBpm: 100
    },
    {
        id: 't-c3',
        module: 'C',
        moduleTitle: 'Sibilantes e Palatais',
        focus: 'Complexidade Articulatória',
        title: 'Mafagafos',
        difficulty: 'Desafio',
        text: 'Num ninho de mafagafos, cinco mafagafinhos há! Quem os desmafagafizar, bom desmafagafizador será.',
        instructions: 'Articule sílaba por sílaba lentamente antes de correr.',
        targetBpm: 120
    },
    // MÓDULO D: VOGAIS
    {
        id: 't-d1',
        module: 'D',
        moduleTitle: 'Vowel Shaping (Vogais)',
        focus: 'Espaço Interno',
        title: 'Aranha e Rã',
        difficulty: 'Nível 1',
        text: 'A aranha arranha a rã. A rã arranha a aranha. Nem a aranha arranha a rã, nem a rã arranha a aranha.',
        instructions: 'Mantenha o palato mole elevado (bocejo). Diferencie o A oral do A nasal (rã).',
        targetBpm: 85
    }
];

// -----------------------------------------------------------
// HTML DO PLAYER INLINE COM LOGO VISUALIZER (Reutilizável)
// -----------------------------------------------------------
export const INLINE_PLAYER_TEMPLATE = (url: string) => `
<div class="player-container flex items-center gap-4 mt-4 bg-[#101622] border border-white/5 p-3 rounded-2xl w-max pr-6">
    <button class="play-example-btn w-12 h-12 rounded-full bg-[#0081FF] text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,129,255,0.3)]" data-src="${url}">
        <span class="material-symbols-rounded text-3xl ml-1">play_arrow</span>
    </button>
    <div class="flex items-center gap-3">
        <img src="${MINIMALIST_LOGO_URL}" class="w-8 h-8 object-contain opacity-40 group-hover:opacity-100 transition-opacity" alt="Logo" />
        <div class="audio-viz flex items-end gap-1.5 h-10 opacity-50 transition-opacity">
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(0,129,255,0.3)]" style="background-color: #0081FF; height: 23px;" data-base-height="23"></div>
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(0,129,255,0.3)]" style="background-color: #0081FF; height: 12px;" data-base-height="12"></div>
            <div class="w-1.5 rounded-full transition-all duration-150" style="background-color: #6F4CE7; height: 8px;" data-base-height="8"></div>
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(147,51,234,0.3)]" style="background-color: #9333EA; height: 28px;" data-base-height="28"></div>
            <div class="w-1.5 rounded-full transition-all duration-150" style="background-color: #EE13CA; height: 15px;" data-base-height="15"></div>
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(255,0,188,0.3)]" style="background-color: #FF00BC; height: 8px;" data-base-height="8"></div>
        </div>
    </div>
</div>
</div>
`;

// -----------------------------------------------------------
// HTML DO PLAYER YOUTUBE EMBED (Reutilizável)
// -----------------------------------------------------------
export const YOUTUBE_EMBED_TEMPLATE = (videoId: string, title: string) => `
<div class="mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
    <div class="aspect-video w-full bg-black relative">
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}" 
            title="${title}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full"
        ></iframe>
    </div>
    <div class="bg-[#1A202C] p-3 flex justify-between items-center relative overflow-hidden">
        <div class="flex items-center gap-3 relative z-10">
            <img src="${MINIMALIST_LOGO_URL}" class="w-8 h-8 object-contain animate-[pulse_2s_infinite]" alt="Logo" />
            <span class="text-sm font-bold text-white truncate max-w-[200px]">${title}</span>
        </div>
        <div class="px-2 py-1 bg-[#FF00BC]/20 rounded border border-[#FF00BC]/50 flex items-center gap-1 relative z-10">
             <span class="w-1.5 h-1.5 bg-[#FF00BC] rounded-full animate-pulse"></span>
             <span class="text-[10px] text-[#FF00BC] font-bold uppercase tracking-wider">Karaoke</span>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-right from-[#0081FF] via-[#9333EA] to-[#FF00BC] opacity-30"></div>
    </div>
</div>
`;

// Base URL for vocalizes
export const MINIMALIST_LOGO_URL = 'https://AcademiaVQC-App.s3.us-east-005.backblazeb2.com/PNGs-JPEG/VQLOGOMINIMALISTA.png';
const VOCALIZES_BASE_URL = `${STORAGE_BASE_URL}/VOCALIZES%20mp3/`;
const SINGEO_BASE_URL = 'https://AcademiaVQC-App.s3.us-east-005.backblazeb2.com/Vocalizes+SINGEO/';

// -----------------------------------------------------------
// MODULES DATA
// -----------------------------------------------------------
export const MODULES: Module[] = [
    {
        id: 'm1',
        number: '01',
        title: 'Fundamentos Biofisiológicos',
        subtitle: 'A Base',
        description: 'Prepara a "máquina" antes de exigir performance.',
        topics: [
            {
                id: '1.1',
                title: 'Consciência Corporal e Alinhamento',
                description: 'Alinhamento de eixos (cabeça, pescoço e coluna).',
                content: `
          <div class="space-y-8 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
               <div class="relative z-10">
                   <div class="flex items-center gap-3 mb-4">
                       <div class="w-10 h-10 rounded-lg bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                          <span class="material-symbols-rounded">accessibility_new</span>
                       </div>
                       <h3 class="text-lg font-bold text-white">1. O Conceito dos Três Eixos</h3>
                   </div>
                   <p class="text-gray-300 text-sm leading-relaxed mb-4">
                       Imagine um fio de seda puxando o topo da sua cabeça em direção ao teto. Esse fio alinha três pontos principais:
                   </p>
                   <div class="grid gap-3">
                       <div class="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                           <span class="material-symbols-rounded text-gray-500">looks_one</span>
                           <div>
                               <strong class="text-[#0081FF] block text-xs uppercase tracking-wide">Eixo Cervical</strong>
                               <span class="text-sm text-gray-300">Cabeça/Pescoço: Onde o som é moldado.</span>
                           </div>
                       </div>
                       <div class="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                           <span class="material-symbols-rounded text-gray-500">looks_two</span>
                           <div>
                               <strong class="text-[#0081FF] block text-xs uppercase tracking-wide">Eixo Torácico</strong>
                               <span class="text-sm text-gray-300">Peito/Costas: Onde o pulmão se expande.</span>
                           </div>
                       </div>
                       <div class="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                           <span class="material-symbols-rounded text-gray-500">looks_3</span>
                           <div>
                               <strong class="text-[#0081FF] block text-xs uppercase tracking-wide">Eixo Pélvico</strong>
                               <span class="text-sm text-gray-300">Quadril/Base: Onde o apoio se sustenta.</span>
                           </div>
                       </div>
                   </div>
               </div>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] text-sm font-bold">2</span>
                    Passo a Passo para o Alinhamento
                </h3>
                <div class="space-y-4">
                    <div class="pl-4 border-l-2 border-[#6F4CE7]/30">
                        <strong class="text-[#6F4CE7] text-sm uppercase tracking-wide block mb-1">A. Os Pés (A Base)</strong>
                        <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>Mantenha os pés afastados na largura dos ombros.</li>
                            <li>Distribua o peso igualmente: nem muito nos calcanhares, nem muito nas pontas. Sinta o chão.</li>
                        </ul>
                    </div>
                    <div class="pl-4 border-l-2 border-[#6F4CE7]/30">
                        <strong class="text-[#6F4CE7] text-sm uppercase tracking-wide block mb-1">B. Os Joelhos (Amortecimento)</strong>
                        <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li><span class="text-[#FF00BC] font-bold">Proibido:</span> Travar os joelhos para trás (hiperextensão). Isso gera tensão na lombar.</li>
                            <li>Mantenha-os "destravados", com uma microflexão quase imperceptível.</li>
                        </ul>
                    </div>
                    <div class="pl-4 border-l-2 border-[#6F4CE7]/30">
                        <strong class="text-[#6F4CE7] text-sm uppercase tracking-wide block mb-1">C. O Peito e Ombros (Abertura)</strong>
                        <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>Rode os ombros para trás e para baixo uma vez.</li>
                            <li>Imagine que você está exibindo uma medalha no peito (esterno elevado), sem estufar como um soldado.</li>
                        </ul>
                    </div>
                    <div class="pl-4 border-l-2 border-[#6F4CE7]/30">
                        <strong class="text-[#6F4CE7] text-sm uppercase tracking-wide block mb-1">D. A Cabeça</strong>
                        <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>O queixo deve estar paralelo ao chão.</li>
                            <li><span class="text-yellow-400 font-bold">Erro comum:</span> Levantar o queixo para notas agudas (esmaga a laringe) ou abaixar demais.</li>
                            <li>Imagine um pequeno espaço entre suas vértebras do pescoço.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-[#151a24] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-sm font-bold">3</span>
                    O Teste da Parede (Prática)
                </h3>
                <p class="text-sm text-gray-400 mb-4">Este é o exercício mais eficaz para calibrar seu eixo:</p>
                <ol class="space-y-3 text-sm text-gray-300">
                    <li class="flex gap-3 items-start">
                        <span class="material-symbols-rounded text-[#FF00BC] text-lg">check_circle</span>
                        Encoste-se em uma parede reta.
                    </li>
                    <li class="flex gap-3 items-start">
                        <span class="material-symbols-rounded text-[#FF00BC] text-lg">check_circle</span>
                        Os calcanhares, glúteos, ombros e a parte de trás da cabeça devem tocar a parede.
                    </li>
                    <li class="flex gap-3 items-start">
                        <span class="material-symbols-rounded text-[#FF00BC] text-lg">check_circle</span>
                        Tente passar a mão por trás da sua lombar; deve haver um pequeno espaço, mas não um buraco grande.
                    </li>
                    <li class="flex gap-3 items-start">
                        <span class="material-symbols-rounded text-[#FF00BC] text-lg">check_circle</span>
                        Dê um passo à frente mantendo essa sensação de "corpo alto". Esta é a sua postura de canto.
                    </li>
                </ol>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-32 h-32 bg-green-500 blur-[80px] opacity-10"></div>
                 <div class="relative z-10">
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-rounded text-green-500">psychology</span>
                        4. Por que isso importa?
                    </h3>
                    <p class="text-sm text-gray-300 mb-4">Quando você alinha a coluna, a laringe fica livre de pressões externas. Uma postura correta garante:</p>
                    <div class="grid gap-2 mb-6">
                        <div class="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-gray-300">
                            <strong class="text-green-400">Mais fôlego:</strong> O diafragma tem espaço total para descer.
                        </div>
                        <div class="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-gray-300">
                            <strong class="text-green-400">Ressonância:</strong> O som flui sem barreiras até a boca e o nariz.
                        </div>
                        <div class="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-gray-300">
                            <strong class="text-green-400">Presença:</strong> Um cantor alinhado transmite autoridade e confiança.
                        </div>
                    </div>

                    <div class="bg-[#FF00BC]/10 border border-[#FF00BC]/20 p-4 rounded-xl flex gap-3 items-start">
                        <span class="material-symbols-rounded text-[#FF00BC] shrink-0">warning</span>
                        <div>
                            <strong class="text-[#FF00BC] text-sm block mb-1">Diagnóstico de Erro</strong>
                            <p class="text-xs text-gray-300">Se ao cantar você sente uma veia saltar no pescoço ou dor na nuca, seu eixo cervical está quebrado. Volte para a parede.</p>
                        </div>
                    </div>
                 </div>
            </div>
          </div>
        `
            },
            {
                id: '1.2',
                title: 'Gestão de Fluxo e Appoggio (Apoio)',
                description: 'Respiração diafragmática e apoio (Appoggio).',
                content: `
          <div class="space-y-8 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
               <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <span class="w-8 h-8 rounded-lg bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-sm font-bold">1</span>
                       O Conceito: Respiração vs. Apoio
                   </h3>
                   <p class="text-sm text-gray-300 mb-4">Muitos alunos acham que apoiar é "fazer força". Errado.</p>
                   <div class="grid gap-3">
                       <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                           <strong class="text-[#0081FF] block text-xs uppercase tracking-wide mb-1">Respiração</strong>
                           <p class="text-sm text-gray-300">É o ato de abastecer o tanque (Combustível).</p>
                       </div>
                       <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                           <strong class="text-[#0081FF] block text-xs uppercase tracking-wide mb-1">Appoggio (Apoio)</strong>
                           <p class="text-sm text-gray-300">É o ato de controlar a saída desse ar (O acelerador).</p>
                       </div>
                   </div>
                   <p class="text-xs text-gray-400 mt-4 italic">O objetivo é manter o pulmão cheio pelo maior tempo possível, evitando que a caixa torácica desabe de uma vez.</p>
               </div>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
               <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <span class="w-8 h-8 rounded-lg bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] text-sm font-bold">2</span>
                   A Técnica: Respiração Diafragmática
               </h3>
               <p class="text-sm text-gray-300 mb-4">Para cantar, não usamos a "respiração alta" (ombros). Usamos a base dos pulmões.</p>
               <ul class="space-y-3">
                   <li class="flex gap-3">
                       <span class="material-symbols-rounded text-[#6F4CE7] mt-0.5">filter_1</span>
                       <div>
                           <strong class="text-white text-sm block">A Inalação</strong>
                           <p class="text-xs text-gray-400">Imagine cheirar uma flor. Sinta as costelas expandirem para os lados e o abdome para frente.</p>
                       </div>
                   </li>
                   <li class="flex gap-3">
                       <span class="material-symbols-rounded text-[#6F4CE7] mt-0.5">filter_2</span>
                       <div>
                           <strong class="text-white text-sm block">O Bloqueio</strong>
                           <p class="text-xs text-gray-400">Por um milissegundo, sinta o ar "parado" lá embaixo.</p>
                       </div>
                   </li>
                   <li class="flex gap-3">
                       <span class="material-symbols-rounded text-[#6F4CE7] mt-0.5">filter_3</span>
                       <div>
                           <strong class="text-white text-sm block">A Expansão</strong>
                           <p class="text-xs text-gray-400">Ao cantar, tente manter as costelas abertas enquanto o ar sai. Não murche de uma vez.</p>
                       </div>
                   </li>
               </ul>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-[#151a24] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-sm font-bold">3</span>
                    Exercício Prático: O "Cinto Imaginário"
                </h3>
                <div class="space-y-6">
                    <div class="pl-4 border-l-2 border-[#FF00BC]/30">
                        <strong class="text-[#FF00BC] text-sm uppercase tracking-wide block mb-1">Fase 1 (Sopro Constante)</strong>
                        <p class="text-sm text-gray-300">Inspire em 4 tempos expandindo a cintura. Solte o ar em "S" (pneu esvaziando) o mais constante possível.</p>
                        <p class="text-xs text-[#FF00BC] mt-1">⚠️ O som não pode oscilar. Deve ser reto.</p>
                        ${INLINE_PLAYER_TEMPLATE(`${VOCALIZES_BASE_URL}BRRR_1.mp3`)}
                    </div>
                    <div class="pl-4 border-l-2 border-[#FF00BC]/30">
                        <strong class="text-[#FF00BC] text-sm uppercase tracking-wide block mb-1">Fase 2 (Pulsação)</strong>
                        <p class="text-sm text-gray-300">Inspire. Solte o ar com golpes rápidos de "S! S! S!".</p>
                        <p class="text-xs text-gray-400 mt-1">Sinta o abdome "pulando" para fora. Isso é o músculo agindo.</p>
                        ${INLINE_PLAYER_TEMPLATE(`${VOCALIZES_BASE_URL}PAPAPA%203x.mp3`)}
                    </div>
                </div>
            </div>

            <div class="bg-[#FF00BC]/10 border border-[#FF00BC]/20 p-5 rounded-2xl text-center">
                <span class="material-symbols-rounded text-[#FF00BC] text-3xl mb-2">stars</span>
                <h4 class="text-white font-bold text-lg mb-2">A Regra de Ouro</h4>
                <p class="text-sm text-white italic">"Cantar é o ato de impedir que o ar saia todo de uma vez."</p>
                <p class="text-xs text-gray-400 mt-2">Se o ar acaba, você abriu a "torneira" (laringe) demais.</p>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-rounded text-green-500">checklist</span>
                    Check-list de Execução
                </h3>
                <p class="text-xs text-gray-400 mb-3 ml-1">Clique para marcar seu progresso:</p>
                <ul class="space-y-2 text-sm text-gray-300">
                    <li class="checklist-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none" data-id="chk-m12-1">
                        <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                            <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                        </div>
                        <span>Meus ombros ficaram parados na inspiração?</span>
                    </li>
                    <li class="checklist-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none" data-id="chk-m12-2">
                        <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                            <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                        </div>
                        <span>Senti minhas costelas abrirem para os lados?</span>
                    </li>
                    <li class="checklist-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none" data-id="chk-m12-3">
                        <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                            <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                        </div>
                        <span>Minha barriga voltou lentamente (não de uma vez)?</span>
                    </li>
                    <li class="checklist-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none" data-id="chk-m12-4">
                        <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                            <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                        </div>
                        <span>Senti pressão no baixo ventre?</span>
                    </li>
                </ul>
            </div>
          </div>
        `
            },
            {
                id: '1.3',
                title: 'Relaxamento e Liberação Miofascial',
                description: 'Liberação de tensões cervicais e mandibulares.',
                content: `
          <div class="space-y-8 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-[#EE13CA] blur-[80px] opacity-20"></div>
               <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <div class="w-8 h-8 rounded-lg bg-[#EE13CA]/20 flex items-center justify-center text-[#EE13CA]">
                          <span class="material-symbols-rounded">self_improvement</span>
                       </div>
                       1. O Conceito: O Que é Fáscia?
                   </h3>
                   <p class="text-sm text-gray-300 leading-relaxed mb-4">
                       A fáscia é uma membrana que envolve todos os seus músculos. Quando você está estressado ou pratica com má postura, essa membrana "encurta" e endurece.
                   </p>
                   <div class="p-3 bg-[#FF00BC]/10 border border-[#FF00BC]/20 rounded-xl">
                      <p class="text-xs text-pink-200">
                         <strong>⚠️ Perigo Vocal:</strong> No canto, as tensões mais perigosas estão no Masseter (mandíbula) e nos Esternocleidomastóideos (laterais do pescoço).
                      </p>
                   </div>
               </div>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] text-sm font-bold">2</span>
                    Protocolo de Liberação (Prática)
                </h3>
                
                <div class="space-y-6">
                    <div class="relative pl-4 border-l-2 border-[#6F4CE7]/30">
                        <strong class="text-[#6F4CE7] text-sm uppercase tracking-wide block mb-2">A. Liberação de Mandíbula (Masseter)</strong>
                        <p class="text-sm text-gray-300 mb-3">Este é o músculo mais forte do corpo. Se travar, sua boca não abre para as vogais.</p>
                        
                        <div class="bg-black/20 p-3 rounded-xl border border-white/5 mb-3">
                            <strong class="text-white text-xs block mb-1">Ação:</strong>
                            <p class="text-xs text-gray-400">Faça movimentos circulares firmes no ângulo da mandíbula (perto da orelha).</p>
                        </div>

                        <div class="flex gap-2 items-center text-xs text-[#FF00BC] font-medium bg-[#FF00BC]/10 p-2 rounded-lg">
                           <span class="material-symbols-rounded text-sm">lightbulb</span>
                           O "Pulo do Gato": Deixe a boca entreaberta e a língua "boba".
                        </div>
                    </div>

                    <div class="relative pl-4 border-l-2 border-[#6F4CE7]/30">
                        <strong class="text-[#6F4CE7] text-sm uppercase tracking-wide block mb-2">B. Base da Língua (Supra-hióideos)</strong>
                        <p class="text-sm text-gray-300 mb-3">Tensão aqui empurra a laringe, gerando som "espremido".</p>
                        
                        <div class="bg-black/20 p-3 rounded-xl border border-white/5 mb-3">
                            <strong class="text-white text-xs block mb-1">Ação:</strong>
                            <p class="text-xs text-gray-400">Pressione levemente com os polegares logo abaixo do queixo (parte mole).</p>
                        </div>
                        
                        <div class="text-xs text-yellow-500 font-medium">
                           ⚠️ Se estiver duro ou dolorido, você está tensionando a língua.
                        </div>
                    </div>

                    <div class="relative pl-4 border-l-2 border-[#6F4CE7]/30">
                        <strong class="text-[#6F4CE7] text-sm uppercase tracking-wide block mb-2">C. Alongamento do "Eixo X"</strong>
                        <p class="text-sm text-gray-300 mb-3">Incline a cabeça para o lado e pressione o ombro oposto para baixo.</p>
                        <div class="bg-[#6F4CE7]/10 p-3 rounded-xl border border-[#6F4CE7]/20">
                            <strong class="text-[#6F4CE7] text-xs block mb-1">Diferencial Vocacional:</strong>
                            <p class="text-xs text-gray-300">Emita um som suave de "U" enquanto alonga. Se oscilar, há tensão residual.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-[#151a24] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-10"></div>
                 <div class="relative z-10">
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span class="w-8 h-8 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-sm font-bold">3</span>
                        Exercício Dinâmico: O "Bocejo Real"
                    </h3>
                    <p class="text-sm text-gray-400 mb-4">O melhor exercício natural de liberação para cantores.</p>
                    
                    <ol class="space-y-4 relative">
                        <li class="flex gap-4 items-center">
                            <span class="text-2xl font-bold text-white/10">1</span>
                            <p class="text-sm text-gray-300">Inicie um bocejo propositalmente.</p>
                        </li>
                        <li class="flex gap-4 items-center">
                            <span class="text-2xl font-bold text-white/10">2</span>
                            <p class="text-sm text-gray-300">Sinta o palato mole subir e a laringe descer.</p>
                        </li>
                        <li class="flex gap-4 items-center">
                            <span class="text-2xl font-bold text-white/10">3</span>
                            <p class="text-sm text-gray-300">No topo do bocejo, solte um suspiro sonoro: <span class="text-white font-serif italic">"Ahhhhhh"</span>.</p>
                        </li>
                    </ol>
                    ${INLINE_PLAYER_TEMPLATE(`${VOCALIZES_BASE_URL}BRRR%20DOWN.mp3`)}
                    
                    <div class="mt-6 text-center">
                       <p class="text-xs text-[#0081FF] font-bold uppercase tracking-widest mb-1">Objetivo</p>
                       <p class="text-sm text-white">Sentir o "espaço" que se cria no fundo da garganta.</p>
                    </div>
                 </div>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-rounded text-green-500">checklist</span>
                    Check-list de Monitoramento
                </h3>
                <p class="text-xs text-gray-400 mb-3 ml-1">Clique para marcar seu progresso:</p>
                <ul class="space-y-2 text-sm text-gray-300">
                    <li class="checklist-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none" data-id="chk-m13-1">
                        <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                           <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                        </div>
                        <span>Minha mandíbula cai livremente ("abobado")?</span>
                    </li>
                    <li class="checklist-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none" data-id="chk-m13-2">
                        <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                           <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                        </div>
                        <span>Giro o pescoço 360º sem estalos ou dor?</span>
                    </li>
                    <li class="checklist-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none" data-id="chk-m13-3">
                        <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                           <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                        </div>
                        <span>Minha língua está relaxada atrás dos dentes?</span>
                    </li>
                </ul>
            </div>

            <div class="p-5 rounded-2xl border border-dashed border-white/10 bg-white/5">
               <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span class="material-symbols-rounded text-[#0081FF]">mic</span>
                  Desafio de Relaxamento
               </h3>
               <p class="text-xs text-gray-400 mb-3">
                  Grave um áudio falando "Lá-Lá-Lá-Lá" movendo apenas a ponta da língua, sem mexer o queixo.
               </p>
               <div class="bg-black/30 p-3 rounded-lg text-xs text-gray-500 italic">
                  Se a voz soar travada, sua mandíbula está acompanhando o movimento. Volte à liberação do Masseter.
               </div>
            </div>
          </div>
        `
            }
        ]
    },
    {
        id: 'm2',
        number: '02',
        title: 'O Ritual',
        subtitle: 'Aquecimento e Condicionamento',
        description: 'O seu hub diário. Prepare a voz antes de cantar e recupere-a depois.',
        topics: [
            {
                id: '2.1',
                title: 'A Ciência do Aquecimento (TVSF)',
                description: 'Entenda a física por trás dos tubos e vibrações.',
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
                    <div class="relative z-10">
                        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span class="w-8 h-8 rounded-lg bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-sm font-bold">1</span>
                            O que é TVSF e por que funciona?
                        </h3>
                        <p class="text-sm text-gray-300 leading-relaxed mb-4">
                            Para explicar o aquecimento vocal focado em <strong>Técnicas de Vocalização em Tubo com Sobrecarga</strong> e exercícios de trato vocal semi-ocluído, precisamos ir além da prática e entender a física por trás do processo.
                        </p>
                        <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                            <strong class="text-[#0081FF] block text-xs uppercase tracking-wide mb-2">Impedância Acústica</strong>
                            <p class="text-sm text-gray-300 leading-relaxed">
                                Quando você semi-oclui a boca (lábios ou tubo), ocorre um fenômeno onde parte da pressão do ar "bate" na resistência e volta para as pregas vocais.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-rounded text-[#6F4CE7]">verified</span>
                        Por que usar?
                    </h3>
                    <ul class="space-y-3">
                        <li class="flex gap-3">
                            <span class="material-symbols-rounded text-green-500 mt-0.5">check_circle</span>
                            <div>
                                <strong class="text-white text-sm block">Efeito Protetor</strong>
                                <p className="text-xs text-gray-400">Afasta as pregas vocais ligeiramente, evitando que elas colidam com força excessiva.</p>
                            </div>
                        </li>
                        <li class="flex gap-3">
                            <span class="material-symbols-rounded text-green-500 mt-0.5">check_circle</span>
                            <div>
                                <strong class="text-white text-sm block">Eficiência</strong>
                                <p className="text-xs text-gray-400">Reduz o esforço fonatório, tornando a vibração mais eficiente com menos pressão.</p>
                            </div>
                        </li>
                        <li class="flex gap-3">
                            <span class="material-symbols-rounded text-green-500 mt-0.5">check_circle</span>
                            <div>
                                <strong class="text-white text-sm block">Massagem Interna</strong>
                                <p className="text-xs text-gray-400">Massageia a mucosa das pregas vocais através da variação de pressão.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="border border-[#FF00BC]/30 bg-[#FF00BC]/5 rounded-2xl p-5 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-20 h-20 bg-[#FF00BC] blur-[60px] opacity-10"></div>
                    <h3 class="text-lg font-bold text-pink-200 mb-4 flex items-center gap-2 relative z-10">
                        <span class="material-symbols-rounded text-[#FF00BC]">warning</span>
                        Perspectiva Crítica
                    </h3>
                    <div class="relative z-10 text-sm text-gray-300 leading-relaxed">
                        <p class="mb-2">Muitos professores tratam o aquecimento como um "ritual" mecânico. No entanto, para a <strong>Voz que Conquista</strong>, o foco deve ser a <strong>propriocepção</strong>.</p>
                        <p className="italic text-pink-200">
                            "Se você faz o tubo, mas continua tensionando o pescoço ou a língua, o exercício perde 80% da eficácia."
                        </p>
                        <p className="mt-2 text-xs">O objetivo não é apenas "aquecer" o músculo, mas calibrar a coordenação entre respiração e prega vocal.</p>
                    </div>
                </div>
            </div>
        `
            },
            {
                id: '2.2',
                title: 'Rotina Prática Guiada',
                description: 'Sequência de 5 a 8 minutos: Vibração, Humming e Tubos.',
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] font-bold">1</div>
                        <h3 class="text-lg font-bold text-white">BRRR (Vibração de Lábios)</h3>
                    </div>
                    <p class="text-sm text-gray-300 mb-4">
                        É o ponto de partida clássico. A vibração de lábios (<i>brrr</i>) ou língua (<i>trrr</i>) cria uma oscilação constante de baixa frequência.
                    </p>
                    <div class="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                        <p class="text-xs text-gray-300"><strong>Objetivo:</strong> Relaxar a musculatura perioral e equilibrar o fluxo de ar.</p>
                        <p class="text-xs text-gray-300"><strong>Como fazer:</strong> Emita um som contínuo e confortável. Se tiver dificuldade, pressione levemente os cantos da boca.</p>
                        <p class="text-xs text-[#FF00BC] italic">Atenção: Se a vibração parar, você está ou segurando o ar demais ou soltando-o sem controle.</p>
                    </div>
                    ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/Long%20Scale%20(H)%20-%20Synthetic-1650753786.mp3`)}
                </div>

                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-lg bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] font-bold">2</div>
                        <h3 class="text-lg font-bold text-white">Humming (Zumbido)</h3>
                    </div>
                    <p class="text-sm text-gray-300 mb-4">
                        O famoso som de "M" com a boca fechada (<i>mmm</i>).
                    </p>
                    <div class="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                        <p class="text-xs text-gray-300"><strong>Objetivo:</strong> Transferir o foco da ressonância da garganta para a face ("máscara").</p>
                        <p class="text-xs text-gray-300"><strong>Como fazer:</strong> Os dentes não devem se encostar. Sinta the vibração nos lábios e nos ossos da face.</p>
                        <p class="text-xs text-yellow-500 italic">Teste: Se você sentir a garganta "apertar", o som está muito recuado.</p>
                    </div>
                    ${INLINE_PLAYER_TEMPLATE(`${VOCALIZES_BASE_URL}BRRR_1.mp3`)}
                </div>

                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-lg bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] font-bold">3</div>
                        <h3 class="text-lg font-bold text-white">Tubos (Alta Resistência)</h3>
                    </div>
                    <p class="text-sm text-gray-300 mb-4">
                        Uso de tubos de ressonância (Lax Vox ou silicone) mergulhados em água. O borbulhar cria uma massagem hidrodinâmica.
                    </p>
                    <ul class="space-y-3">
                         <li class="flex gap-3 p-2 rounded bg-white/5">
                            <span class="material-symbols-rounded text-[#0081FF] text-sm mt-0.5">looks_one</span>
                            <div>
                                <strong class="text-white text-xs block">Inércia</strong>
                                <p className="text-[10px] text-gray-400">Comece soprando pelo tubo sem produzir som (apenas fluxo).</p>
                            </div>
                        </li>
                        <li class="flex gap-3 p-2 rounded bg-white/5">
                            <span class="material-symbols-rounded text-[#0081FF] text-sm mt-0.5">looks_two</span>
                            <div>
                                <strong class="text-white text-xs block">Fonação em nota única</strong>
                                <p className="text-[10px] text-gray-400">Emita um som confortável focando na estabilidade das bolhas.</p>
                            </div>
                        </li>
                        <li class="flex gap-3 p-2 rounded bg-white/5">
                            <span class="material-symbols-rounded text-[#0081FF] text-sm mt-0.5">looks_3</span>
                            <div>
                                <strong class="text-white text-xs block">Glissandos</strong>
                                <p className="text-[10px] text-gray-400">Suba e desça a altura da nota suavemente (uivo). O tubo protege na passagem.</p>
                            </div>
                        </li>
                    </ul>
                    ${INLINE_PLAYER_TEMPLATE(`${VOCALIZES_BASE_URL}BRRR%20DOWN.mp3`)}
                </div>
            </div>
        `
            },
            {
                id: '2.3',
                title: 'Desaquecimento (Cool-down)',
                description: 'Essencial após treinos intensos (Módulo 07).',
                content: `
             <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 text-center">
                    <span class="material-symbols-rounded text-4xl text-[#0081FF] mb-4">ac_unit</span>
                    <h3 className="text-xl font-bold text-white mb-2">Retorno ao Repouso</h3>
                    <p className="text-sm text-gray-300 mb-6">
                        Assim como um atleta alonga após a corrida, sua voz precisa voltar ao registro de fala suavemente após cantar notas extremas.
                    </p>
                    <div className="text-left space-y-3">
                        <div className="p-3 border border-white/10 rounded-xl">
                            <strong className="block text-white text-sm mb-1">1. Bocejo-Suspiro</strong>
                            <p className="text-xs text-gray-400">Desça do agudo ao grave com um som de "Haaaa" muito suave e aerado.</p>
                        </div>
                        <div className="p-3 border border-white/10 rounded-xl">
                            <strong className="block text-white text-sm mb-1">2. Fry Relaxado</strong>
                            <p className="text-xs text-gray-400">Emita aquele som de "porta rangendo" sem apertar a garganta. Isso relaxa o músculo TA.</p>
                        </div>
                    </div>
                    ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR%20DOWN.mp3`)}
                </div>
             </div>
        `
            }
        ]
    },
    // MÓDULO 03 - RESPIRAÇÃO (NÍVEL 1: PROPRIOCEPÇÃO)
    {
        id: 'm_breath',
        number: '03',
        title: 'Respiração',
        subtitle: 'Nível 1: Propriocepção',
        description: 'Localize, expanda e sinta. A fundação biomecânica.',
        topics: [
            {
                id: '3.1',
                title: 'O Despertar do Diafragma',
                description: 'Localizando o músculo motor.',
                content: `
                <div class="space-y-8 font-sans">
                    <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] animate-pulse">
                                <span className="material-symbols-rounded text-4xl">accessibility_new</span>
                            </div>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-4 text-center">Onde está o motor?</h3>
                        <p class="text-sm text-gray-300 leading-relaxed mb-6">
                            Muitos alunos respiram "alto" (peito/ombros) por ansiedade. O diafragma é um músculo que separa o tórax do abdome. Para ativá-lo, precisamos anular os ombros.
                        </p>
                        
                        <div class="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                            <strong class="text-[#0081FF] text-xs uppercase tracking-wide block">O Exercício do Livro</strong>
                            <ol class="list-decimal list-inside text-sm text-gray-300 space-y-2">
                                <li>Deite-se no chão (decúbito dorsal).</li>
                                <li>Coloque um livro pesado sobre o umbigo.</li>
                                <li><strong>Inspire:</strong> Tente "empurrar" o livro para o teto apenas com a barriga.</li>
                                <li><strong>Expire:</strong> Deixe o livro descer lentamente.</li>
                            </ol>
                            <div class="p-3 bg-[#FF00BC]/10 rounded-lg border border-[#FF00BC]/20 text-xs text-pink-200">
                                <strong>⚠️ Atenção:</strong> Se o peito subir junto com o livro, você está "roubando". Isole o movimento abdominal.
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-[#0081FF]/10 to-transparent p-5 rounded-2xl border border-[#0081FF]/30">
                        <h4 class="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <span class="material-symbols-rounded text-[#0081FF]">record_voice_over</span>
                            O Elo Perdido (Conexão Sonora)
                        </h4>
                        <p class="text-xs text-gray-400 mb-3">
                            Para não dissociar o treino da voz: Inspire elevando o livro e, na descida, faça um <strong>Humming (Mmmm)</strong> mantendo o peso do livro "sustentado" por 2 segundos antes de relaxar.
                        </p>
                        ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR_1.mp3`)}
                    </div>
                </div>
            `
            },
            {
                id: '3.2',
                title: 'A Expansão 360º',
                description: 'Costelas e Costas (Intercostais).',
                content: `
                <div class="space-y-8 font-sans">
                    <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-[#6F4CE7] blur-[80px] opacity-20"></div>
                        <div class="relative z-10">
                            <h3 class="text-lg font-bold text-white mb-4">Respiração não é só "frente"</h3>
                            <p class="text-sm text-gray-300 leading-relaxed mb-6">
                                Imagine que sua cintura é um balão que infla para todos os lados, não apenas para a frente. O verdadeiro volume de ar está na expansão lateral e posterior (costas).
                            </p>
                            
                            <div class="flex justify-center my-6">
                                <div class="w-32 h-32 border-4 border-dashed border-[#6F4CE7] rounded-full flex items-center justify-center relative">
                                    <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A202C] px-2 text-[10px] text-gray-400">Costas</div>
                                    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#1A202C] px-2 text-[10px] text-gray-400">Barriga</div>
                                    <div class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A202C] px-2 text-[10px] text-gray-400 rotate-90">Esq</div>
                                    <div class="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-[#1A202C] px-2 text-[10px] text-gray-400 rotate-90">Dir</div>
                                    <span class="material-symbols-rounded text-3xl text-white animate-ping">open_in_full</span>
                                </div>
                            </div>

                            <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                                <strong class="text-[#6F4CE7] text-xs uppercase tracking-wide block mb-2">Exercício Prático</strong>
                                <p class="text-sm text-gray-300">
                                    Coloque as mãos nas "costelas flutuantes" (parte lateral inferior). Ao inspirar, tente empurrar suas mãos para fora.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-[#6F4CE7]/10 to-transparent p-5 rounded-2xl border border-[#6F4CE7]/30">
                        <h4 class="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <span class="material-symbols-rounded text-[#6F4CE7]">record_voice_over</span>
                            O Elo Perdido (Sopro com Som)
                        </h4>
                        <p class="text-xs text-gray-400 mb-3">
                            Inspire expandindo as mãos. Agora, solte um som de <strong>"ZZZZ"</strong> contínuo, mas tente <strong>NÃO</strong> deixar as costelas murcharem imediatamente. Mantenha as mãos "empurradas" enquanto o som sai.
                        </p>
                        ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR_1.mp3`)}
                    </div>
                </div>
            `
            },
            {
                id: '3.3',
                title: 'O Vácuo e a Pressão',
                description: 'Consciência da musculatura interna.',
                content: `
                <div class="space-y-8 font-sans">
                    <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                        <h3 class="text-lg font-bold text-white mb-4">Sinta, não imagine.</h3>
                        <p class="text-sm text-gray-300 leading-relaxed mb-4">
                            Muitas vezes respiramos "frouxo". Precisamos sentir a pressão interna que sustentará a nota aguda. Para isso, usaremos o Vácuo.
                        </p>
                        
                        <div class="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                            <div class="flex items-start gap-3">
                                <span class="material-symbols-rounded text-[#FF00BC] mt-0.5">filter_1</span>
                                <p class="text-sm text-gray-300">Solte todo o ar do pulmão até não sobrar nada.</p>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="material-symbols-rounded text-[#FF00BC] mt-0.5">filter_2</span>
                                <p class="text-sm text-gray-300">Tape o nariz e feche a boca.</p>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="material-symbols-rounded text-[#FF00BC] mt-0.5">filter_3</span>
                                <p class="text-sm text-gray-300">Tente inspirar com força (sem deixar o ar entrar). Você sentirá suas costelas e abdome expandirem violentamente a vácuo. <strong>Essa é a musculatura que você precisa!</strong></p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-[#FF00BC]/10 to-transparent p-5 rounded-2xl border border-[#FF00BC]/30">
                        <h4 class="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <span class="material-symbols-rounded text-[#FF00BC]">record_voice_over</span>
                            O Elo Perdido (Apoio Ativo)
                        </h4>
                        <p class="text-xs text-gray-400 mb-3">
                            Faça o vácuo. Segure por 3 segundos sentindo a abertura. Destampe o nariz e deixe o ar entrar passivamente, transformando imediatamente em um som de <strong>"VVVV"</strong> firme e estável.
                        </p>
                        ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR_1.mp3`)}
                    </div>
                </div>
            `
            },
            {
                id: '3.4',
                title: 'O Check-up da Tensão',
                description: 'Escaneamento corporal ativo.',
                content: `
                <div class="space-y-8 font-sans">
                    <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                        <h3 class="text-lg font-bold text-white mb-4">O Inimigo Invisível</h3>
                        <p class="text-sm text-gray-300 leading-relaxed mb-6">
                            Muitos alunos respiram "corretamente" com o diafragma, mas travam a mandíbula ou o pescoço no processo. Respirar deve ser um ato livre de tensão superior.
                        </p>

                        <div class="space-y-2">
                            <div class="checklist-item flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" data-id="chk-prop-1">
                                <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                                    <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                                </div>
                                <span class="text-sm text-gray-300">Minha mandíbula está solta durante a inspiração?</span>
                            </div>
                            <div class="checklist-item flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" data-id="chk-prop-2">
                                <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                                    <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                                </div>
                                <span class="text-sm text-gray-300">Meus ombros permaneceram baixos?</span>
                            </div>
                            <div class="checklist-item flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" data-id="chk-prop-3">
                                <div class="checkbox-box w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all bg-[#1A202C]">
                                    <span class="material-symbols-rounded text-sm text-white opacity-0 check-icon scale-0 transition-all">check</span>
                                </div>
                                <span class="text-sm text-gray-300">Consigo girar o pescoço enquanto respiro fundo?</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-r from-green-500/10 to-transparent p-5 rounded-2xl border border-green-500/30">
                        <h4 class="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <span class="material-symbols-rounded text-green-500">record_voice_over</span>
                            O Elo Perdido (Movimento com Som)
                        </h4>
                        <p class="text-xs text-gray-400 mb-3">
                            Faça um movimento circular lento com a cabeça (pescoço). Durante o movimento, inspire e solte um <strong>Humming</strong>. Se o som falhar ou "tremer" em algum ponto do giro, ali existe uma tensão a ser liberada.
                        </p>
                        ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR_1.mp3`)}
                    </div>
                </div>
            `
            }
        ]
    },
    {
        id: 'm3',
        number: '04',
        title: 'Técnica de Emissão',
        subtitle: 'Registros e Agilidade',
        description: 'O núcleo da agilidade e controle vocal.',
        topics: [
            { id: '3.1', title: 'Registro de Peito (M1)', description: 'Fortalecimento do TA.' },
            { id: '3.2', title: 'Registro de Cabeça (M2)', description: 'Estiramento via CT.' },
            { id: '3.3', title: 'Mix Vocal (Bridge)', description: 'Eliminando a quebra vocal.' },
            { id: '3.4', title: 'Agilidade', description: 'Escalas e precisão.' }
        ]
    },
    {
        id: 'm4',
        number: '05',
        title: 'Ressonância e Articulação',
        subtitle: 'Cor e Projeção',
        description: 'Onde o som ganha identidade.',
        topics: [
            { id: '4.1', title: 'Ajustes de Trato Vocal', description: 'Posicionamento de laringe e palato.' },
            { id: '4.2', title: 'Dicção e Fonética', description: 'Vowel Shaping, Legato e Staccato.' },
            { id: '4.3', title: 'Projeção (Twang)', description: 'Ganho de volume sem esforço.' }
        ]
    },
    {
        id: 'm5',
        number: '06',
        title: 'Mudança de Registro Vocal',
        subtitle: 'A Arte da Conexão',
        description: 'Coordenação neuromuscular para transitar entre registros sem quebras.',
        topics: [
            {
                id: '5.1',
                title: '1. Aula Teórica: A Ciência da Transição',
                description: 'Entendendo a mecânica da voz mista.',
                content: `
          <div class="space-y-8 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[80px] opacity-10"></div>
                <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span class="material-symbols-rounded text-[#FF00BC]">psychology</span>
                      O que é esta técnica?
                   </h3>
                   <p class="text-sm text-gray-300 leading-relaxed mb-4">
                      A Mudança de Registro é a coordenação neuromuscular que permite ao cantor transitar entre diferentes ajustes laríngeos sem quebras, fendas ou tensões. Assita dominar a "Terceira Via".
                   </p>
                   <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                      <strong class="text-[#FF00BC] text-xs uppercase tracking-wide block mb-2">Fisiologia</strong>
                      <p class="text-sm text-gray-300">
                         Trata-se da transição de dominância entre o músculo <strong>TA</strong> (Tireoaritenoideo - voz de peito) e o músculo <strong>CT</strong> (Cricotireoideo - voz de cabeça).
                      </p>
                      <p class="text-sm text-gray-300 mt-2">
                         O domínio resulta na <strong>Voz Mista (Mixed Voice)</strong>, onde corpo (massa) e brilho (alongamento) se fundem.
                      </p>
                   </div>
                </div>
             </div>

             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4">Conceitos Fundamentais</h3>
                <div class="space-y-4">
                   <div class="relative pl-4 border-l-2 border-[#6F4CE7]/30">
                      <strong class="text-[#6F4CE7] text-sm block mb-1">Mecanismos Vocais (M1 e M2)</strong>
                      <p class="text-xs text-gray-400">Como as pregas vocais mudam de forma: de curtas e espessas (M1) para longas e finas (M2).</p>
                   </div>
                   <div class="relative pl-4 border-l-2 border-[#6F4CE7]/30">
                      <strong class="text-[#6F4CE7] text-sm block mb-1">O Ponto de Quebra</strong>
                      <p class="text-xs text-gray-400">Por que a voz "falha"? Tentativa de levar peso excessivo (massa) para o agudo sem alongamento.</p>
                   </div>
                   <div class="relative pl-4 border-l-2 border-[#6F4CE7]/30">
                      <strong class="text-[#6F4CE7] text-sm block mb-1">Apoio e Pressão Subglótica</strong>
                      <p class="text-xs text-gray-400">O fluxo de ar constante dá à laringe a "permissão" para mudar de registro sem travar.</p>
                   </div>
                   <div class="relative pl-4 border-l-2 border-[#6F4CE7]/30">
                      <strong class="text-[#6F4CE7] text-sm block mb-1">Vowel Modification</strong>
                      <p class="text-xs text-gray-400">A técnica de "escurecer" ou fechar levemente as vogais no passaggio para evitar o grito.</p>
                   </div>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '5.2',
                title: '2. Prática Guiada',
                description: 'Exercícios de conexão e mix.',
                content: `
          <div class="space-y-8 font-sans">
             <!-- VÍDEO 1 -->
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <div class="flex items-center gap-3 mb-4">
                   <div class="w-10 h-10 rounded-lg bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                      <span class="material-symbols-rounded">play_circle</span>
                   </div>
                   <div>
                      <h3 class="text-lg font-bold text-white">Vídeo 1: Conexão e Fluxo</h3>
                      <p class="text-xs text-gray-400">Exercícios de Trato Vocal Semi-Ocluído</p>
                   </div>
                </div>
                
                <div class="bg-black/40 border border-white/5 rounded-xl h-32 flex flex-col items-center justify-center gap-2 mb-4">
                   <span class="material-symbols-rounded text-gray-500 text-3xl">lock</span>
                   <span class="text-gray-400 text-sm font-medium">Ativo somente para assinantes</span>
                </div>

                <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                   <strong class="text-white text-xs block mb-1">Exercício: Lip/Tongue Trill</strong>
                   <p class="text-xs text-gray-300">Vibração de lábios ou língua em glissando. Observe a ausência de "pulos" no som.</p>
                </div>
             </div>

             <!-- ÁUDIO A -->
             <div class="bg-gradient-to-r from-[#1A202C] to-[#151a24] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-2">Áudio de Treino A: O "Nga"</h3>
                <p class="text-xs text-gray-400 mb-4">Ressonância Nasofaringea para facilitar o mix.</p>
                
                <div class="bg-black/40 border border-white/5 rounded-xl h-20 flex items-center justify-center gap-2 mb-3">
                   <span class="material-symbols-rounded text-gray-500 text-xl">lock</span>
                   <span class="text-gray-400 text-xs font-medium">Ativo somente para assinantes</span>
                </div>

                <p class="text-xs text-gray-400 italic">
                   Foco: O som anasalado isola a musculatura alta, facilitando o agudo sem perder o fechamento.
                </p>
             </div>

             <!-- VÍDEO 2 -->
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <div class="flex items-center gap-3 mb-4">
                   <div class="w-10 h-10 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                      <span class="material-symbols-rounded">play_circle</span>
                   </div>
                   <div>
                      <h3 class="text-lg font-bold text-white">Vídeo 2: O Registro Misto</h3>
                      <p class="text-xs text-gray-400">A "Terceira Via"</p>
                   </div>
                </div>
                
                <div class="bg-black/40 border border-white/5 rounded-xl h-32 flex flex-col items-center justify-center gap-2 mb-4">
                   <span class="material-symbols-rounded text-gray-500 text-3xl">lock</span>
                   <span class="text-gray-400 text-sm font-medium">Ativo somente para assinantes</span>
                </div>

                <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                   <strong class="text-white text-xs block mb-1">Exercício: "Gee" ou "Goo"</strong>
                   <p class="text-xs text-gray-300">O "G" ajuda no fechamento, as vogais fechadas estabilizam a laringe.</p>
                </div>
             </div>

             <!-- ÁUDIO B -->
             <div class="bg-gradient-to-r from-[#1A202C] to-[#151a24] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-2">Áudio de Treino B: Semitonalidades</h3>
                <p class="text-xs text-gray-400 mb-4">Focando na zona de passagem (D4-G4 Homens / D5-G5 Mulheres).</p>
                
                <div class="bg-black/40 border border-white/5 rounded-xl h-20 flex items-center justify-center gap-2 mb-3">
                   <span class="material-symbols-rounded text-gray-500 text-xl">lock</span>
                   <span class="text-gray-400 text-xs font-medium">Ativo somente para assinantes</span>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '5.3',
                title: '3. Diagnóstico de Erros Comuns',
                description: 'O que evitar na prática.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <span class="material-symbols-rounded text-red-500">error</span>
                   Armadilhas do Passaggio
                </h3>
                
                <div class="space-y-3">
                   <div class="p-3 border border-red-500/20 bg-red-500/5 rounded-xl">
                      <strong class="text-red-400 text-sm block mb-1">Soprosidade Excessiva</strong>
                      <p class="text-xs text-gray-300">
                         Quando o aluno "desiste" da conexão e cai em um falsete puro, sem corpo. Mantenha a adução!
                      </p>
                   </div>
                   <div class="p-3 border border-red-500/20 bg-red-500/5 rounded-xl">
                      <strong class="text-red-400 text-sm block mb-1">"Grito" (Pulling Chest)</strong>
                      <p class="text-xs text-gray-300">
                         Tentar levar o peso do peito para onde a musculatura CT deveria dominar. Resultado: Quebra abrupta.
                      </p>
                   </div>
                   <div class="p-3 border border-red-500/20 bg-red-500/5 rounded-xl">
                      <strong class="text-red-400 text-sm block mb-1">Laringe Elevada</strong>
                      <p class="text-xs text-gray-300">
                         O "estrangulamento" do som. Relaxe a base da língua; se ela subir, a laringe sobe junto e fecha a passagem.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        `
            }
        ]
    },
    {
        id: 'm6',
        number: '07',
        title: 'Agilidade e Precisão Articulatória',
        subtitle: 'Trava-Línguas',
        description: 'Mantenha a laringe relaxada. Pratique em 3 fases: 1. Sussurrado, 2. Lento/Exagerado, 3. Velocidade Máxima.',
        topics: [
            {
                id: '6.1',
                title: 'Instruções Gerais',
                description: 'Protocolo de Prática (3 Fases)',
                content: `
                <div class="space-y-4 font-sans">
                    <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                        <h3 class="text-lg font-bold text-white mb-4">Protocolo de 3 Fases</h3>
                        <div class="space-y-4">
                            <div class="flex gap-3">
                                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">1</div>
                                <div>
                                    <strong class="text-white">Sussurrado (Whisper)</strong>
                                    <p class="text-sm text-gray-400">Sem som. Foque apenas no movimento muscular exagerado dos lábios e língua.</p>
                                </div>
                            </div>
                            <div class="flex gap-3">
                                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">2</div>
                                <div>
                                    <strong class="text-white">Lento e Exagerado</strong>
                                    <p class="text-sm text-gray-400">Adicione som, mas mantenha a velocidade baixíssima. Abra bem a boca.</p>
                                </div>
                            </div>
                            <div class="flex gap-3">
                                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">3</div>
                                <div>
                                    <strong class="text-white">Velocidade Máxima</strong>
                                    <p class="text-sm text-gray-400">Acelere até o seu limite sem perder a clareza de cada consoante.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
            }
        ]
    },
    {
        id: 'm7',
        number: '08',
        title: 'Alcançar Notas Altas',
        subtitle: 'ACERTE AQUELA NOTA ALTA',
        description: 'Especialização avançada: domine os agudos com segurança e potência (Método Cheryl Porter).',
        topics: [
            {
                id: '7.1',
                title: 'Requisito de Segurança (Controle de Segurança Vocal)',
                description: 'Leia antes de iniciar qualquer exercício deste módulo.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="bg-[#FF00BC]/10 border border-[#FF00BC]/30 p-6 rounded-2xl relative overflow-hidden">
                <div class="absolute -right-4 -top-4 text-[#FF00BC]/10 text-9xl font-bold">!</div>
                <div class="relative z-10">
                   <h3 class="text-xl font-bold text-[#FF00BC] mb-2 flex items-center gap-2">
                      <span class="material-symbols-rounded">block</span>
                      Controle de Segurança Vocal: Pare Agora!
                   </h3>
                   <p class="text-sm text-pink-100 mb-4 font-semibold">
                      O acesso aos exercícios de notas agudas só é permitido após a confirmação do aquecimento técnico.
                   </p>
                   <div class="bg-black/30 p-4 rounded-xl space-y-3">
                      <div class="flex gap-3 items-start">
                         <span class="material-symbols-rounded text-[#FF00BC] shrink-0 mt-0.5">timer</span>
                         <p class="text-xs text-gray-300">Você já realizou pelo menos <strong>15 minutos</strong> de aquecimento hoje? (Módulo 2)</p>
                      </div>
                      <div class="flex gap-3 items-start">
                         <span class="material-symbols-rounded text-[#FF00BC] shrink-0 mt-0.5">graphic_eq</span>
                         <p class="text-xs text-gray-300">Fez exercícios de SOVT (Vibração labial ou canudo) para descomprimir a laringe?</p>
                      </div>
                   </div>
                   <p class="text-xs text-gray-400 mt-4 italic">Se a resposta for "NÃO", volte ao Módulo 2. Tentar alcançar notas altas "a frio" pode causar danos sérios às pregas vocais.</p>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '7.2',
                title: 'Diretrizes Técnicas e a Analogia do Bolo',
                description: 'Entendendo a construção da voz aguda.',
                content: `
          <div class="space-y-8 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <span class="material-symbols-rounded text-[#0081FF]">accessibility_new</span>
                   Postura de Poder
                </h3>
                <ul class="space-y-3">
                   <li class="flex gap-3">
                      <span class="material-symbols-rounded text-[#0081FF] text-sm mt-0.5">check_circle</span>
                      <p class="text-sm text-gray-300"><strong>Cabeça Reta:</strong> Proibido levantar o queixo para "alcançar" a nota. Isso fecha a garganta.</p>
                   </li>
                   <li class="flex gap-3">
                      <span class="material-symbols-rounded text-[#0081FF] text-sm mt-0.5">check_circle</span>
                      <p class="text-sm text-gray-300"><strong>Imagem Mental:</strong> Trate sua voz como um elástico (macio e flexível), não como um martelo.</p>
                   </li>
                </ul>
             </div>

             <div class="bg-gradient-to-br from-[#1A202C] to-[#251A2C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[80px] opacity-20"></div>
                <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <span class="material-symbols-rounded text-[#FF00BC]">cake</span>
                   A Analogia do Bolo (Método CP)
                </h3>
                
                <div class="space-y-4 relative z-10">
                   <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                      <strong class="text-[#FF00BC] text-xs uppercase tracking-wide block mb-1">1. Os Ingredientes (Registros)</strong>
                      <p class="text-sm text-gray-300">São suas matérias-primas: Peito (força), Cabeça (leveza) e Mix.</p>
                      ${INLINE_PLAYER_TEMPLATE(`${VOCALIZES_BASE_URL}PAPAPA%203x.mp3`)}
                   </div>
                   
                   <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                      <strong class="text-[#6F4CE7] text-xs uppercase tracking-wide block mb-1">2. O Liquidificador (Passaggio)</strong>
                      <p class="text-sm text-gray-300">O segredo não é ter os ingredientes, é misturá-los. O Passaggio deve ser invisível, sem quebras.</p>
                      ${INLINE_PLAYER_TEMPLATE(`${VOCALIZES_BASE_URL}BRRR%20DOWN.mp3`)}
                   </div>

                   <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                      <strong class="text-[#0081FF] text-xs uppercase tracking-wide block mb-1">3. O Granulado (Whistle)</strong>
                      <p class="text-sm text-gray-300">Efeitos especiais e superagudos (Fischio). É o acabamento, não a base.</p>
                   </div>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '7.3',
                title: 'Regras de Saúde Vocal (Logística)',
                description: 'Protocolos de manutenção para cantores de alta performance.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="grid gap-3">
                <div class="bg-[#1A202C] p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                   <div class="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <span class="material-symbols-rounded">water_drop</span>
                   </div>
                   <div>
                      <strong class="text-white text-sm block">Hidratação Estratégica</strong>
                      <p class="text-xs text-gray-400">Água fresca ou chá morno. Nunca gelado durante o treino.</p>
                   </div>
                </div>

                <div class="bg-[#1A202C] p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                   <div class="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                      <span class="material-symbols-rounded">no_food</span>
                   </div>
                   <div>
                      <strong class="text-white text-sm block">Restrição Alimentar</strong>
                      <p class="text-xs text-gray-400">Zero laticínios antes da prática. Eles geram muco que atrapalha os agudos.</p>
                   </div>
                </div>

                <div class="bg-[#1A202C] p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                   <div class="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <span class="material-symbols-rounded">bedtime</span>
                   </div>
                   <div>
                      <strong class="text-white text-sm block">Ciclo de Descanso</strong>
                      <p class="text-xs text-gray-400">Regra de Ouro: 5 dias de treino, 2 dias de repouso absoluto.</p>
                   </div>
                </div>
             </div>
          </div>
        `
            }
        ]
    },
    {
        id: 'm8',
        number: '09',
        title: 'Voz Forte e Ressonante',
        subtitle: 'Potência e Saúde',
        description: 'Desenvolva força vocal real sem gritar, usando a metodologia de resistência e ressonância.',
        topics: [
            {
                id: '8.1',
                title: 'Fase 1: Aquecimento',
                description: 'Preparação suave para evitar tensão.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
                <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <span class="material-symbols-rounded text-[#0081FF]">heat</span>
                      Não comece "frio"!
                   </h3>
                   <p class="text-sm text-gray-300 mb-4">
                      O segredo para uma voz forte não é a força bruta, mas a coordenação. Começamos relaxando a laringe.
                   </p>
                   
                   <div class="space-y-3">
                      <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                         <strong class="text-[#0081FF] text-xs uppercase tracking-wide block mb-1">1. BRRR (Vibração de Lábios)</strong>
                         <p class="text-sm text-gray-300 mb-2">Mantenha a energia constante. Se sentir falhas, pressione levemente as bochechas.</p>
                         ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR_1.mp3`)}
                      </div>

                      <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                         <strong class="text-[#0081FF] text-xs uppercase tracking-wide block mb-1">2. Bochechas Infladas (Baiacu)</strong>
                         <p class="text-sm text-gray-300 mb-2">Encha as bochechas de ar enquanto emite o som. Isso cria contrapressão e protege as pregas vocais.</p>
                         ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/VVVV%20-%20UP%20DPWN%20C.mp3`)}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '8.2',
                title: 'Fase 2: Construção de Força',
                description: 'Voz de peito com segurança.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <span class="material-symbols-rounded text-[#FF00BC]">fitness_center</span>
                   Voz de Peito vs. Grito
                </h3>
                <p class="text-sm text-gray-300 mb-4">
                   Potência não é grito. Grito fecha a garganta; potência abre a ressonância.
                </p>

                <div class="bg-gradient-to-r from-[#FF00BC]/10 to-transparent p-4 rounded-xl border border-[#FF00BC]/20 mb-4">
                   <strong class="text-[#FF00BC] text-sm block mb-1">Exercício Chave: "MA"</strong>
                   <ul class="list-disc list-inside text-xs text-gray-300 space-y-1 mb-3">
                      <li>Abaixe levemente o queixo.</li>
                      <li>A língua deve encostar nos dentes inferiores.</li>
                      <li>Comece médio e aumente o volume gradualmente.</li>
                   </ul>
                   ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/MA%20MA%20MA.mp3`)}
                </div>
             </div>
          </div>
        `
            },
            {
                id: '8.3',
                title: 'Fase 3: Equilíbrio e Resistência',
                description: 'Tirando a tensão e ganhando fôlego.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4">Reequilíbrio e Resistência</h3>
                <p class="text-sm text-gray-300 mb-6">
                   Após usar força, precisamos reequilibrar para não fadigar. Usaremos sons de vibração (BRRR) para abaixar a laringe.
                </p>

                <div class="grid gap-4">
                   <div class="relative pl-4 border-l-2 border-[#6F4CE7]">
                      <h4 class="text-white font-bold text-sm">1. "BRRR" (Oitava)</h4>
                      <p class="text-xs text-gray-400 mb-2">Vibração de lábios em oitava. Isso relaxa a tensão.</p>
                      ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR_1.mp3`)}
                   </div>

                   <div class="relative pl-4 border-l-2 border-[#6F4CE7]">
                      <h4 class="text-white font-bold text-sm">2. "PA" (Arpejo)</h4>
                      <p class="text-xs text-gray-400 mb-2">Este é para resistência. Sinta seu abdome (core) trabalhar a cada repetição.</p>
                      ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/PAPAPA%203x.mp3`)}
                   </div>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '8.4',
                title: 'Fase 4: Desaquecimento',
                description: 'Volte ao normal com segurança.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="bg-gradient-to-br from-[#1A202C] to-[#151a24] p-6 rounded-2xl border border-white/5 text-center">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-3">spa</span>
                <h3 class="text-lg font-bold text-white mb-2">Hora de Relaxar</h3>
                <p class="text-sm text-gray-300 mb-6">
                   Nunca termine um treino intenso abruptamente. Traga sua voz de volta para a fala com escalas descendentes suaves.
                </p>
                ${INLINE_PLAYER_TEMPLATE(`${STORAGE_BASE_URL}/VOCALIZES%20mp3/BRRR%20DOWN.mp3`)}
             </div>
          </div>
        `
            }
        ]
    },
    {
        id: 'm10',
        number: '10',
        title: 'Repertório & Aplicação',
        subtitle: 'Biblioteca de Karaokê',
        description: 'Coloque a técnica em prática com nossa curadoria de Playbacks.',
        topics: [
            {
                id: '10.1_new',
                title: 'Biblioteca de Karaokê (Acervo)',
                description: 'Playbacks profissionais para treino.',
                content: ''
            }
        ]
    },
    {
        id: 'm11',
        number: '11',
        title: 'Ornamentos e Agilidade Vocal',
        subtitle: 'Técnica e Estilo',
        description: 'Domine a velocidade, precisão e os ornamentos que refinam sua interpretação.',
        topics: [
            {
                id: '11.1',
                title: 'Aula 1: A Base da Agilidade – Leveza e Precisão',
                description: 'Preparar a musculatura para movimentos rápidos.',
                content: `
          <div class="space-y-8 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
               <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <span class="w-8 h-8 rounded-lg bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-sm font-bold">1</span>
                       O Conceito: Leveza é Velocidade
                   </h3>
                   <p class="text-sm text-gray-300 leading-relaxed">
                       Para fazer notas rápidas, a voz precisa estar "solta". Se você cantar com muita força ou volume, não terá velocidade. Pense na voz como um <b>pincel fino</b>, não como um rolo de pintura. O toque deve ser leve.
                   </p>
               </div>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] text-sm font-bold">2</span>
                    Técnica de Estacato
                </h3>
                <p class="text-sm text-gray-300 mb-4">
                    Usaremos notas curtas e destacadas para treinar o fechamento rápido das pregas vocais sem esforço.
                </p>
                <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                    <strong class="text-[#6F4CE7] block text-xs uppercase tracking-wide mb-2">Exercício Prático</strong>
                    <ol class="space-y-3 text-sm text-gray-300">
                        <li class="flex gap-2">
                            <span class="text-[#6F4CE7] font-bold">1.</span>
                            Escolha uma nota confortável.
                        </li>
                        <li class="flex gap-2">
                            <span class="text-[#6F4CE7] font-bold">2.</span>
                            Cante essa nota 4 vezes de forma curta e rápida (como um pequeno "quique").
                        </li>
                        <li class="flex gap-2">
                            <span class="text-[#6F4CE7] font-bold">3.</span>
                            Sinta que o esforço não vem da garganta, mas de um controle firme e breve do ar.
                        </li>
                    </ol>
                </div>
            </div>

            <div class="p-6 rounded-2xl bg-gradient-to-br from-[#1A202C] to-[#0D1117] border border-white/10 relative overflow-hidden group">
                <div class="flex items-center justify-between relative z-10">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                            <span class="material-symbols-rounded text-3xl">lock</span>
                        </div>
                        <div>
                            <h4 class="text-white font-bold">Vídeo de Demonstração</h4>
                            <p class="text-xs text-gray-500">Notas Curtas e Precisas</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-[#FF00BC]/10 border border-[#FF00BC]/20 text-[#FF00BC] text-[10px] font-bold uppercase tracking-widest">
                        Assinantes
                    </span>
                </div>
                <div class="mt-4 h-24 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center">
                    <span class="text-xs text-gray-600 font-medium">Conteúdo Bloqueado para Visitantes</span>
                </div>
            </div>
          </div>
        `
            },
            {
                id: '11.2',
                title: 'Aula 2: Notas de Passagem e Floreios Simples',
                description: 'Dominar o movimento entre duas notas vizinhas.',
                content: `
          <div class="space-y-8 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-[#EE13CA] blur-[80px] opacity-20"></div>
               <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <span class="w-8 h-8 rounded-lg bg-[#EE13CA]/20 flex items-center justify-center text-[#EE13CA] text-sm font-bold">1</span>
                       O Floreio de Duas Notas
                   </h3>
                   <p class="text-sm text-gray-300 leading-relaxed">
                       É o ornamento mais básico, onde você "visita" uma nota vizinha rapidamente antes de voltar para a nota principal. A precisão é o que diferencia um bom cantor de alguém desafinado.
                   </p>
               </div>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] text-sm font-bold">2</span>
                    Evitando o "Escorregão"
                </h3>
                <p class="text-sm text-gray-300 mb-4">
                    As notas devem ser como <b>degraus de uma escada</b>, bem definidos. Não murchar entre uma nota e outra.
                </p>
                <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                    <strong class="text-[#FF00BC] block text-xs uppercase tracking-wide mb-2 italic">Exercício Prático</strong>
                    <ul class="space-y-3 text-sm text-gray-300">
                        <li class="flex items-start gap-3">
                            <span class="material-symbols-rounded text-[#FF00BC] text-lg">music_note</span>
                            <span>Cante: Nota Base -> Nota de Cima -> Nota Base.</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="material-symbols-rounded text-[#FF00BC] text-lg">speed</span>
                            <span>Repita aumentando a velocidade, mantendo a clareza.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="p-6 rounded-2xl bg-[#101622] border border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-[#0081FF]/10 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded">lock</span>
                    </div>
                    <div>
                        <h4 class="text-white text-sm font-bold">Áudio Guia</h4>
                        <p class="text-[10px] text-gray-500 uppercase tracking-tighter">Exercícios de Floreios</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-gray-600"></div>
                    <span class="text-[10px] text-gray-500 font-bold uppercase">Exclusivo</span>
                </div>
            </div>
          </div>
        `
            },
            {
                id: '11.3',
                title: 'Aula 3: O Trinado – Oscilação Controlada',
                description: 'Crie um efeito de "tremido" elegante e voluntário.',
                content: `
          <div class="space-y-8 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
               <h3 class="text-lg font-bold text-white mb-3">O Que é o Trinado?</h3>
               <p class="text-sm text-gray-300">
                   É uma escolha técnica onde você controla exatamente em quais notas a voz está oscilando rapidamente. É diferente do vibrato natural.
               </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-[#1A202C] p-5 rounded-2xl border border-white/5 border-t-2 border-t-[#0081FF]">
                    <h4 class="text-[#0081FF] font-bold text-sm mb-2 uppercase tracking-wide">Sensação Térmica</h4>
                    <p class="text-xs text-gray-400">
                        Pense em uma <b>risada leve</b>. O movimento interno é similar ao "há-há-há".
                    </p>
                </div>
                <div class="bg-[#1A202C] p-5 rounded-2xl border border-white/5 border-t-2 border-t-[#FF00BC]">
                    <h4 class="text-[#FF00BC] font-bold text-sm mb-2 uppercase tracking-wide">Desafio</h4>
                    <p class="text-xs text-gray-400">
                        Tente o movimento entre notas com <b>meio tom</b> de distância. É mais fácil para soltar a laringe.
                    </p>
                </div>
            </div>

            <div class="bg-black/40 p-1 rounded-3xl border border-white/10">
                <div class="bg-[#1A202C] p-6 rounded-[22px] border border-white/5 text-center">
                    <div class="w-16 h-16 rounded-full bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4">
                        <span class="material-symbols-rounded text-4xl">video_library</span>
                    </div>
                    <h4 class="text-white font-bold mb-1">Vídeo: Domine a Oscilação</h4>
                    <p class="text-xs text-gray-500 mb-6">Acesso restrito para alunos da Academia</p>
                    <button class="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
                        <span class="flex items-center justify-center gap-2">
                            <span class="material-symbols-rounded text-sm">lock</span>
                            Bloqueado
                        </span>
                    </button>
                </div>
            </div>
          </div>
        `
            },
            {
                id: '11.4',
                title: 'Aula 4: Introdução aos Riffs e Escalas Rápidas',
                description: 'Cantar frases longas e rápidas sem perder a afinação.',
                content: `
          <div class="space-y-8 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
               <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0081FF] via-[#6F4CE7] to-[#FF00BC]"></div>
               <h3 class="text-lg font-bold text-white mb-4">Método de Câmera Lenta</h3>
               <p class="text-sm text-gray-300 mb-6">
                   Nunca tente cantar um riff (frase rápida) na velocidade original logo de cara.
               </p>
               
               <div class="space-y-4">
                   <div class="flex gap-4">
                       <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white shrink-0">1</div>
                       <p class="text-sm text-gray-400">Identifique cada nota da frase separadamente.</p>
                   </div>
                   <div class="flex gap-4">
                       <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white shrink-0">2</div>
                       <p class="text-sm text-gray-400">Cante bem devagar, como se fosse uma melodia lenta.</p>
                   </div>
                   <div class="flex gap-4">
                       <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white shrink-0">3</div>
                       <p class="text-sm text-gray-400">Só acelere quando seu ouvido "decorar" o caminho exato.</p>
                   </div>
               </div>
            </div>

            <div class="bg-[#0081FF]/10 border border-[#0081FF]/20 p-5 rounded-2xl">
                <div class="flex items-center gap-3 mb-2">
                    <span class="material-symbols-rounded text-[#0081FF]">lightbulb</span>
                    <h4 class="text-white font-bold text-sm">Aplicação Prática</h4>
                </div>
                <p class="text-xs text-gray-300 leading-relaxed">
                    Muito usado na <b>MPB contemporânea</b> e no <b>Gospel brasileiro</b> para dar dinâmica e sofisticação à interpretação.
                </p>
            </div>

            <div class="p-5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/[0.02]">
                <span class="material-symbols-rounded text-gray-600 text-4xl">audio_file</span>
                <div class="text-center">
                    <p class="text-sm text-white font-bold">Treino de Escalas</p>
                    <p class="text-[10px] text-gray-500 italic">Disponível para assinantes premium</p>
                </div>
                <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div class="w-1/3 h-full bg-[#0081FF] opacity-30"></div>
                </div>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-rounded text-green-500">tips_and_updates</span>
                    Dicas para o Aluno
                </h3>
                <ul class="space-y-4">
                    <li class="flex gap-3 items-start">
                        <div class="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <p class="text-sm text-gray-300"><b>Paciência:</b> A agilidade vocal é como um treino de academia para os dedos de um pianista. Requer repetição constante.</p>
                    </li>
                    <li class="flex gap-3 items-start">
                        <div class="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <p class="text-sm text-gray-300"><b>Gravação:</b> Grave seus exercícios. Se a frase soar "borrada", diminua a velocidade do seu treino.</p>
                    </li>
                </ul>
            </div>
          </div>
        `
            }
        ]
    },
    // Módulo de Teste: Violão
    {
        id: 'mv1',
        courseId: 'violao',
        number: '01',
        title: 'Primeiros Acordes',
        subtitle: 'Violão Popular',
        description: 'Aprenda a tocar suas primeiras músicas.',
        topics: [
            {
                id: 'v1.1',
                title: 'Postura e Mão Direita',
                description: 'Como segurar o violão e fazer o primeiro dedilhado.',
                content: '<div class="p-8 text-center text-gray-400">Conteúdo em desenvolvimento...</div>'
            }
        ]
    },
    // Módulo de Teste: Guitarra
    {
        id: 'mg1',
        courseId: 'guitarra',
        number: '01',
        title: 'Power Chords e Drive',
        subtitle: 'Rock & Blues',
        description: 'Fundamentos da guitarra elétrica.',
        topics: [
            {
                id: 'g1.1',
                title: 'O Som do Rock',
                description: 'Power chords e timbragem básica.',
                content: '<div class="p-8 text-center text-gray-400">Conteúdo em desenvolvimento...</div>'
            }
        ]
    },
    // --- CURSO DE ORATÓRIA ---
    {
        id: "ora_m1",
        courseId: "oratoria",
        number: "01",
        title: "Mentalidade Vocal e Bloqueios",
        subtitle: "A Guerra Interior",
        description: "Desconstrua os bloqueios mentais que impedem sua voz de fluir com liberdade.",
        topics: [
            {
                id: "ora_1.1",
                title: "A Guerra Interior da Voz",
                description: "O bloqueio não está na boca, mas na mente.",
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF4D4D] blur-[80px] opacity-20"></div>
                    <div class="relative z-10">
                        <h3 class="text-xl font-bold text-white mb-4">A Guerra Interior</h3>
                        <p class="text-sm text-gray-300 leading-relaxed mb-4">
                            O maior bloqueio da fala não está na boca, mas na mente. A voz trava quando a mente entra em modo de defesa: medo de errar, de ser julgado ou de não ser suficiente.
                        </p>
                        <div class="bg-black/40 p-4 rounded-xl border border-white/5 italic text-xs text-[#FF4D4D]">
                            "O primeiro passo da oratória é substituir a mentalidade de vítima pela mentalidade de comando."
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-[#1A202C] p-5 rounded-2xl border border-white/5">
                        <h4 class="text-[#0081FF] font-bold text-sm mb-3">🛠️ Prática</h4>
                        <p class="text-xs text-gray-400 mb-4">Respire profundamente por 4s, segure por 4s e solte por 6s. Leia um texto sem pedir desculpas ou se corrigir.</p>
                    </div>
                    <div class="bg-[#1A202C] p-5 rounded-2xl border border-white/5">
                        <h4 class="text-[#EE13CA] font-bold text-sm mb-3">🚀 Aplicação</h4>
                        <p class="text-xs text-gray-400">Apresente-se dizendo apenas seu nome e o que faz, sem explicações extras ou justificativas.</p>
                    </div>
                </div>

                <div class="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                    <h4 class="text-green-500 font-bold text-[10px] uppercase tracking-widest mb-2">Critério de Avaliação</h4>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-rounded text-green-500 text-sm">check_circle</span>
                        <p class="text-xs text-white">Conseguiu falar até o fim sem se interromper ou se justificar.</p>
                    </div>
                </div>
            </div>
          `
            },
            {
                id: "ora_1.2",
                title: "Energia, Presença e Voz Viva",
                description: "Uma voz sem energia não gera conexão emocional.",
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                    <h3 class="text-xl font-bold text-white mb-4">Presença Vocal</h3>
                    <p class="text-sm text-gray-300 leading-relaxed mb-6">
                        Entusiasmo não é gritar. É sustentar presença. Quando o corpo está ativo, a voz se projeta naturalmente. Presença significa estar inteiro no que se fala.
                    </p>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <span class="w-2 h-2 rounded-full bg-[#0081FF]"></span>
                            <span class="text-xs text-gray-300">Pense enquanto fala</span>
                        </div>
                        <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <span class="w-2 h-2 rounded-full bg-[#0081FF]"></span>
                            <span class="text-xs text-gray-300">Olhe enquanto fala</span>
                        </div>
                        <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <span class="w-2 h-2 rounded-full bg-[#0081FF]"></span>
                            <span class="text-xs text-gray-300">Respire enquanto fala</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-black/20 p-5 rounded-2xl border border-white/5">
                        <h4 class="text-[#0081FF] font-bold text-sm mb-3">🛠️ Prática</h4>
                        <p class="text-xs text-gray-400">Ative o corpo e emita vogais longas com intensidade média. Leia um texto variando a intenção emocional.</p>
                    </div>
                    <div class="bg-black/20 p-5 rounded-2xl border border-white/5">
                        <h4 class="text-[#EE13CA] font-bold text-sm mb-3">🚀 Aplicação</h4>
                        <p class="text-xs text-gray-400">Grave um vídeo curto sobre algo que você gosta, focando em manter a energia vocal do início ao fim.</p>
                    </div>
                </div>
            </div>
          `
            },
            {
                id: "ora_1.3",
                title: "Medo, Crítica e Exposição",
                description: "Quem aceita o risco de errar, evolui.",
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                    <h3 class="text-xl font-bold text-white mb-4">O Risco da Evolução</h3>
                    <p class="text-sm text-gray-300 mb-6">Errar uma palavra não diminui sua autoridade. A reação ao erro é o que define como o público te percebe. Siga adiante sempre.</p>
                    <div class="p-4 bg-[#FF4D4D]/10 rounded-xl border border-[#FF4D4D]/20 text-center">
                        <h4 class="text-white font-bold italic mb-2">"O erro não destrói autoridade; fugir dele, sim."</h4>
                    </div>
                </div>

                <div class="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <h4 class="text-[#0081FF] font-bold text-sm mb-3">🛠️ Prática</h4>
                    <p class="text-xs text-gray-400">Simule uma fala e, ao errar propositalmente uma palavra, continue normalmente sem se explicar.</p>
                </div>
            </div>
          `
            }
        ]
    },
    {
        id: "ora_m2",
        courseId: "oratoria",
        number: "02",
        title: "Clareza, Simplicidade e Valor",
        subtitle: "Comunique com Força",
        description: "Aprenda a orçar sua mensagem para que ela seja impossível de ignorar.",
        topics: [
            {
                id: "ora_2.1",
                title: "Comunicação Clara é Comunicação Forte",
                description: "Falar bem não é usar palavras difíceis.",
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                    <h3 class="text-xl font-bold text-white mb-4 text-center">Simplicidade é Chave</h3>
                    <p class="text-sm text-gray-300 leading-relaxed mb-6">
                        Quanto mais simples a mensagem, maior a conexão. Ruídos surgem quando tentamos impressionar em vez de sermos entendidos.
                    </p>
                    <div class="p-6 bg-[#0081FF]/10 rounded-2xl border border-[#0081FF]/20">
                        <h4 class="text-[#0081FF] font-bold text-sm mb-3 text-center uppercase">🚀 Aplicação</h4>
                        <p class="text-sm text-white text-center italic">"Explique seu trabalho para alguém (ou uma criança) sem usar nenhum termo técnico."</p>
                    </div>
                </div>
            </div>
          `
            },
            {
                id: "ora_2.2",
                title: "Autoridade e Entrega de Valor",
                description: "Respeite o tempo do seu ouvinte.",
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                    <h3 class="text-xl font-bold text-white mb-4">A Pergunta de Ouro</h3>
                    <p class="text-sm text-gray-400 mb-6">Cada fala sua precisa responder a uma única pergunta:</p>
                    <div class="bg-black/40 p-6 rounded-2xl border border-white/5 text-center">
                        <h4 class="text-2xl font-black text-white uppercase tracking-tighter">"Por que isso importa agora?"</h4>
                    </div>
                </div>
                <div class="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <h4 class="text-[#0081FF] font-bold text-sm mb-3 text-center uppercase">🛠️ Prática</h4>
                    <p class="text-xs text-gray-400 text-center">Crie um pitch de 2 min focado exclusivamente no benefício para o ouvinte.</p>
                </div>
            </div>
          `
            }
        ]
    },
    {
        id: "ora_m3",
        courseId: "oratoria",
        number: "03",
        title: "Corpo, Voz e Expressão",
        subtitle: "O Suporte da Voz",
        description: "Ajuste sua base física para sustentar uma voz poderosa e sem esforço.",
        topics: [
            {
                id: "ora_3.1",
                title: "Postura, Dicção e Projeção",
                description: "O corpo sustenta a voz.",
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                    <h3 class="text-xl font-bold text-white mb-4">Arquitetura Corporal</h3>
                    <p class="text-sm text-gray-300 leading-relaxed mb-6">
                        Postura desalinhada gera voz fraca. Dicção clara depende de articulação consciente. Falar bem não é forçar, é organizar.
                    </p>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 bg-white/5 rounded-xl text-center">
                            <span class="text-xs text-[#0081FF] font-bold block mb-1 uppercase">Postura</span>
                            <span class="text-[10px] text-gray-400">Base firme e alinhada</span>
                        </div>
                        <div class="p-4 bg-white/5 rounded-xl text-center">
                            <span class="text-xs text-[#EE13CA] font-bold block mb-1 uppercase">Dicção</span>
                            <span class="text-[10px] text-gray-400">Articulação exagerada</span>
                        </div>
                    </div>
                </div>

                <div class="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-6">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="material-symbols-rounded text-[#0081FF]">fitness_center</span>
                        <h4 class="text-white font-bold text-base uppercase tracking-tight">Sessão de Prática</h4>
                    </div>
                    
                    <p class="text-xs text-gray-400 leading-relaxed">
                        Para enriquecer sua Arquitetura Corporal, realize estes trava-línguas focando em diferentes grupos musculares:
                    </p>

                    <div class="grid grid-cols-1 gap-4">
                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h5 class="text-[#0081FF] font-bold text-[10px] uppercase mb-2">Explosão Labial (Clareza)</h5>
                            <p class="text-xs text-white italic leading-relaxed">"O peito do pé de Pedro é preto. Quem disser que o peito do pé de Pedro é preto, tem o peito do pé mais preto que o peito do pé de Pedro."</p>
                        </div>

                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h5 class="text-[#EE13CA] font-bold text-[10px] uppercase mb-2">Agilidade de Língua (Articulação)</h5>
                            <p class="text-xs text-white italic leading-relaxed">"Num ninho de mafagafos, cinco mafagafinhos há! Quem os desmafagafizar, bom desmafagafizador será."</p>
                        </div>

                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h5 class="text-yellow-500 font-bold text-[10px] uppercase mb-2">Projeção de Ar (Fôlego)</h5>
                            <p class="text-xs text-white italic leading-relaxed">"Três pratos de trigo para três tigres tristes."</p>
                        </div>

                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h5 class="text-green-500 font-bold text-[10px] uppercase mb-2">Vibração e Ressonância</h5>
                            <p class="text-xs text-white italic leading-relaxed">"A aranha arranha a rã. A rã arranha a aranha. Nem a aranha arranha a rã, nem a rã arranha a aranha."</p>
                        </div>
                    </div>

                    <div class="bg-[#0081FF]/10 p-5 rounded-2xl border border-[#0081FF]/20 mt-4">
                        <h5 class="text-white font-bold text-xs mb-2 flex items-center gap-2">
                             <span class="material-symbols-rounded text-sm">stars</span>
                             Modo Profissional (Ação Estratégica)
                        </h5>
                        <p class="text-[11px] text-gray-300 leading-relaxed">
                            Realize cada exercício <b>três vezes</b>. Na primeira, priorize a <b>Articulação Exagerada</b>. Na última, foque na <b>Base firme e alinhada</b> projetando a voz para o fundo da sala.
                        </p>
                    </div>

                    <div class="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                        <p class="text-[10px] text-gray-500 italic">
                            ⚠️ "Falar bem não é forçar a garganta, é organizar a musculatura".
                        </p>
                    </div>
                </div>
            </div>
          `
            }
        ]
    },
    {
        id: "ora_m4",
        courseId: "oratoria",
        number: "04",
        title: "Autoridade e Controle",
        subtitle: "Sobriedade Final",
        description: "Refine sua comunicação retirando excessos e consolidando sua autoridade.",
        topics: [
            {
                id: "ora_4.1",
                title: "Menos Excesso, Mais Presença",
                description: "Gestos exagerados tiram sua autoridade.",
                content: `
            <div class="space-y-8 font-sans">
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                    <h3 class="text-xl font-bold text-white mb-4">A Economia do Mestre</h3>
                    <p class="text-sm text-gray-300 leading-relaxed mb-6">
                        Comunicação madura é econômica. Pausas são ferramentas poderosas. O silêncio comunica segurança e controle.
                    </p>
                    <div class="bg-black/40 p-4 rounded-xl border-l-4 border-yellow-500">
                        <p class="text-xs text-gray-400">"Retire os excessos de 'hã', 'né', 'tá' e movimentos repetitivos."</p>
                    </div>
                </div>
                <div class="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <h4 class="text-[#0081FF] font-bold text-sm mb-3 uppercase">🚀 Aplicação</h4>
                    <p class="text-xs text-gray-400">Grave um vídeo de 1 min e anote todos os seus vícios de linguagem e gestos desnecessários.</p>
                </div>
            </div>
          `
            },
            {
                id: "ora_4.2",
                title: "Nunca Peça Desculpas por Existir",
                description: "Consolidação da postura adulta.",
                content: `
            <div class="space-y-8 font-sans text-center">
                <div class="bg-gradient-to-br from-[#1A202C] to-[#0A0E14] p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <h3 class="text-2xl font-black text-white mb-4 uppercase tracking-tighter">O Selo de Autoridade</h3>
                    <p class="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
                        Pedir desculpas por errar a técnica enfraquece sua mensagem. Mantenha o fluxo. O comunicador forte sustenta a fala até o fim.
                    </p>
                    <div class="inline-block px-6 py-3 bg-[#EE13CA]/20 border border-[#EE13CA]/40 rounded-full">
                        <span class="text-white font-bold text-xs">DESAFIO FINAL: APRESENTAÇÃO DE 5 MINUTOS SEM CORTES</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] px-4">
                    <span>Clareza Absoluta</span>
                    <span>Presença Real</span>
                </div>
            </div>
          `
            }
        ]
    }
];

// -----------------------------------------------------------
// VOCALIZES DATA
// -----------------------------------------------------------
export const VOCALIZES: Vocalize[] = [
    // 1. Escala Longa (M1 - Fundamentos)
    {
        id: 'v-esc-long',
        moduleId: 'm1',
        title: 'Escala longa I-V',
        category: 'Fundamentos',
        difficulty: 'Iniciante',
        duration: '04:30',
        bpm: 90,
        key: 'C Major',
        description: 'Escala fundamental para extensão e controle de fluxo.',
        audioUrl: `${SINGEO_BASE_URL}scale_long_I_V_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}scale_long_I_V_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}BRRR_1.mp3`
    },

    // 2. Desaquecimento Reverso (M2 - Aquecimento / M8 - Final)
    {
        id: 'v-desaq-m2',
        moduleId: 'm2',
        title: 'Desaquecimento Reverso',
        category: 'Desaquecimento',
        difficulty: 'Iniciante',
        duration: '03:45',
        bpm: 80,
        key: 'Descendente',
        description: 'Essencial após o treino. Traga sua voz de volta para a região de fala.',
        audioUrl: `${SINGEO_BASE_URL}warmup_reverse_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}warmup_reverse_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}BRRR%20DOWN.mp3`
    },

    // 3. Arpeggio Maior 3x (M3 - Técnica / M8 - Força)
    {
        id: 'v-arp3x-m3',
        moduleId: 'm3',
        title: 'Arpeggio Maior 3x',
        category: 'Agilidade',
        difficulty: 'Intermediário',
        duration: '05:00',
        bpm: 110,
        key: 'D Major',
        description: 'Arpejo triplo para trabalhar flexibilidade e precisão.',
        audioUrl: `${SINGEO_BASE_URL}arpeggio_major_3x_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}arpeggio_major_3x_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}PAPAPA%203x.mp3`
    },

    // 4. Repetição de Oitava (M4 - Ressonância / M7 - Notas Altas)
    {
        id: 'v-rep-oit-m4',
        moduleId: 'm4',
        title: 'Repetição de oitava',
        category: 'Ressonância',
        difficulty: 'Avançado',
        duration: '05:30',
        bpm: 100,
        key: 'E Major',
        description: 'Saltos de oitava para conectar os registros grave e agudo.',
        audioUrl: `${SINGEO_BASE_URL}interval_octave_repeat_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}interval_octave_repeat_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}Repetição%20de%20oitava%20(H).mp3`
    },

    // 5. Reverso 5 Repetindo (M5 - Avançado)
    {
        id: 'v-rev5-m5',
        moduleId: 'm5',
        title: 'Reverso Repetindo',
        category: 'Performance',
        difficulty: 'Avançado',
        duration: '04:15',
        bpm: 120,
        key: 'F Major',
        description: 'Desafio de agilidade e controle de fôlego.',
        audioUrl: `${SINGEO_BASE_URL}reverse_5_repeat_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}reverse_5_repeat_low.mp3?v=bust2`,
        exampleUrl: `${STORAGE_BASE_URL}/VOCALIZES%20mp3/VOCALIZES%20PIANO/Reverso%205%20Repetindo%20(H).mp3`
    },

    // Duplicatas para aparecer em módulos adicionais (opcional, mantendo coerência com módulos)
    {
        id: 'v-arp3x-m8',
        moduleId: 'm8',
        title: 'Arpeggio Maior 3x',
        category: 'Força',
        difficulty: 'Intermediário',
        duration: '05:00',
        bpm: 110,
        key: 'D Major',
        description: 'Use este arpejo para expandir sua ressonância com energia.',
        audioUrl: `${SINGEO_BASE_URL}arpeggio_major_3x_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}arpeggio_major_3x_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}PAPAPA%203x.mp3`
    },
    {
        id: 'v-desaq-m8',
        moduleId: 'm8',
        title: 'Desaquecimento Reverso',
        category: 'Saúde Vocal',
        difficulty: 'Iniciante',
        duration: '03:45',
        bpm: 80,
        key: 'Descendente',
        description: 'Relaxe a laringe após os exercícios de potência.',
        audioUrl: `${SINGEO_BASE_URL}warmup_reverse_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}warmup_reverse_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}BRRR%20DOWN.mp3`
    },
    // NOVO: Escala Longa I-V no Módulo M8
    {
        id: 'v-esc-long-m8',
        moduleId: 'm8',
        title: 'Escala Longa I-V',
        category: 'Extensão',
        difficulty: 'Iniciante',
        duration: '04:30',
        bpm: 90,
        key: 'C Major',
        description: 'Escala fundamental para extensão e controle de fluxo.',
        audioUrl: `${SINGEO_BASE_URL}scale_long_I_V_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}scale_long_I_V_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}BRRR_1.mp3`
    },
    // NOVO: Reverso Repetindo no Módulo M8
    {
        id: 'v-rev-rep-m8',
        moduleId: 'm8',
        title: 'Reverso Repetindo',
        category: 'Agilidade',
        difficulty: 'Avançado',
        duration: '04:15',
        bpm: 120,
        key: 'C Major',
        description: 'Exercício de agilidade e controle de fôlego com padrão reverso.',
        audioUrl: `${SINGEO_BASE_URL}reverse_5_repeat_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}reverse_5_repeat_low.mp3?v=bust2`,
        exampleUrl: `${STORAGE_BASE_URL}/VOCALIZES%20mp3/VOCALIZES%20PIANO/Reverso%205%20Repetindo%20(H).mp3`
    },
    {
        id: 'v-rep-oit-m7',
        moduleId: 'm7',
        title: 'Repetição de oitava',
        category: 'Extensão',
        difficulty: 'Avançado',
        duration: '05:30',
        bpm: 100,
        key: 'E Major',
        description: 'Treino de agudos limpos através de saltos intervalares.',
        audioUrl: `${SINGEO_BASE_URL}interval_octave_repeat_high.mp3?v=bust2`,
        audioUrlMale: `${SINGEO_BASE_URL}interval_octave_repeat_low.mp3?v=bust2`,
        exampleUrl: `${VOCALIZES_BASE_URL}Repetição%20de%20oitava%20(H).mp3`
    },

    // Trava-línguas (M6)
    {
        id: 't-a1',
        moduleId: 'm6',
        title: 'O Peito de Pedro',
        category: 'Bilabiais (P, B, M)',
        difficulty: 'Iniciante',
        duration: 'BPM 80',
        bpm: 80,
        key: 'Fala',
        description: 'O peito do pé de Pedro é preto...',
        audioUrl: '',
        exampleUrl: ''
    },
    {
        id: 't-c3',
        moduleId: 'm6',
        title: 'Mafagafos',
        category: 'Complexos',
        difficulty: 'Avançado',
        duration: 'BPM 150',
        bpm: 150,
        key: 'Fala',
        description: 'Num ninho de mafagafos...',
        audioUrl: '',
        exampleUrl: ''
    }
];

export const CURRENT_USER: User = {
    id: 'u1',
    name: 'Lorena Pimentel',
    role: 'teacher',
    avatarUrl: 'https://ui-avatars.com/api/?name=Lorena+Pimentel&background=0D8ABC&color=fff',
    status: 'active'
};

export const MOCK_STUDENTS: StudentSummary[] = [];

export const TEACHER_APPOINTMENTS: Appointment[] = [];
