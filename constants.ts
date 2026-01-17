import { Vocalize, User, StudentSummary, Appointment, Module, TwisterExercise, Task } from './types';

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
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(0,129,255,0.3)]" style="background-color: [#0081FF]; height: 23px;" data-base-height="23"></div>
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(0,129,255,0.3)]" style="background-color: [#0081FF]; height: 12px;" data-base-height="12"></div>
            <div class="w-1.5 rounded-full transition-all duration-150" style="background-color: [#6F4CE7]; height: 8px;" data-base-height="8"></div>
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(147,51,234,0.3)]" style="background-color: #9333EA; height: 28px;" data-base-height="28"></div>
            <div class="w-1.5 rounded-full transition-all duration-150" style="background-color: #FF00BC; height: 15px;" data-base-height="15"></div>
            <div class="w-1.5 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(255,0,188,0.3)]" style="background-color: [#FF00BC]; height: 8px;" data-base-height="8"></div>
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
    // --- FASE 1: O INSTRUMENTO E A FONTE (O ALICERCE) ---
    {
        id: 'm_theory',
        number: '01',
        title: 'TEORIA',
        subtitle: 'Conhecimento é Poder',
        description: 'A base teórica indispensável: Respiração, Fonação e Ressonância.',
        icon: 'menu_book',
        topics: [
            {
                id: '1.1_t',
                title: 'Respiração',
                description: 'O combustível da voz.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#0081FF]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] mb-8">
                <span class="material-symbols-rounded text-4xl">air</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">O Pilar da Voz</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                A respiração é a <strong>espinha dorsal</strong> do canto. Ela pode definir o sucesso ou o fracasso de uma performance vocal, pois é o alicerce sobre o qual todos os outros elementos técnicos são construídos.
              </p>
            </div>
            <div class="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p class="text-gray-400 italic text-center">
                    "Compreender e dominar o poder de uma respiração eficiente é o primeiro passo para desbloquear todo o seu potencial vocal."
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                    <span class="material-symbols-rounded">biotech</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">O Mecanismo Biológico</h3>
            </div>
            
            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <p class="text-gray-300 leading-relaxed mb-6 text-lg">
                    Enquanto você lê este texto, seu corpo realiza o ato de respirar de forma automática — um processo que repetimos cerca de <strong>22 mil vezes ao dia</strong>.
                </p>
                
                <div class="bg-black/40 p-5 rounded-2xl border-l-4 border-[#6F4CE7] space-y-3">
                    <p class="text-sm text-gray-400">
                        Embora pareça simples, diversos grupos musculares precisam atuar em conjunto a cada ciclo respiratório.
                    </p>
                    <p class="text-white font-bold">
                        Toda inspiração funcional começa pelo diafragma.
                    </p>
                </div>
            </div>

            <div class="bg-gradient-to-r from-[#6F4CE7]/10 to-transparent p-6 rounded-3xl border border-white/5">
                <p class="text-sm text-gray-300 italic">
                    Este músculo em forma de cúpula, localizado abaixo dos pulmões, desempenha o papel central no canto.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                    <span class="material-symbols-rounded">expand</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">A Inspiração e a Expansão</h3>
            </div>

            <div class="grid gap-4">
                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                    <p class="text-gray-300 leading-relaxed mb-4">
                        Ao inspirar, o <strong>diafragma se contrai, achata-se e desce</strong>. Os pulmões acompanham esse movimento, expandindo-se para baixo.
                    </p>
                    <p class="text-sm text-gray-400">
                        Como resultado, a pressão interna diminui, criando um vácuo. Esse desequilíbrio gera uma entrada rápida de ar pelo nariz ou boca.
                    </p>
                </div>

                <div class="bg-[#FF00BC]/10 border border-[#FF00BC]/20 p-6 rounded-3xl">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-rounded text-[#FF00BC]">lightbulb</span>
                        <h4 class="font-bold text-[#FF00BC] uppercase tracking-widest text-xs">Nota Prática</h4>
                    </div>
                    <p class="text-sm text-pink-100/80 leading-relaxed">
                        Você notará que o abdome se projeta para fora na inspiração. Isso ocorre devido ao deslocamento das vísceras pelo movimento descendente do diafragma, e <strong>não porque o ar "foi para a barriga"</strong>.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação I</h3>
                <p class="text-gray-400 text-sm mt-2">Teste seus conhecimentos antes de seguir.</p>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">Qual estrutura é crucial para iniciar a inspiração de forma eficiente?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98]" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium">Peito</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98]" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium">Costas</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98]" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium font-bold">Diafragma</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                    <span class="material-symbols-rounded">speed</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">A Expiração Controlada</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed text-lg">
                    Com os pulmões cheios, você tem o <strong>combustível</strong> para o canto. Na expiração passiva, o diafragma relaxa e sobe, expulsando o ar.
                </p>
                <div class="h-px bg-white/5 w-full"></div>
                <p class="text-white font-bold leading-relaxed">
                    No canto, a chave é controlar o ritmo e a força dessa saída. É aqui que entram os músculos abdominais.
                </p>
                <p class="text-sm text-gray-400">
                    Eles ajudam a regular o fluxo, agindo como um freio contra a subida repentina do diafragma, evitando que o ar escape de uma só vez.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                    <span class="material-symbols-rounded">fitness_center</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">O Conceito de Apoio</h3>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-black p-6 rounded-3xl border border-white/5 space-y-6">
                <div class="space-y-2">
                    <h4 class="text-[#6F4CE7] font-black uppercase tracking-widest text-[10px]">Resistência Sutil</h4>
                    <p class="text-gray-300 leading-relaxed">
                        Resistir às forças elásticas de retração do diafragma é um engajamento muscular sutil e natural. <strong>Não queremos uma contração rígida</strong> para uma emissão suave.
                    </p>
                </div>

                <div class="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <h4 class="text-[#FF00BC] font-black uppercase tracking-widest text-[10px] mb-2">Compressão de Ar</h4>
                    <p class="text-gray-300 leading-relaxed text-sm">
                        Além de frear o diafragma, os músculos abdominais podem exercer pressão para criar compressão. Essa técnica é <strong>essencial para estilos intensos e potentes</strong>.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <span class="material-symbols-rounded">compress</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Gerenciando o Ar Restante</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 relative">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-orange-500 blur-[60px] opacity-10"></div>
                <p class="text-gray-300 leading-relaxed text-lg mb-6">
                    Quando você está prestes a ficar sem ar, a musculatura abdominal atua <strong>"espremendo" suavemente</strong> o volume residual para manter o fluxo constante.
                </p>
                
                <div class="bg-black/40 p-5 rounded-2xl border-l-4 border-orange-500">
                    <p class="text-sm text-gray-400 leading-relaxed">
                        Quanto menos ar resta, maior deve ser o engajamento muscular para garantir que a pressão necessária não caia, mantendo o <strong>volume e a estabilidade</strong> da nota.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação II</h3>
                <p class="text-gray-400 text-sm mt-2">Segunda rodada de perguntas.</p>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">Quando você deve contrair deliberadamente a musculatura abdominal durante a expiração?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98]" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium">Quando busca uma liberação de ar mais gradual.</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98]" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium font-bold">Quando busca maior pressão de ar para intensidade.</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98]" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Sempre.</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                    <span class="material-symbols-rounded">balance</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">A Importância do Equilíbrio</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    É fundamental notar que, embora o abdome seja protagonista, os <strong>músculos das costelas (intercostais) e das costas</strong> também contribuem para a regulação do fluxo de ar.
                </p>
                
                <div class="grid grid-cols-2 gap-3 mt-4">
                    <div class="bg-black/40 p-4 rounded-2xl text-center border border-white/5">
                        <span class="text-[10px] text-[#0081FF] font-black uppercase tracking-widest block mb-1">Custo-Lateral</span>
                        <p class="text-[11px] text-gray-400">Expansão das costelas.</p>
                    </div>
                    <div class="bg-black/40 p-4 rounded-2xl text-center border border-white/5">
                        <span class="text-[10px] text-[#0081FF] font-black uppercase tracking-widest block mb-1">Dorsal</span>
                        <p class="text-[11px] text-gray-400">Suporte das costas.</p>
                    </div>
                </div>

                <p class="text-sm text-gray-400 pt-4 leading-relaxed">
                    Um bom apoio vocal significa utilizar todos esses músculos de forma equilibrada, garantindo volume, pressão e constância. 
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                    <span class="material-symbols-rounded">warning</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter text-red-100">O Perigo da Falta de Apoio</h3>
            </div>

            <div class="bg-red-950/20 border border-[#FF00BC]/20 p-6 rounded-3xl space-y-6">
                <p class="text-red-100/80 leading-relaxed">
                    A falta de apoio vocal leva a um erro comum: a <strong>sobrecarga da garganta</strong>. Sem o controle muscular do tronco, o cantor acaba utilizando a laringe para regular o ar.
                </p>
                
                <div class="bg-black/60 p-5 rounded-2xl space-y-3 border border-[#FF00BC]/10">
                    <h4 class="text-[#FF00BC] font-bold text-xs uppercase tracking-widest">Consequências:</h4>
                    <ul class="text-sm text-gray-300 space-y-2">
                        <li class="flex gap-2">
                            <span class="text-[#FF00BC]">•</span> Timbre estrangulado.
                        </li>
                        <li class="flex gap-2">
                            <span class="text-[#FF00BC]">•</span> Fadiga vocal rápida.
                        </li>
                        <li class="flex gap-2">
                            <span class="text-[#FF00BC]">•</span> Risco de lesões nas pregas vocais.
                        </li>
                    </ul>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <span class="material-symbols-rounded">psychology</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Prática vs. Performance</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    Por que não aprender a respirar diretamente enquanto cantamos músicas complexas? Porque controlar a técnica durante o canto é <strong>extremamente difícil</strong>.
                </p>
                <p class="text-sm text-gray-400">
                    Sua mente estará focada na interpretação, letra e melodia. A abordagem eficaz é <strong>isolar o treinamento muscular</strong>.
                </p>
                
                <div class="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <p class="text-sm text-blue-100/90 italic">
                        Ao praticar exercícios específicos, você internaliza o movimento até que ele se torne uma resposta automática (Memória Muscular).
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="bg-brand-gradient p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
                <div class="absolute top-0 left-0 w-full h-full bg-[url('${MINIMALIST_LOGO_URL}')] opacity-5 bg-center bg-no-repeat bg-contain scale-150"></div>
                <div class="relative z-10">
                    <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white mx-auto mb-6">
                        <span class="material-symbols-rounded text-4xl">emoji_events</span>
                    </div>
                    <h3 class="text-3xl font-black text-white mb-4 tracking-tighter">Conclusão do Módulo</h3>
                    <p class="text-white/80 leading-relaxed mb-6">
                        Dominamos a técnica em exercícios isolados para que, no palco, o apoio aconteça de forma orgânica.
                    </p>
                    <div class="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <p class="text-xs text-white font-bold uppercase tracking-widest">
                            Foque apenas na arte de comunicar através da música.
                        </p>
                    </div>
                </div>
            </div>
            
            <button class="w-full py-5 bg-[#1A202C] text-white font-black rounded-3xl border border-white/10 hover:bg-white/5 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3" onclick="window.location.reload()">
                <span class="material-symbols-rounded">check_circle</span>
                Concluir Tópico
            </button>
          </div>
        `
            },
            {
                id: '1.2_t',
                title: 'Fonação',
                description: 'A criação do som.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#6F4CE7]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#6F4CE7] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] mb-8">
                <span class="material-symbols-rounded text-4xl">record_voice_over</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">Introdução à Fonação</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                Agora que já conhecemos o funcionamento interno da respiração, podemos avançar para a criação do som através da <strong>fonação</strong>.
              </p>
            </div>
            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                <p class="text-gray-300 leading-relaxed text-sm">
                    De forma simples, fonação refere-se à produção de som pelas suas <strong>pregas vocais</strong>. Tal como uma vela precisa do vento para mover o barco, suas pregas precisam de um fluxo constante de ar para produzir som.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                    <span class="material-symbols-rounded">graphic_eq</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">O Mecanismo da Vibração</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    Imagine o seguinte: quando você expira, o ar dos pulmões passa rapidamente pelas pregas vocais. Se elas estiverem próximas, elas começam a <strong>vibrar</strong>.
                </p>
                
                <div class="grid grid-cols-2 gap-4 mt-2">
                    <div class="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p class="text-[10px] text-white font-bold uppercase tracking-widest">Abdução</p>
                        <p class="text-[9px] text-gray-500">Abertas: Para respirar</p>
                    </div>
                    <div class="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p class="text-[10px] text-white font-bold uppercase tracking-widest">Adução</p>
                        <p class="text-[9px] text-gray-500">Fechadas: Para som</p>
                    </div>
                </div>

                <p class="text-xs text-gray-400 italic">
                    Muito parecido com uma corda de violão oscilando, essa vibração produz ondas sonoras que viajam pelo seu trato vocal.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                    <span class="material-symbols-rounded">settings_accessibility</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Controle e Musculatura</h3>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-black p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    Dentro da laringe, existem diversas cartilagens que sustentam as pregas vocais. Elas são controladas por músculos que afetam o <strong>fechamento, comprimento e tensão</strong>.
                </p>
                
                <div class="bg-[#6F4CE7]/10 p-5 rounded-2xl border border-[#6F4CE7]/20">
                    <p class="text-sm text-gray-300">
                        As próprias pregas vocais contêm músculos que podem se contrair para ajustar sua rigidez, permitindo criar diferentes qualidades vocais e intensidades.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação I</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">O que faz as pregas vocais vibrarem?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium">As próprias pregas vocais.</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium font-bold">O ar proveniente da expiração.</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">O movimento da laringe.</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                    <span class="material-symbols-rounded">settings_input_component</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Clareza, Extensão e Ajustes</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <div class="space-y-2">
                    <h4 class="text-[#FF00BC] font-black uppercase tracking-widest text-[10px]">A Afinação</h4>
                    <p class="text-gray-300 leading-relaxed text-sm">
                        Pregas <strong>curtas e grossas</strong> vibram mais devagar, produzindo sons <strong>graves</strong>. Pregas <strong>longas e finas</strong> vibram mais rápido, produzindo sons <strong>agudos</strong>.
                    </p>
                </div>

                <div class="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <h4 class="text-[#0081FF] font-black uppercase tracking-widest text-[10px] mb-2">A Clareza</h4>
                    <p class="text-[11px] text-gray-400 leading-relaxed">
                        Se aproximadas sem fechar totalmente, o tom fica <strong>soproso</strong>. O fechamento total impede o som. A claridade vem do equilíbrio ideal.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <span class="material-symbols-rounded">visibility</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">A Laringe na Prática</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                <div class="space-y-3">
                    <p class="text-gray-300 leading-relaxed">
                        Experimente bocejar enquanto coloca o dedo na garganta. Você sentirá sua laringe <strong>descer drasticamente</strong>.
                    </p>
                    <div class="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 text-xs text-orange-200">
                        <strong>Laringe Baixada:</strong> Alonga as pregas vocais e escurece o timbre.
                    </div>
                    <div class="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-xs text-blue-200">
                        <strong>Laringe Elevada:</strong> Encurta as pregas e torna o som mais brilhante (ou metálico).
                    </div>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação II</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">Qual configuração das pregas vocais leva a um tom soproso?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium">Fechamento firme (tenso).</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium font-bold">Fechamento frouxo.</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Abertas.</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="bg-brand-gradient p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
                <div class="relative z-10">
                    <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white mx-auto mb-6">
                        <span class="material-symbols-rounded text-4xl">emoji_events</span>
                    </div>
                    <h3 class="text-3xl font-black text-white mb-4 tracking-tighter">Conclusão e Treinamento</h3>
                    <p class="text-white/80 leading-relaxed mb-6">
                        Com a prática, você internaliza esses ajustes através dos <strong>vocalizes</strong>, construindo memória muscular duradoura.
                    </p>
                    <div class="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <p class="text-xs text-white font-bold uppercase tracking-widest">
                            Encontre seu timbre ideal sem esforço.
                        </p>
                    </div>
                </div>
            </div>
            
            <button class="w-full py-5 bg-[#1A202C] text-white font-black rounded-3xl border border-white/10 hover:bg-white/5 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3" onclick="window.location.reload()">
                <span class="material-symbols-rounded">check_circle</span>
                Concluir Tópico
            </button>
          </div>
        `
            },
            {
                id: '1.3_t',
                title: 'Ressonância',
                description: 'O amplificador natural.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#10B981]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#10B981] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-8">
                <span class="material-symbols-rounded text-4xl">campaign</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">O Que é Ressonância?</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                Se você pudesse retirar suas pregas vocais e tentar cantar, ouviria apenas um zumbido fraco. A mágica que transforma esse zumbido em um tom pleno é a <strong>ressonância</strong>.
              </p>
            </div>
            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed text-sm">
                    Quando a onda sonora coincide com a <strong>frequência natural</strong> de uma cavidade, o ar ali dentro vibra intensamente, amplificando o som significativamente.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                    <span class="material-symbols-rounded">humidity_mid</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">O Exemplo do Balanço</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <p class="text-gray-300 leading-relaxed text-lg mb-6">
                    Pense nisso como o ato de empurrar um balanço.
                </p>
                <div class="bg-black/40 p-5 rounded-2xl border-l-4 border-[#0081FF]">
                    <p class="text-sm text-gray-400 leading-relaxed">
                        Se você empurrar o balanço no <strong>ritmo perfeito</strong> — o ritmo em que ele já balança naturalmente — o balanço irá muito mais alto com muito menos esforço.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação I</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">O que acontece se uma onda sonora coincide com a frequência natural do ressonador?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium">Ela é atenuada.</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium font-bold">Ela é amplificada.</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Ela permanece igual.</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                    <span class="material-symbols-rounded">music_note</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Timbre e Identidade Vocal</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    Por que um piano soa diferente de um violão tocando a mesma nota? Essa diferença é o <strong>timbre</strong>.
                </p>
                <p class="text-sm text-gray-400">
                    O tamanho e a forma do seu trato vocal determinam quais <strong>harmônicos</strong> serão amplificados, criando sua assinatura sonora única.
                </p>
                <div class="p-4 bg-[#FF00BC]/10 rounded-2xl border border-[#FF00BC]/20">
                    <p class="text-xs text-pink-100/90 italic text-center">
                        Nenhum som no mundo real consiste em apenas uma única frequência; ele é uma mistura rica de múltiplas ondas.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <span class="material-symbols-rounded">auto_awesome</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Benefícios da Ressonância</h3>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <div class="bg-[#1A202C] p-5 rounded-3xl border border-white/5 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] flex-shrink-0">
                        <span class="material-symbols-rounded">bolt</span>
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm">Projeção sem Esforço</h4>
                        <p class="text-xs text-gray-400">Torna a voz potente sem aumentar o desgaste das pregas vocais.</p>
                    </div>
                </div>
                <div class="bg-[#1A202C] p-5 rounded-3xl border border-white/5 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] flex-shrink-0">
                        <span class="material-symbols-rounded">palette</span>
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm">Riqueza Tonal</h4>
                        <p class="text-xs text-gray-400">Proporciona à voz um tom mais agradável, encorpado e rico.</p>
                    </div>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação II</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">Como a ressonância influencia sua voz?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium font-bold">Amplifica harmônicos agradáveis.</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium">Adiciona "drive" ou rugosidade à voz.</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Faz a voz soar soprosa.</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <span class="material-symbols-rounded">tune</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Ajustando o Trato Vocal</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    Diferente de outros instrumentos, os ressonadores da sua voz sugerem ajustes <strong>dinâmicos</strong>. 
                </p>
                <div class="bg-black/40 p-5 rounded-2xl border border-white/5">
                    <h4 class="text-orange-500 font-bold text-xs uppercase tracking-widest mb-2">Garganta Aberta</h4>
                    <p class="text-xs text-gray-400 leading-relaxed">
                        Ter uma garganta alargada (espaço faríngeo) é crucial. A <strong>tensão</strong> é a maior barreira, pois estreita o canal e mata a ressonância.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação III</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">Qual fator é o mais importante para melhorar a ressonância no canto?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium font-bold">Uma garganta aberta e alargada.</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium">Uma língua relaxada.</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Lábios arredondados.</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                    <span class="material-symbols-rounded">keyboard_double_arrow_up</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">O Palato Mole</h3>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-black p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed text-sm">
                    O próximo passo é a elevação do <strong>palato mole</strong> (o "céu da boca" posterior). Elevá-lo cria um espaço extra precioso para o som reverberar.
                </p>
                <div class="p-5 bg-[#6F4CE7]/10 rounded-2xl border border-[#6F4CE7]/20">
                    <h4 class="text-[#6F4CE7] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span class="material-symbols-rounded text-sm">lightbulb</span> Dica Prática
                    </h4>
                    <p class="text-xs text-blue-100/80 italic">
                        Imagine o frescor de uma bala de hortelã ao inspirar. Essa abertura que você sente é seu palato mole se elevando.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="bg-brand-gradient p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
                <div class="relative z-10">
                    <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white mx-auto mb-6">
                        <span class="material-symbols-rounded text-4xl">emoji_events</span>
                    </div>
                    <h3 class="text-3xl font-black text-white mb-4 tracking-tighter">Exercícios de Controle</h3>
                    <p class="text-white/80 leading-relaxed mb-6">
                        Use o <strong>"sorriso interno"</strong> e um espelho para observar o movimento do palato mole até dominá-lo conscientemente.
                    </p>
                    <div class="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <p class="text-xs text-white font-bold uppercase tracking-widest">
                            Transforme seu zumbido em uma voz poderosa.
                        </p>
                    </div>
                </div>
            </div>
            
            <button class="w-full py-5 bg-[#1A202C] text-white font-black rounded-3xl border border-white/10 hover:bg-white/5 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3" onclick="window.location.reload()">
                <span class="material-symbols-rounded">check_circle</span>
                Concluir Tópico
            </button>
          </div>
        `
            },
            {
                id: '1.4_t',
                title: 'Registros Vocais',
                description: 'Grave, Médio e Agudo.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#6F4CE7]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#6F4CE7] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] mb-8">
                <span class="material-symbols-rounded text-4xl">layers</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">Desmistificando os Registros</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                Vamos esclarecer um erro comum: a voz de peito não ressoa no peito, nem a de cabeça na cabeça. Essas são apenas <strong>sensações vibratórias</strong>.
              </p>
            </div>
            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                <p class="text-gray-300 leading-relaxed text-sm">
                    A verdadeira estrela são as <strong>pregas vocais</strong>. Registros referem-se a mecanismos distintos de produção sonora realizados diretamente por elas.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Origem</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">De onde se origina o som da voz de peito?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium">Peito</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium">Cabeça</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium font-bold">Pregas Vocais</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                    <span class="material-symbols-rounded">search</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Como encontrar os registros</h3>
            </div>

            <div class="grid gap-4">
                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                    <h4 class="text-[#0081FF] font-black uppercase tracking-widest text-[10px] mb-2">Voz de Peito</h4>
                    <p class="text-gray-300 leading-relaxed text-sm">
                        Grite um <strong>"Ei!"</strong> bem alto, como se chamasse alguém distante. Sinta a firmeza do som.
                    </p>
                </div>
                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                    <h4 class="text-[#FF00BC] font-black uppercase tracking-widest text-[10px] mb-2">Voz de Cabeça</h4>
                    <p class="text-gray-300 leading-relaxed text-sm">
                        Imite um <strong>"Uhu!"</strong> agudo, como em uma montanha-russa. Note a leveza.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                    <span class="material-symbols-rounded">biotech</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">A Fisiologia dos Registros</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-white border-l-2 border-[#6F4CE7] pl-3 uppercase">Peito (Vibrando com Massa)</h4>
                    <p class="text-xs text-gray-400">Pregas espessas, contato firme e longo. Fechamento mais forte na base.</p>
                </div>
                <div class="h-px bg-white/5"></div>
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-white border-l-2 border-[#FF00BC] pl-3 uppercase">Cabeça (Vibrando com Menos Massa)</h4>
                    <p class="text-xs text-gray-400">Pregas finas, contato suave e curto. Fechamento mais forte no topo.</p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <span class="material-symbols-rounded">straighten</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Registros e Extensão</h3>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-black p-6 rounded-3xl border border-white/5">
                <p class="text-gray-300 leading-relaxed text-lg text-center font-medium">
                    Os registros <strong>não são exclusivos</strong> para certas notas.
                </p>
                <p class="text-sm text-gray-500 mt-4 text-center leading-relaxed">
                    Muitas notas podem ser cantadas em ambos, mas certas frequências são naturalmente mais fáceis em um registro específico.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Adequação</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">Qual registro é mais adequado para notas graves?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium font-bold">Peito</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium">Cabeça</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Ambos são igualmente adequados</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                    <span class="material-symbols-rounded">fitness_center</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">O Esforço nos Agudos</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    Cantar notas agudas com pregas grossas (como na voz de peito) exige um <strong>estiramento extremo</strong> e grande engajamento muscular.
                </p>
                <div class="p-4 bg-[#FF00BC]/10 rounded-2xl border border-[#FF00BC]/20">
                    <p class="text-xs text-red-200 italic">
                        Isso é rapidamente cansativo e pode gerar fadiga vocal severa. A voz de cabeça é naturalmente mais apropriada para o agudo.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                    <span class="material-symbols-rounded">call_split</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">O Passaggio (A Passagem)</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                <p class="text-gray-300 leading-relaxed mb-4">
                    Sabe aquela "quebra" ou pulo na voz ao trocar de registro? Chamamos isso de <strong>passaggio</strong>.
                </p>
                <div class="bg-black/40 p-4 rounded-xl border-l-4 border-[#FF00BC]">
                    <p class="text-xs text-gray-400">
                        Isso ocorre devido ao equilíbrio de <strong>pressão</strong> entre o que vem dos pulmões e a contrapressão acima da laringe.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                    <span class="material-symbols-rounded">compress</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Pressão Glótica</h3>
            </div>

            <div class="grid grid-cols-1 gap-3">
                <div class="bg-[#1A202C] p-4 rounded-2xl border border-white/5">
                    <h4 class="text-[10px] text-blue-400 font-black uppercase mb-1">Subglótica (Abaixo)</h4>
                    <p class="text-[11px] text-gray-300">Vem dos pulmões, controlada pelos músculos respiratórios.</p>
                </div>
                <div class="bg-[#1A202C] p-4 rounded-2xl border border-white/5">
                    <h4 class="text-[10px] text-pink-400 font-black uppercase mb-1">Supraglótica (Acima)</h4>
                    <p class="text-[11px] text-gray-300">Contrapressão formada pelo estreitamento da via aérea acima da laringe.</p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white">
                    <span class="material-symbols-rounded">gradient</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Voz Mista (Mix)</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    É o estado intermediário onde ajustamos sutilmente os músculos e a pressão para <strong>misturar suavemente</strong> os registros.
                </p>
                <p class="text-sm text-gray-500 italic">
                    É a chave para cantar notas altas com a firmeza do peito e a facilidade da cabeça.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Ajuste</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">O que devemos ajustar gradualmente para evitar que a voz quebre?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium">Volume de ar</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium font-bold">Engajamento muscular e pressão</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Articulação e ressonância</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="bg-brand-gradient p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
                <div class="relative z-10">
                    <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white mx-auto mb-6">
                        <span class="material-symbols-rounded text-4xl">emoji_events</span>
                    </div>
                    <h3 class="text-3xl font-black text-white mb-4 tracking-tighter">Benefícios da Mista</h3>
                    <p class="text-white/80 leading-relaxed mb-6">
                        A voz mista expande sua extensão e protege sua saúde vocal através de exercícios como o <strong>ETVSO</strong>.
                    </p>
                    <div class="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <p class="text-xs text-white font-bold uppercase tracking-widest">
                            Estabilize sua voz e conquiste os agudos.
                        </p>
                    </div>
                </div>
            </div>
            
            <button class="w-full py-5 bg-[#1A202C] text-white font-black rounded-3xl border border-white/10 hover:bg-white/5 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3" onclick="window.location.reload()">
                <span class="material-symbols-rounded">check_circle</span>
                Concluir Tópico
            </button>
          </div>
        `
            },
            {
                id: '1.5_t',
                title: 'Postura',
                description: 'A base física do canto.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-amber-500/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500 blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 mb-8">
                <span class="material-symbols-rounded text-4xl">accessibility_new</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">A Base do Canto</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                A postura é o portal que prepara seu corpo para cantar. Ela garante que a <strong>respiração, fonação e ressonância</strong> funcionem em seu potencial máximo.
              </p>
            </div>
            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                <p class="text-gray-300 leading-relaxed text-sm">
                    Um desequilíbrio força o corpo a compensar a instabilidade, desviando músculos de sua função primária, como o <strong>suporte respiratório (apoio)</strong>.
                </p>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                    <span class="material-symbols-rounded">vertical_align_center</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Alinhamento e Capacidade</h3>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <p class="text-gray-300 leading-relaxed">
                    O bom alinhamento ocorre quando a <strong>cabeça, o pescoço e a coluna</strong> estão em uma linha reta.
                </p>
                <div class="bg-black/40 p-4 rounded-2xl border-l-4 border-[#0081FF]">
                    <p class="text-xs text-gray-400">
                        Com alinhamento pobre, a caixa torácica fica restrita, impedindo a expansão total dos pulmões e a descida do diafragma.
                    </p>
                </div>
                <div class="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <h4 class="text-blue-400 font-bold text-[10px] uppercase mb-1">Teste Prático</h4>
                    <p class="text-[11px] text-gray-300">Curve-se até o peito tocar as pernas e tente inspirar. Compare com a posição ereta. A diferença é nítida!</p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <span class="material-symbols-rounded">foundation</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">A Base: Pés e Quadril</h3>
            </div>

            <div class="grid grid-cols-1 gap-3">
                <div class="bg-[#1A202C] p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 text-sm font-bold">Pés</div>
                    <p class="text-xs text-gray-400">Alinhados à largura dos ombros. Peso levemente para a frente.</p>
                </div>
                <div class="bg-[#1A202C] p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0 text-sm font-bold">Joelhos</div>
                    <p class="text-xs text-gray-400">Levemente relaxados (destravados) para não desalinharem a coluna.</p>
                </div>
                <div class="bg-[#1A202C] p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] flex-shrink-0 text-sm font-bold">Quadril</div>
                    <p class="text-xs text-gray-400">Alinhado aos joelhos, sem inclinações excessivas.</p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                    <span class="material-symbols-rounded">person_pin</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Tronco e Ombros</h3>
            </div>

            <div class="bg-gradient-to-br from-[#1A202C] to-black p-6 rounded-3xl border border-white/5 space-y-4">
                <div class="space-y-2">
                    <h4 class="text-[#6F4CE7] font-black uppercase tracking-widest text-[10px]">Peito Elevado</h4>
                    <p class="text-gray-300 leading-relaxed text-sm">
                        Eleve suavemente o peito para cima e levemente para frente para respeitar a curvatura natural da coluna.
                    </p>
                </div>
                <div class="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <h4 class="text-[#FF00BC] font-black uppercase tracking-widest text-[10px] mb-2">Check de Ombros</h4>
                    <p class="text-gray-300 leading-relaxed text-xs">
                        Devem estar relaxados e alinhados com as orelhas. Uma linha vertical do lóbulo deve passar pelo centro do ombro.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                    <span class="material-symbols-rounded">eject</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter text-red-100">O Erro da Cabeça Erguida</h3>
            </div>

            <div class="bg-red-950/20 border border-[#FF00BC]/20 p-6 rounded-3xl space-y-4">
                <p class="text-red-100/80 leading-relaxed text-sm">
                    Muitos cantores inclinam a cabeça para cima nos agudos. Isso <strong>não ajuda</strong> a técnica; apenas cria tensão no pescoço e na laringe.
                </p>
                <div class="bg-black/60 p-4 rounded-xl border border-[#FF00BC]/10">
                    <p class="text-[10px] text-gray-400 leading-relaxed">
                        A técnica correta para o agudo não exige essa inclinação. Mantenha o olhar no horizonte para evitar fadiga.
                    </p>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-8">
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-[#6F4CE7]/10 flex items-center justify-center text-[#6F4CE7] mx-auto mb-4 border border-[#6F4CE7]/20">
                    <span class="material-symbols-rounded text-4xl">quiz</span>
                </div>
                <h3 class="text-2xl font-black text-white tracking-tighter">Quiz de Fixação</h3>
            </div>

            <div class="space-y-4">
                <p class="text-white font-bold text-lg text-center px-4">Qual parte do corpo deve permanecer totalmente relaxada?</p>
                
                <div class="grid gap-3">
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="true">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">A</div>
                        <span class="text-gray-300 font-medium font-bold">Ombros</span>
                    </button>
                    
                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">B</div>
                        <span class="text-gray-300 font-medium">Peito</span>
                    </button>

                    <button class="quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all hover:bg-white/10" data-correct="false">
                        <div class="option-icon w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-500">C</div>
                        <span class="text-gray-300 font-medium">Costas</span>
                    </button>
                </div>
            </div>
          </div>

          <!-- slide -->

          <div class="space-y-6">
            <div class="bg-brand-gradient p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
                <div class="relative z-10">
                    <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white mx-auto mb-6">
                        <span class="material-symbols-rounded text-4xl">emoji_events</span>
                    </div>
                    <h3 class="text-3xl font-black text-white mb-4 tracking-tighter">Cantar Sentado vs. Em Pé</h3>
                    <p class="text-white/80 leading-relaxed mb-6">
                        Cantar em pé é ideal para o apoio, mas se estiver sentado, mantenha as costas retas para evitar o arredondamento (cifose).
                    </p>
                    <div class="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <p class="text-xs text-white font-bold uppercase tracking-widest">
                            Use o espelho para garantir o alinhamento ideal.
                        </p>
                    </div>
                </div>
            </div>
            
            <button class="w-full py-5 bg-[#1A202C] text-white font-black rounded-3xl border border-white/10 hover:bg-white/5 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3" onclick="window.location.reload()">
                <span class="material-symbols-rounded">check_circle</span>
                Concluir Tópico
            </button>
          </div>
        `
            },
        ]
    },
    {
        id: 'm1',
        number: '02',
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
                            <li><span class="text-[#6F4CE7] font-bold">Erro comum:</span> Levantar o queixo para notas agudas (esmaga a laringe) ou abaixar demais.</li>
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
                 <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-10"></div>
                 <div class="relative z-10">
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-rounded text-[#0081FF]">psychology</span>
                        4. Por que isso importa?
                    </h3>
                    <p class="text-sm text-gray-300 mb-4">Quando você alinha a coluna, a laringe fica livre de pressões externas. Uma postura correta garante:</p>
                    <div class="grid gap-2 mb-6">
                        <div class="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-gray-300">
                            <strong class="text-[#0081FF]">Mais fôlego:</strong> O diafragma tem espaço total para descer.
                        </div>
                        <div class="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-gray-300">
                            <strong class="text-[#0081FF]">Ressonância:</strong> O som flui sem barreiras até a boca e o nariz.
                        </div>
                        <div class="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-gray-300">
                            <strong class="text-[#0081FF]">Presença:</strong> Um cantor alinhado transmite autoridade e confiança.
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
                    <span class="material-symbols-rounded text-[#0081FF]">checklist</span>
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
                </ul>
            </div>
          </div>
          <!-- slide -->
          <div class="space-y-6 font-sans">
            <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A202C] to-[#101622] border border-white/10 p-8">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#0081FF] blur-[100px] opacity-20"></div>
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0081FF]/10 text-[#0081FF] mb-6">
                        <span class="material-symbols-rounded text-5xl">air</span>
                    </div>
                    <h2 class="text-2xl font-black text-white mb-4">Parte 1: A Grande Ilusão</h2>
                    <p class="text-gray-400 leading-relaxed">
                        Muitos acreditam que cantar exige "muito ar". Na verdade, o segredo não é a <span class="text-[#0081FF] font-bold">quantidade</span>, mas a <span class="text-[#FF00BC] font-bold">gestão da pressão</span>. 
                    </p>
                </div>
                <div class="mt-8 grid grid-cols-2 gap-4">
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p class="text-[10px] text-gray-500 uppercase font-black mb-1">Mito</p>
                        <p class="text-xs text-[#FF00BC] font-bold">Pulmão explodindo de ar</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p class="text-[10px] text-gray-500 uppercase font-black mb-1">Realidade</p>
                        <p class="text-xs text-[#0081FF] font-bold">Fluxo constante e controlado</p>
                    </div>
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-xl font-bold text-white mb-4">O Motor: Diafragma</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    O diafragma é um músculo em forma de cúpula que separa o tórax do abdome. Quando ele <span class="text-[#0081FF] font-bold">contrai</span>, ele desce, criando um vácuo que puxa o ar para dentro.
                </p>
                <div class="flex justify-center py-8">
                    <div class="relative w-48 h-48">
                        <div class="absolute inset-0 bg-[#0081FF] blur-[60px] opacity-10 animate-pulse"></div>
                        <div class="relative z-10 w-full h-full border-2 border-dashed border-[#0081FF]/30 rounded-full flex flex-col items-center justify-center text-center p-4">
                            <span class="material-symbols-rounded text-4xl text-[#0081FF] mb-2">expand_circle_down</span>
                            <p class="text-[10px] text-gray-400 font-bold uppercase">Movimento Inspiratório</p>
                            <p class="text-xs text-white">Descida e Expansão</p>
                        </div>
                    </div>
                </div>
                <div class="bg-black/20 p-4 rounded-xl border border-white/5 text-xs text-gray-400 italic">
                    Dica: Você não "puxa" o ar com o nariz. Você expande o corpo e o ar "entra sozinho" por diferença de pressão.
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-xl font-bold text-white mb-4">Expansão 360º</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    Fuja do erro de estufar apenas a barriga para frente. A verdadeira respiração custofreunobasal expande as <span class="text-[#6F4CE7] font-bold">costelas laterais</span> e as <span class="text-[#FF00BC] font-bold">costas</span>.
                </p>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div class="w-8 h-8 rounded-lg bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] mb-2">
                            <span class="material-symbols-rounded">side_navigation</span>
                        </div>
                        <p class="text-xs font-bold text-white mb-1">Laterais</p>
                        <p class="text-[10px] text-gray-500">Abertura das costelas flutuantes.</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div class="w-8 h-8 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] mb-2">
                            <span class="material-symbols-rounded">back_hand</span>
                        </div>
                        <p class="text-xs font-bold text-white mb-1">Costas</p>
                        <p class="text-[10px] text-gray-500">Expansão da região lombar.</p>
                    </div>
                </div>
                <div class="p-4 rounded-xl bg-[#0081FF]/10 border border-[#0081FF]/20 text-xs text-blue-200">
                     <strong>Pratique:</strong> Coloque as mãos na cintura (como se estivesse bravo) e sinta seus dedos serem empurrados para os lados ao inspirar.
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="text-center mb-8">
                 <span class="text-[10px] font-black text-[#0081FF] uppercase tracking-[0.2em]">Desafio de Fixação</span>
                 <h2 class="text-2xl font-black text-white mt-1">Quiz 01: Propriocepção</h2>
            </div>

            <div class="space-y-3">
                <p class="text-sm text-gray-400 mb-4 px-2">Qual o movimento correto do diafragma durante a inspiração?</p>
                
                <div class="quiz-option p-4 rounded-2xl bg-[#1A202C] border border-white/5 flex items-center gap-4 cursor-pointer transition-all hover:border-[#0081FF]/50" data-correct="true">
                    <div class="option-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                        <span class="text-sm font-bold">A</span>
                    </div>
                    <p class="text-sm text-white font-medium">Ele desce e expande a base dos pulmões.</p>
                </div>

                <div class="quiz-option p-4 rounded-2xl bg-[#1A202C] border border-white/5 flex items-center gap-4 cursor-pointer transition-all hover:border-[#0081FF]/50" data-correct="false">
                    <div class="option-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                        <span class="text-sm font-bold">B</span>
                    </div>
                    <p class="text-sm text-white font-medium">Ele sobe para empurrar o ar para cima.</p>
                </div>

                <div class="quiz-option p-4 rounded-2xl bg-[#1A202C] border border-white/5 flex items-center gap-4 cursor-pointer transition-all hover:border-[#0081FF]/50" data-correct="false">
                    <div class="option-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                        <span class="text-sm font-bold">C</span>
                    </div>
                    <p class="text-sm text-white font-medium">Ele expande apenas para frente, estufando o umbigo.</p>
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-xl font-bold text-white mb-4">Retenção e Suspensão</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    Entre a inspiração e a expiração, existe um momento de <span class="text-[#6F4CE7] font-bold">suspensão</span>. Não é um trancamento da glote, mas um equilíbrio muscular onde você "sustenta" a abertura sem soltar o ar.
                </p>
                <div class="bg-black/40 rounded-3xl p-8 flex flex-col items-center">
                    <div class="w-32 h-32 rounded-full border-4 border-[#6F4CE7] flex items-center justify-center animate-pulse">
                         <span class="material-symbols-rounded text-5xl text-[#6F4CE7]">pause</span>
                    </div>
                    <p class="mt-6 text-xs text-gray-400 font-bold uppercase tracking-widest">Estado de Prontidão</p>
                </div>
                <p class="text-xs text-gray-500 mt-6 leading-relaxed">
                    Pense em uma bailarina no topo de um salto: há um milissegundo de imobilidade ativa antes da descida. Isso é a suspensão vocal.
                </p>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-gradient-to-br from-[#101622] to-[#1A202C] p-8 rounded-[32px] border border-white/10 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-40 h-40 bg-[#FF00BC] blur-[100px] opacity-10"></div>
                <h2 class="text-2xl font-black text-white mb-4">O Segredo do Appoggio</h2>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    "Appoggiare" em italiano significa <span class="text-[#FF00BC] font-bold">Apoiar</span>. O suporte não é "empurrar" o ar para fora, mas <span class="text-[#0081FF] font-bold">resistir</span> à sua saída rápida.
                </p>
                <div class="space-y-4">
                    <div class="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div class="w-10 h-10 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] shrink-0">
                            <span class="material-symbols-rounded">speed</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-white">Controle de Fluxo</p>
                            <p class="text-[10px] text-gray-500">Economia máxima para frases longas.</p>
                        </div>
                    </div>
                    <div class="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div class="w-10 h-10 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] shrink-0">
                            <span class="material-symbols-rounded">shield</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-white">Estabilidade</p>
                            <p class="text-[10px] text-gray-500">Evita que a nota "balance" ou desafine.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-xl font-bold text-white mb-4">Pressão Subglótica</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    A física do canto: O ar acumulado abaixo das pregas vocais gera uma <span class="text-[#FF00BC] font-bold">pressão</span>. Se a pressão for pouca, a voz soa soprosa. Se for muita, a voz soa gritada.
                </p>
                <div class="relative py-10 flex justify-center">
                    <div class="w-20 h-40 bg-[#151A23] rounded-full border-2 border-white/10 relative overflow-hidden">
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0081FF] to-[#FF00BC] h-24 animate-bounce"></div>
                        <div class="absolute top-1/4 left-0 right-0 h-0.5 bg-white/20"></div>
                        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-4 text-[8px] font-bold text-white uppercase">Glote</div>
                    </div>
                </div>
                <div class="bg-black/20 p-4 rounded-xl border border-white/5 text-xs text-center text-gray-400">
                    O apoio serve para <span class="text-white">equilibrar</span> essa balança de pressão.
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="text-center mb-8">
                 <span class="text-[10px] font-black text-[#FF00BC] uppercase tracking-[0.2em]">Verificação Técnica</span>
                 <h2 class="text-2xl font-black text-white mt-1">Quiz 02: Suporte Vocal</h2>
            </div>

            <div class="space-y-3">
                <p class="text-sm text-gray-400 mb-4 px-2">O que define o verdadeiro "Apoio Vocal" (Appoggio)?</p>
                
                <div class="quiz-option p-4 rounded-2xl bg-[#1A202C] border border-white/5 flex items-center gap-4 cursor-pointer transition-all hover:border-[#FF00BC]/50" data-correct="false">
                    <div class="option-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                        <span class="text-sm font-bold">A</span>
                    </div>
                    <p class="text-sm text-white font-medium">Fazer força com o abdome para expulsar o ar.</p>
                </div>

                <div class="quiz-option p-4 rounded-2xl bg-[#1A202C] border border-white/5 flex items-center gap-4 cursor-pointer transition-all hover:border-[#FF00BC]/50" data-correct="true">
                    <div class="option-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                        <span class="text-sm font-bold">B</span>
                    </div>
                    <p class="text-sm text-white font-medium">Equilibrar a pressão inspiratória com a expiratória.</p>
                </div>

                <div class="quiz-option p-4 rounded-2xl bg-[#1A202C] border border-white/5 flex items-center gap-4 cursor-pointer transition-all hover:border-[#FF00BC]/50" data-correct="false">
                    <div class="option-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                        <span class="text-sm font-bold">C</span>
                    </div>
                    <p class="text-sm text-white font-medium">Prender a respiração para que o ar não saia.</p>
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-xl font-bold text-white mb-4">Gestão do Ar Residual</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    Nunca cante até ficar "roxo" ou sem nada de ar. O final da expiração é onde mora o perigo da <span class="text-[#FF00BC] font-bold">tensão laríngea</span>.
                </p>
                <div class="bg-[#FF00BC]/10 border border-[#FF00BC]/20 p-6 rounded-2xl text-center">
                    <span class="material-symbols-rounded text-4xl text-[#FF00BC] mb-3">warning</span>
                    <p class="text-sm font-bold text-red-200">A Regra dos 20%</p>
                    <p class="text-xs text-red-300/70 mt-2">Sempre deixe uma reserva de ar. Se você espremer o final, seu pescoço assumirá a carga e você terá pigarro e cansaço.</p>
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-xl font-bold text-white mb-4">Antagonismo Muscular</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    O apoio é uma <span class="text-[#0081FF] font-bold">Luta Amigável</span>.
                </p>
                <div class="space-y-3">
                    <div class="p-4 rounded-xl bg-white/5 flex items-center justify-between">
                        <span class="text-xs text-gray-300">Músculos Expiratórios</span>
                        <span class="text-[10px] font-black text-[#FF00BC]">QUEREM FECHAR</span>
                    </div>
                    <div class="flex justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-3xl">swap_vert</span>
                    </div>
                    <div class="p-4 rounded-xl bg-white/5 flex items-center justify-between">
                        <span class="text-xs text-gray-300">Músculos Inspiratórios</span>
                        <span class="text-[10px] font-black text-[#0081FF]">QUEREM MANTER ABERTO</span>
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-6 italic text-center">Essa resistência mútua cria a coluna de ar estável.</p>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-xl font-bold text-white mb-4">O Perigo do Over-Blowing</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6">
                    Sabe aquela sensação de "ar demais" que trava a garganta? Isso se chama <span class="text-[#FF00BC] font-bold">Over-Blowing</span>. 
                </p>
                <div class="p-5 rounded-2xl bg-black/40 border-l-4 border-[#FF00BC]">
                     <p class="text-xs text-gray-400">Muita pressão de ar empurra as pregas vocais para se abrirem. O corpo então reage "apertando" o pescoço para não deixar o ar vazar.</p>
                     <p class="text-xs font-bold text-white mt-3">Resultado: Perda de agudos e rouquidão.</p>
                </div>
                <div class="mt-8 flex justify-center">
                    <span class="material-symbols-rounded text-6xl text-gray-700">air_freshener</span>
                </div>
            </div>
        </div>
        <!-- slide -->
        <div class="space-y-6 font-sans">
            <div class="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0081FF] to-[#6F4CE7] p-10 text-center shadow-2xl">
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div class="relative z-10">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                        <span class="material-symbols-rounded text-white text-3xl">verified</span>
                    </div>
                    <h2 class="text-2xl font-black text-white mb-2">Conclusão: Apoio Orgânico</h2>
                    <p class="text-sm text-white/80 leading-relaxed mb-8">
                        A respiração deve se tornar um reflexo automático. Pratique isolado para que, na hora de cantar, sua mente esteja apenas na <span class="text-white font-black underline">EMOÇÃO</span> da música.
                    </p>
                    <button class="w-full py-4 bg-white text-[#0081FF] font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform" onclick="window.location.reload()">
                        Finalizar Módulo
                    </button>
                </div>
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
               <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[80px] opacity-20"></div>
               <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <div class="w-8 h-8 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
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
                        
                        <div class="text-xs text-[#6F4CE7] font-medium">
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
                    <span class="material-symbols-rounded text-[#0081FF]">checklist</span>
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
        number: '03',
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
                            <span class="material-symbols-rounded text-[#0081FF] mt-0.5">check_circle</span>
                            <div>
                                <strong class="text-white text-sm block">Efeito Protetor</strong>
                                <p className="text-xs text-gray-400">Afasta as pregas vocais ligeiramente, evitando que elas colidam com força excessiva.</p>
                            </div>
                        </li>
                        <li class="flex gap-3">
                            <span class="material-symbols-rounded text-[#0081FF] mt-0.5">check_circle</span>
                            <div>
                                <strong class="text-white text-sm block">Eficiência</strong>
                                <p className="text-xs text-gray-400">Reduz o esforço fonatório, tornando a vibração mais eficiente com menos pressão.</p>
                            </div>
                        </li>
                        <li class="flex gap-3">
                            <span class="material-symbols-rounded text-[#0081FF] mt-0.5">check_circle</span>
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
                        <p class="text-xs text-[#6F4CE7] italic">Teste: Se você sentir a garganta "apertar", o som está muito recuado.</p>
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
    // --- FASE 2: O MECANISMO E A CONEXÃO (O EQUILÍBRIO) ---
    {
        id: 'm3',
        number: '04',
        title: 'Técnica de Emissão',
        subtitle: 'Registros e Agilidade',
        description: 'O núcleo da agilidade e controle vocal.',
        topics: [
            {
                id: '3.1',
                title: 'Registro de Peito (M1)',
                description: 'Fortalecimento do TA.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#0081FF]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] mb-8">
                <span class="material-symbols-rounded text-4xl">fitness_center</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">O Conceito: Registro de Peito (M1)</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                O M1 é a nossa <strong>"base"</strong>. Aqui, as pregas vocais estão mais curtas e grossas. O foco não é gritar, mas sim encontrar uma adução (fechamento) eficiente.
              </p>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 class="text-[#0081FF] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span class="material-symbols-rounded text-sm">psychology</span>
                    Objetivo
                </h4>
                <p class="text-gray-300 text-sm">
                    Desenvolver a musculatura <strong>Tireoaritenóidea (TA)</strong> para garantir uma voz firme, estável e com corpo.
                </p>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded">play_circle</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Exercício Prático: Adução Firme</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-xs font-bold shrink-0 mt-0.5">1</div>
                            <p class="text-gray-300 text-sm">Utilize a consoante <strong>"G"</strong> (fricativa sonora) para ajudar no fechamento das pregas.</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-xs font-bold shrink-0 mt-0.5">2</div>
                            <p class="text-gray-300 text-sm">Cante uma escala de 3 notas (Do-Re-Mi-Re-Do) usando a sílaba <strong>"GA"</strong>.</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-xs font-bold shrink-0 mt-0.5">3</div>
                            <p class="text-gray-300 text-sm">Mantenha uma intenção de fala firme, como se estivesse a dizer um <strong>"NÃO" decidido</strong>.</p>
                        </div>
                    </div>

                    <div class="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black text-gray-500 uppercase tracking-widest">Player de Exemplo</span>
                            <span class="px-2 py-1 rounded-md bg-[#0081FF]/10 text-[#0081FF] text-[10px] font-bold uppercase">M1 / TA</span>
                        </div>
                        <div class="flex items-center gap-4 player-container">
                            <button class="play-example-btn w-14 h-14 rounded-2xl bg-[#0081FF] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/m1_example.mp3">
                                <span class="material-symbols-rounded text-3xl ml-1">play_arrow</span>
                            </button>
                            <div class="flex-1 space-y-2">
                                <div class="flex items-end gap-1 h-8 opacity-50 audio-viz">
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="8" style="height: 8px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="16" style="height: 16px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="24" style="height: 24px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="12" style="height: 12px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="20" style="height: 20px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="14" style="height: 14px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="10" style="height: 10px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="18" style="height: 18px"></div>
                                </div>
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest">Atenção: Ativo somente para assinantes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Checkpoint</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m3_1_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Se sentir um "sopro" na voz, aumente a firmeza do "G".</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m3_1_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Se sentir aperto na garganta, relaxe a mandíbula.</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            },
            {
                id: '3.2',
                title: 'Registro de Cabeça (M2)',
                description: 'Estiramento via CT.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#FF00BC]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] mb-8">
                <span class="material-symbols-rounded text-4xl">auto_awesome</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">O Conceito: Registro de Cabeça (M2)</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                No M2, as pregas vocais são esticadas como cordas de um violino. A massa diminui e o som torna-se mais <strong>flautado</strong>.
              </p>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 class="text-[#FF00BC] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span class="material-symbols-rounded text-sm">psychology</span>
                    Objetivo
                </h4>
                <p class="text-gray-300 text-sm">
                    Ativar o músculo <strong>Cricotireóideo (CT)</strong> para alcançar agudos leves, estáveis e sem esforço laríngeo.
                </p>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                        <span class="material-symbols-rounded">play_circle</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Exercício Prático: Som do Falsete Conectado</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-xs font-bold shrink-0 mt-0.5">1</div>
                            <p class="text-gray-300 text-sm">Utilize a vogal <strong>"U"</strong>, que naturalmente favorece o estiramento das pregas e o abaixamento da laringe.</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-xs font-bold shrink-0 mt-0.5">2</div>
                            <p class="text-gray-300 text-sm">Faça um <strong>glissando descendente</strong> (de cima para baixo) começando numa nota aguda confortável.</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-xs font-bold shrink-0 mt-0.5">3</div>
                            <p class="text-gray-300 text-sm">Imite o som de uma coruja ou um fantasma: <strong>"HUUUUU"</strong>.</p>
                        </div>
                    </div>

                    <div class="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black text-gray-500 uppercase tracking-widest">Player de Exemplo</span>
                            <span class="px-2 py-1 rounded-md bg-[#FF00BC]/10 text-[#FF00BC] text-[10px] font-bold uppercase">M2 / CT</span>
                        </div>
                        <div class="flex items-center gap-4 player-container">
                            <button class="play-example-btn w-14 h-14 rounded-2xl bg-[#FF00BC] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/m2_example.mp3">
                                <span class="material-symbols-rounded text-3xl ml-1">play_arrow</span>
                            </button>
                            <div class="flex-1 space-y-2">
                                <div class="flex items-end gap-1 h-8 opacity-50 audio-viz">
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="12" style="height: 12px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="24" style="height: 24px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="18" style="height: 18px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="14" style="height: 14px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="22" style="height: 22px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="10" style="height: 10px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="28" style="height: 28px"></div>
                                    <div class="flex-1 bg-white/20 rounded-full" data-base-height="16" style="height: 16px"></div>
                                </div>
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest">Atenção: Ativo somente para assinantes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Checkpoint</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m3_2_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">O foco é a leveza. Não tente colocar volume aqui.</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m3_2_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">O som deve ser limpo e sem ar excessivo.</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            },
            {
                id: '3.4',
                title: 'Agilidade',
                description: 'Escalas e precisão.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#0081FF]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] mb-8">
                <span class="material-symbols-rounded text-4xl">speed</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">O Conceito: Agilidade Vocal</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                A agilidade é o resultado de uma <strong>laringe livre</strong> e um fluxo de ar constante. O segredo é deixar as notas fluírem sobre o sopro, sem "golpear" cada uma.
              </p>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 class="text-[#0081FF] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span class="material-symbols-rounded text-sm">psychology</span>
                    Objetivo
                </h4>
                <p class="text-gray-300 text-sm">
                    Treinar a resposta motora fina para executar passagens rápidas sem perder a afinação ou a qualidade do registro.
                </p>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded">play_circle</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Exercício Prático: Velocidade e Articulação</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-xs font-bold shrink-0 mt-0.5">1</div>
                            <p class="text-gray-300 text-sm">Escolha uma <strong>escala pentatónica</strong> simples.</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-xs font-bold shrink-0 mt-0.5">2</div>
                            <p class="text-gray-300 text-sm">Utilize a sílaba <strong>"VI"</strong> (o "V" ajuda a manter a pressão e o "I" ajuda na ressonância alta).</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-6 h-6 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] text-xs font-bold shrink-0 mt-0.5">3</div>
                            <p class="text-gray-300 text-sm">Comece devagar e aumente a velocidade gradualmente.</p>
                        </div>
                    </div>

                    <div class="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black text-gray-500 uppercase tracking-widest">Controle de Agilidade</span>
                            <span class="px-2 py-1 rounded-md bg-[#0081FF]/10 text-[#0081FF] text-[10px] font-bold uppercase">Tempo Real</span>
                        </div>
                        
                        <div class="flex flex-col gap-6 player-container">
                            <div class="flex items-center gap-4">
                                <button class="play-example-btn w-14 h-14 rounded-2xl bg-[#0081FF] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/agility_example.mp3">
                                    <span class="material-symbols-rounded text-3xl ml-1">play_arrow</span>
                                </button>
                                <div class="flex-1 space-y-2">
                                    <div class="flex items-end gap-1 h-8 opacity-50 audio-viz">
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="8" style="height: 8px"></div>
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="20" style="height: 20px"></div>
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="32" style="height: 32px"></div>
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="16" style="height: 16px"></div>
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="24" style="height: 24px"></div>
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="12" style="height: 12px"></div>
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="18" style="height: 18px"></div>
                                        <div class="flex-1 bg-white/20 rounded-full" data-base-height="10" style="height: 10px"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white/5 rounded-xl p-3 border border-white/5">
                                <p class="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-3 font-bold">Ajuste de Velocidade (BPM)</p>
                                <div class="grid grid-cols-4 gap-2">
                                    <button class="speed-btn py-2 rounded-lg bg-black/40 text-white text-xs font-bold border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.5">0.5x</button>
                                    <button class="speed-btn py-2 rounded-lg bg-black/40 text-white text-xs font-bold border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.75">0.75x</button>
                                    <button class="speed-btn py-2 rounded-lg bg-black/40 text-white text-xs font-bold border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.0">1.0x</button>
                                    <button class="speed-btn py-2 rounded-lg bg-black/40 text-white text-xs font-bold border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.25">1.25x</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Checkpoint</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m3_4_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">A precisão vem antes da velocidade.</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m3_4_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Se as notas ficarem "borradas", volte ao tempo mais lento.</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            }
        ]
    },
    {
        id: 'm5',
        number: '05',
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
                        A Transição de Registro é a coordenação neuromuscular que permite ao cantor transitar entre diferentes ajustes laríngeos sem quebras, fendas ou tensões. Assista dominar a "Terceira Via".
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
                       <strong class="text-[#6F4CE7] text-sm block mb-1">Ajuste de Vogais (Vowel modification)</strong>
                       <p class="text-xs text-gray-400">A técnica de "escurecer" ou fechar levemente as vogais na transição para evitar o grito.</p>
                    </div>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '5.2',
                title: '2. Mix Vocal (Bridge)',
                description: 'O equilíbrio entre massa e alongamento (eliminando a quebra).',
                content: `
          <div class="space-y-8 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-10"></div>
                <div class="relative z-10">
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-rounded text-[#0081FF]">gradient</span>
                        O Que é a Voz Mista?
                    </h3>
                    <p class="text-sm text-gray-300 leading-relaxed">
                        A Voz Mista não é um "terceiro lugar" físico, mas uma coordenação onde os músculos de peito (TA) e cabeça (CT) trabalham em equilíbrio. É a ponte que elimina a quebra vocal.
                    </p>
                </div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                   <strong class="text-[#0081FF] text-xs uppercase block mb-1">Sensação</strong>
                   <p class="text-xs text-gray-400">Som com a facilidade do agudo, mas com a ressonância e "corpo" do grave.</p>
                </div>
                <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                   <strong class="text-[#FF00BC] text-xs uppercase block mb-1">Objetivo</strong>
                   <p class="text-xs text-gray-400">Navegar por toda a extensão sem que o ouvinte perceba a mudança de registro.</p>
                </div>
             </div>
          </div>
        `
            },
            {
                id: '5.3',
                title: '3. Prática Guiada',
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
                   <strong class="text-white text-xs block mb-1">Exercício: Vibração</strong>
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
                id: '5.4',
                title: '4. Diagnóstico de Erros Comuns',
                description: 'O que evitar na prática.',
                content: `
          <div class="space-y-6 font-sans">
             <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <span class="material-symbols-rounded text-[#FF00BC]">error</span>
                   Armadilhas do Passaggio
                </h3>
                
                <div class="space-y-3">
                   <div class="p-3 border border-[#FF00BC]/20 bg-[#FF00BC]/5 rounded-xl">
                      <strong class="text-[#FF00BC] text-sm block mb-1">Soprosidade Excessiva</strong>
                      <p class="text-xs text-gray-300">
                         Quando o aluno "desiste" da conexão e cai em um falsete puro, sem corpo. Mantenha a adução!
                      </p>
                   </div>
                   <div class="p-3 border border-[#FF00BC]/20 bg-[#FF00BC]/5 rounded-xl">
                      <strong class="text-[#FF00BC] text-sm block mb-1">"Grito" (Pulling Chest)</strong>
                      <p class="text-xs text-gray-300">
                         Tentar levar o peso do peito para onde a musculatura CT deveria dominar. Resultado: Quebra abrupta.
                      </p>
                   </div>
                   <div class="p-3 border border-[#FF00BC]/20 bg-[#FF00BC]/5 rounded-xl">
                      <strong class="text-[#FF00BC] text-sm block mb-1">Laringe Elevada</strong>
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
        id: 'm4',
        number: '06',
        title: 'Ressonância e Articulação',
        subtitle: 'Cor e Projeção',
        description: 'Onde o som ganha identidade.',
        topics: [
            {
                id: '4.1',
                title: 'Ajustes de Trato Vocal',
                description: 'Posicionamento de laringe e palato.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#6F4CE7]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#6F4CE7] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] mb-8">
                <span class="material-symbols-rounded text-4xl">voice_selection</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">Conceito: O Trato Vocal</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                O trato vocal é a sua <strong>"caixa de som"</strong> natural. Ao ajustar a altura da laringe e a posição do palato (céu da boca), você molda a identidade e a cor da sua voz.
              </p>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 class="text-[#6F4CE7] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span class="material-symbols-rounded text-sm">psychology</span>
                    Objetivo
                </h4>
                <p class="text-gray-300 text-sm">
                    Aprender a moldar o timbre vocal através do controle consciente da laringe e do palato.
                </p>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-2xl">graphic_eq</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">A Prática: O Jogo da Laringe</h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-3">
                        <div class="flex items-center gap-2 text-[#0081FF]">
                            <span class="material-symbols-rounded text-2xl">south</span>
                            <span class="font-black uppercase tracking-widest text-xs">Voz Encorpada (Laringe Baixa)</span>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            Pense no início de um <strong>bocejo</strong> ou na voz de um locutor de rádio antigo. Sinta o espaço na garganta aumentar. Gera um som redondo e profundo.
                        </p>
                    </div>

                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-3">
                        <div class="flex items-center gap-2 text-[#FF00BC]">
                            <span class="material-symbols-rounded text-2xl">north</span>
                            <span class="font-black uppercase tracking-widest text-xs">Voz Brilhante (Laringe Alta)</span>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            Pense em um <strong>sorriso interno</strong>. Sinta o som ficar mais leve e agudo. É a base para estilos como o Pop e o Sertanejo.
                        </p>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-2xl">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Ponto de Verificação</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m6_1_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Consigo mudar a "cor" da nota (escura/clara) sem mudar a altura musical?</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m6_1_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Sinto o movimento da laringe sem gerar tensão excessiva na língua?</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            },
            {
                id: '4.2',
                title: 'Dicção e Fonética',
                description: 'Ajuste de Vogais, Ligado e Destacado.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#0081FF]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] mb-8">
                <span class="material-symbols-rounded text-4xl">spellcheck</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">Articulação e Clareza</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                Articular com clareza sem quebrar o fluxo da música é o segredo da <strong>inteligibilidade</strong>. A voz precisa fluir como um rio enquanto as palavras são desenhadas.
              </p>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 class="text-[#0081FF] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span class="material-symbols-rounded text-sm">psychology</span>
                    Ajuste de Vogais (Vowel Shaping)
                </h4>
                <p class="text-gray-300 text-sm">
                    Em notas mais altas, vogais muito abertas (como o <strong>"A"</strong>) podem fazer a voz rachar. Arredonde levemente o som (um "A" com intenção de <strong>"O"</strong>) para manter a estabilidade.
                </p>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded text-2xl">graphic_eq</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Canto Ligado vs. Destacado</h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-2">
                        <strong class="text-white text-sm block">Ligado</strong>
                        <p class="text-gray-400 text-xs italic">"As notas fluem como um rio."</p>
                        <p class="text-gray-300 text-sm">Não há interrupção no fluxo de ar entre as palavras. A voz permanece conectada.</p>
                    </div>

                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-2">
                        <strong class="text-white text-sm block">Destacado</strong>
                        <p class="text-gray-400 text-xs italic">"Notas curtas e precisas."</p>
                        <p class="text-gray-300 text-sm">Usa impulsos rápidos do abdômen (apoio). Cada nota é um ponto isolado de som.</p>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-2xl">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Ponto de Verificação</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m6_2_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Consigo cantar frases rápidas sem "comer" o final das palavras?</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m6_2_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Mantenho o fôlego estável durante o canto ligado?</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            },
            {
                id: '4.3',
                title: 'Projeção (Brilho Vocal)',
                description: 'Ganho de volume sem esforço.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#FF00BC]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] mb-8">
                <span class="material-symbols-rounded text-4xl">campaign</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">O Conceito: Brilho Vocal</h3>
              <p class="text-gray-300 leading-relaxed text-lg">
                É um ajuste que concentra o som na parte da frente do rosto. É o que permite que sua voz seja ouvida com clareza mesmo com instrumentos altos ao fundo, sem fazer força na garganta.
              </p>
            </div>

            <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 class="text-[#FF00BC] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span class="material-symbols-rounded text-sm">psychology</span>
                    A Prática: O Som Metálico
                </h4>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-xs font-bold shrink-0 mt-0.5">1</div>
                        <p class="text-gray-300 text-sm">Imite o som de uma <strong>risada de bruxa</strong> ("Rê-Rê-Rê") ou um choro de bebê bem estridente.</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p class="text-gray-300 text-sm">Sinta o som vibrar na <strong>"máscara" do rosto</strong> (perto do nariz e dentes superiores).</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p class="text-gray-300 text-sm">Aplique essa "frequência metálica" em uma escala simples usando a sílaba <strong>"NÊ"</strong>.</p>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded text-2xl">tips_and_updates</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Dicas Rápidas 📘</h3>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div class="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-2">
                        <div class="flex items-center gap-2 text-[#FF00BC] mb-1">
                            <span class="material-symbols-rounded text-sm">keyboard_double_arrow_up</span>
                            <span class="text-[10px] font-black uppercase tracking-widest">O Céu da Boca</span>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            Mantenha o palato mole elevado para evitar que a voz fique "anasalada" demais e perca a beleza do timbre.
                        </p>
                    </div>

                    <div class="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-2">
                        <div class="flex items-center gap-2 text-[#0081FF] mb-1">
                            <span class="material-symbols-rounded text-sm">sentiment_satisfied</span>
                            <span class="text-[10px] font-black uppercase tracking-widest">Mandíbula Livre</span>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            Nunca trave os dentes para articular. A clareza vem do movimento da língua e dos lábios, não da força na mandíbula.
                        </p>
                    </div>

                    <div class="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-2">
                        <div class="flex items-center gap-2 text-[#0081FF] mb-1">
                            <span class="material-symbols-rounded text-sm">gps_fixed</span>
                            <span class="text-[10px] font-black uppercase tracking-widest">O Foco da Voz</span>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            Imagine que o som nasce na garganta, mas o alvo dele é o seu dente da frente. Isso ajuda na projeção sem esforço.
                        </p>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-2xl">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Ponto de Verificação</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m6_3_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">O som soa "cortante" e alto sem que eu precise fazer força?</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m6_3_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Sinto o espaço na "máscara" do rosto vibrar?</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            }
        ]
    },
    // --- FASE 3: DESENVOLVIMENTO E PERFORMANCE (A EXPANSÃO) ---
    {
        id: 'm6',
        number: '07',
        title: 'Agilidade e Precisão Articulatória',
        subtitle: 'Trava-Línguas',
        description: 'Mantenha a laringe relaxada. Pratique em 3 fases: 1. Sussurrado, 2. Lento/Exagerado, 3. Velocidade Máxima.',
        topics: [
            {
                id: '6.1',
                title: 'Agilidade de Língua (R/T)',
                description: 'Três pratos de trigo para três tigres tristes.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#6F4CE7]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#6F4CE7] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] mb-8">
                <span class="material-symbols-rounded text-4xl">record_voice_over</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">Nível 1: Articulação Falada</h3>
              <p class="text-gray-300 leading-relaxed text-lg italic">
                "Três pratos de trigo para três tigres tristes."
              </p>
              <div class="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p class="text-sm text-gray-300 leading-relaxed">
                  Recite foque no movimento <strong>exagerado</strong> da ponta da língua contra os dentes (R) e o palato (T). Mantenha o apoio abdominal firme.
                </p>
              </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded text-2xl">music_note</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Nível 2: O Trava-Língua Cantado</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <p class="text-gray-300 text-sm leading-relaxed">
                        Cante o texto subindo e descendo uma <strong>escala de 5 notas</strong>. Isso coordena a afinação com a agilidade muscular.
                    </p>

                    <div class="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black text-gray-500 uppercase tracking-widest">Escala Base</span>
                            <span class="px-2 py-1 rounded-md bg-[#0081FF]/10 text-[#0081FF] text-[10px] font-bold uppercase">Agilidade</span>
                        </div>
                        <div class="flex items-center gap-4 player-container">
                            <button class="play-example-btn w-14 h-14 rounded-2xl bg-[#0081FF] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/scale_5_notes.mp3">
                                <span class="material-symbols-rounded text-3xl ml-1">play_arrow</span>
                            </button>
                            <div class="flex-1">
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest">Atenção: Exemplo de Áudio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded text-2xl">timer</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Nível 3: Desafio do Metrônomo</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <p class="text-gray-300 text-sm leading-relaxed text-center">
                        Mantenha a clareza sem "atropelar" as consoantes conforme a velocidade aumenta.
                    </p>

                    <div class="player-container space-y-4">
                        <button class="play-example-btn w-full py-4 bg-[#0081FF] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/metronome_click.mp3">
                            <span class="material-symbols-rounded">play_circle</span>
                            INICIAR TREINO
                        </button>

                        <div class="grid grid-cols-4 gap-2">
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.5">LENTA</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.75">MÉDIA</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.0">RÁPIDA</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.25">ULTRA</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-2xl">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Ponto de Verificação</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m7_1_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Consigo pronunciar todos os "R" e "T" de forma nítida?</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m7_1_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Sinto o apoio abdominal sustentando a agilidade?</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            },
            {
                id: '6.2',
                title: 'Controle de Lábios (P/B)',
                description: 'O peito do pé do Pedro é preto.',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#FF00BC]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] mb-8">
                <span class="material-symbols-rounded text-4xl">lips</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">Nível 1: Articulação Falada</h3>
              <p class="text-gray-300 leading-relaxed text-lg italic">
                "O peito do pé do Pedro é preto."
              </p>
              <div class="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p class="text-sm text-gray-300 leading-relaxed">
                  Foque na explosão das consoantes <strong>bilabiais (P/B)</strong>. O movimento deve nascer na pressão dos lábios, não na garganta.
                </p>
              </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                        <span class="material-symbols-rounded text-2xl">music_note</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Nível 2: O Trava-Língua Cantado</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <p class="text-gray-300 text-sm leading-relaxed">
                        Cante o texto em triandês (Do-Mi-Sol) mantendo o <strong>picado (staccato)</strong> bem curto e preciso.
                    </p>

                    <div class="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black text-gray-500 uppercase tracking-widest">Arpejo Base</span>
                            <span class="px-2 py-1 rounded-md bg-[#FF00BC]/10 text-[#FF00BC] text-[10px] font-bold uppercase">Precisão</span>
                        </div>
                        <div class="flex items-center gap-4 player-container">
                            <button class="play-example-btn w-14 h-14 rounded-2xl bg-[#FF00BC] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/arpegio_staccato.mp3">
                                <span class="material-symbols-rounded text-3xl ml-1">play_arrow</span>
                            </button>
                            <div class="flex-1">
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest">Atenção: Exemplo de Áudio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded text-2xl">timer</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Nível 3: Desafio do Metrônomo</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <p class="text-gray-300 text-sm leading-relaxed text-center">
                        Execute o trava-língua repetidamente sem deixar os lábios "cansarem" ou perderem a vedação.
                    </p>

                    <div class="player-container space-y-4">
                        <button class="play-example-btn w-full py-4 bg-[#0081FF] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/metronome_click.mp3">
                            <span class="material-symbols-rounded">play_circle</span>
                            INICIAR TREINO
                        </button>

                        <div class="grid grid-cols-4 gap-2">
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.5">0.5x</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.75">0.75x</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.0">1.0x</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.25">1.25x</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-2xl">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Ponto de Verificação</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m7_2_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Os lábios estalam de forma clara em cada "P" e "B"?</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m7_2_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">Consigo manter o som curto sem gerar tensão no queixo?</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
            </div>
        `
            },
            {
                id: '6.3',
                title: 'Precisão de Sibilantes (S/X)',
                description: 'O sabiá não sabia que o sábio sabia...',
                content: `
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-[#0081FF]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
              <div class="w-16 h-16 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] mb-8">
                <span class="material-symbols-rounded text-4xl">air</span>
              </div>
              <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">Nível 1: Articulação Falada</h3>
              <p class="text-gray-300 leading-relaxed text-sm italic">
                "O sabiá não sabia que o sábio sabia que o sabiá não sabia assobiar."
              </p>
              <div class="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p class="text-sm text-gray-300 leading-relaxed">
                  Trabalhe o fluxo de ar contínuo através das consoantes <strong>fricativas (S/X)</strong>. Evite que o som escape de uma vez; mantenha a pressão constante.
                </p>
              </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded text-2xl">music_note</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Nível 2: O Trava-Língua Cantado</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <p class="text-gray-300 text-sm leading-relaxed">
                        Cante a frase mantendo o <strong>legato (ligado)</strong>. O desafio aqui é não interromper o fôlego entre os fonemas.
                    </p>

                    <div class="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-black text-gray-500 uppercase tracking-widest">Escala Ligada</span>
                            <span class="px-2 py-1 rounded-md bg-[#0081FF]/10 text-[#0081FF] text-[10px] font-bold uppercase">Fluxo</span>
                        </div>
                        <div class="flex items-center gap-4 player-container">
                            <button class="play-example-btn w-14 h-14 rounded-2xl bg-[#0081FF] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/legato_scale.mp3">
                                <span class="material-symbols-rounded text-3xl ml-1">play_arrow</span>
                            </button>
                            <div class="flex-1">
                                <p class="text-[10px] text-gray-500 uppercase tracking-widest">Atenção: Exemplo de Áudio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                        <span class="material-symbols-rounded text-2xl">timer</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Nível 3: Desafio do Metrônomo</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-6">
                    <p class="text-gray-300 text-sm leading-relaxed text-center">
                        Controle o "chiado" do S para que ele não domine o som da nota, especialmente em velocidades mais altas.
                    </p>

                    <div class="player-container space-y-4">
                        <button class="play-example-btn w-full py-4 bg-[#0081FF] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" data-src="https://willmakesongs.s3.us-east-005.backblazeb2.com/academia/audio/metronome_click.mp3">
                            <span class="material-symbols-rounded">play_circle</span>
                            INICIAR TREINO
                        </button>

                        <div class="grid grid-cols-4 gap-2">
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.5">0.5x</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="0.75">0.75x</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.0">1.0x</button>
                            <button class="speed-btn py-3 rounded-xl bg-black/40 text-white text-xs font-black border border-white/5 active:bg-[#0081FF] transition-colors" data-speed="1.25">1.25x</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- slide -->

            <div class="space-y-6">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7]">
                        <span class="material-symbols-rounded text-2xl">checklist</span>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tighter">Ponto de Verificação</h3>
                </div>

                <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m7_3_c1">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">O ar flui de forma constante sem "solavancos"?</p>
                    </div>
                    <div class="checklist-item p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4 transition-all" data-id="m7_3_c2">
                        <div class="checkbox-box w-6 h-6 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all shrink-0">
                            <span class="material-symbols-rounded text-white text-lg opacity-0 scale-0 check-icon">check</span>
                        </div>
                        <p class="text-gray-300 text-sm">As consoantes "S" estão discretas e não "sopradas"?</p>
                    </div>
                </div>

                <button class="complete-practice-btn w-full py-5 bg-brand-gradient text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
                    Concluir Aula
                </button>
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
                   <div class="w-10 h-10 rounded-full bg-[#6F4CE7]/20 text-[#6F4CE7] flex items-center justify-center shrink-0">
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
                <span class="material-symbols-rounded text-4xl text-[#0081FF] mb-3">spa</span>
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
    // --- FASE 4: ESTÉTICA E PRÁTICA FINAL (A ARTE) ---
    {
        id: 'm11',
        number: '10',
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
               <div class="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[80px] opacity-20"></div>
               <div class="relative z-10">
                   <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <span class="w-8 h-8 rounded-lg bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] text-sm font-bold">1</span>
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
                    <span class="material-symbols-rounded text-[#0081FF]">tips_and_updates</span>
                    Dicas para o Aluno
                </h3>
                <ul class="space-y-4">
                    <li class="flex gap-3 items-start">
                        <div class="w-1.5 h-1.5 rounded-full bg-[#0081FF] mt-1.5 shrink-0"></div>
                        <p class="text-sm text-gray-300"><b>Paciência:</b> A agilidade vocal é como um treino de academia para os dedos de um pianista. Requer repetição constante.</p>
                    </li>
                    <li class="flex gap-3 items-start">
                        <div class="w-1.5 h-1.5 rounded-full bg-[#0081FF] mt-1.5 shrink-0"></div>
                        <p class="text-sm text-gray-300"><b>Gravação:</b> Grave seus exercícios. Se a frase soar "borrada", diminua a velocidade do seu treino.</p>
                    </li>
                </ul>
            </div>
          </div>
        `
            }
        ]
    },
    {
        id: 'm10',
        number: '11',
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
                        <h4 class="text-[#FF00BC] font-bold text-sm mb-3">🚀 Aplicação</h4>
                        <p class="text-xs text-gray-400">Apresente-se dizendo apenas seu nome e o que faz, sem explicações extras ou justificativas.</p>
                    </div>
                </div>

                <div class="bg-[#0081FF]/10 border border-[#0081FF]/20 p-4 rounded-2xl">
                    <h4 class="text-[#0081FF] font-bold text-[10px] uppercase tracking-widest mb-2">Critério de Avaliação</h4>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-rounded text-[#0081FF] text-sm">check_circle</span>
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
                        <h4 class="text-[#FF00BC] font-bold text-sm mb-3">🚀 Aplicação</h4>
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
                <!-- Header Card -->
                <div class="bg-[#1A202C] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
                    <div class="relative z-10">
                        <h3 class="text-xl font-bold text-white mb-1">Arquitetura Corporal</h3>
                        <p class="text-[11px] text-[#6F4CE7] font-bold italic mb-4 uppercase tracking-widest">"Falar bem não é forçar, é organizar."</p>
                        <p class="text-xs text-gray-400 leading-relaxed">
                            Postura desalinhada gera voz fraca. Dicção clara depende de articulação consciente. Seu corpo é o instrumento que amplifica sua mensagem.
                        </p>
                    </div>
                </div>

                <!-- Technical Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-[#1A202C] p-5 rounded-2xl border border-white/5">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-[#0081FF] font-bold text-sm uppercase">Postura</h4>
                            <span class="text-[10px] text-gray-500 font-medium tracking-tighter">Checklist Técnico</span>
                        </div>
                        <ul class="space-y-2">
                            <li class="flex items-center gap-2 text-xs text-gray-300">
                                <span class="material-symbols-rounded text-[#0081FF] text-sm">check_circle</span>
                                Pés na largura dos ombros
                            </li>
                            <li class="flex items-center gap-2 text-xs text-gray-300">
                                <span class="material-symbols-rounded text-[#0081FF] text-sm">check_circle</span>
                                Ombros relaxados e abertos
                            </li>
                            <li class="flex items-center gap-2 text-xs text-gray-300">
                                <span class="material-symbols-rounded text-[#0081FF] text-sm">check_circle</span>
                                Queixo paralelo ao chão
                            </li>
                        </ul>
                    </div>

                    <div class="bg-[#1A202C] p-5 rounded-2xl border border-white/5">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-[#FF00BC] font-bold text-sm uppercase">Dicção</h4>
                            <span class="text-[10px] text-gray-500 font-medium tracking-tighter">Checklist Técnico</span>
                        </div>
                        <ul class="space-y-2">
                            <li class="flex items-center gap-2 text-xs text-gray-300">
                                <span class="material-symbols-rounded text-[#FF00BC] text-sm">check_circle</span>
                                Sentir a vibração nos lábios
                            </li>
                            <li class="flex items-center gap-2 text-xs text-gray-300">
                                <span class="material-symbols-rounded text-[#FF00BC] text-sm">check_circle</span>
                                Abrir bem a cavidade bucal
                            </li>
                            <li class="flex items-center gap-2 text-xs text-gray-300">
                                <span class="material-symbols-rounded text-[#FF00BC] text-sm">check_circle</span>
                                Pronunciar cada sílaba
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Practice Section -->
                <div class="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-6">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="material-symbols-rounded text-[#6F4CE7]">bolt</span>
                        <h4 class="text-white font-bold text-base uppercase tracking-tight">⚡ PRÁTICA (Níveis de Desafio)</h4>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-4">
                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-[9px] px-2 py-0.5 bg-[#0081FF]/20 text-[#0081FF] rounded-full font-bold uppercase tracking-tight">Nível 1</span>
                                <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Explosão Labial</span>
                            </div>
                            <p class="text-xs text-white italic leading-relaxed">"O peito do pé de Pedro é preto. Quem disser que o peito do pé de Pedro é preto, tem o peito do pé mais preto que o peito do pé de Pedro."</p>
                        </div>

                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                             <div class="flex items-center justify-between mb-2">
                                <span class="text-[9px] px-2 py-0.5 bg-[#FF00BC]/20 text-[#FF00BC] rounded-full font-bold uppercase tracking-tight">Nível 2</span>
                                <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Agilidade</span>
                            </div>
                            <p class="text-xs text-white italic leading-relaxed">"Num ninho de mafagafos, cinco mafagafinhos há! Quem os desmafagafizar, bom desmafagafizador será."</p>
                        </div>

                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                             <div class="flex items-center justify-between mb-2">
                                <span class="text-[9px] px-2 py-0.5 bg-[#6F4CE7]/20 text-[#6F4CE7] rounded-full font-bold uppercase tracking-tight">Nível 3</span>
                                <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Projeção de Ar</span>
                            </div>
                            <p class="text-xs text-white italic leading-relaxed">"Três pratos de trigo para três tigres tristes."</p>
                        </div>

                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                             <div class="flex items-center justify-between mb-2">
                                <span class="text-[9px] px-2 py-0.5 bg-[#0081FF]/20 text-[#0081FF] rounded-full font-bold uppercase tracking-tight">Nível 4</span>
                                <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">P e T</span>
                            </div>
                            <p class="text-xs text-white italic leading-relaxed">"O pinto pia, a pipa pinga. Pinga a pipa e o pinto pia. Quanto mais o pinto pia, mais a pipa pinga."</p>
                        </div>

                        <div class="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                             <div class="flex items-center justify-between mb-2">
                                <span class="text-[9px] px-2 py-0.5 bg-[#FF00BC]/20 text-[#FF00BC] rounded-full font-bold uppercase tracking-tight">Nível 5</span>
                                <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">O Terror (S e Z)</span>
                            </div>
                            <p class="text-xs text-white italic leading-relaxed">"Casa suja, chão sujo. Se a casa é suja, o chão é sujo. Chão sujo, casa suja."</p>
                        </div>
                    </div>

                    <div class="bg-[#0081FF]/10 p-5 rounded-2xl border border-[#0081FF]/20 mt-4 relative overflow-hidden">
                        <div class="absolute -right-4 -bottom-4 opacity-10">
                            <span class="material-symbols-rounded text-6xl text-[#0081FF]">psychology</span>
                        </div>
                        <h5 class="text-white font-bold text-xs mb-4 flex items-center gap-2">
                             <span class="material-symbols-rounded text-sm text-[#6F4CE7]">stars</span>
                             Modo Profissional (Ação Estratégica)
                        </h5>
                        <div class="space-y-4 relative z-10 font-medium">
                            <div class="flex items-start gap-3">
                                <span class="w-5 h-5 rounded-lg bg-[#0081FF] flex items-center justify-center text-[10px] text-white font-black shrink-0">1</span>
                                <p class="text-[11px] text-gray-300 leading-relaxed"><b>Articulação Exagerada:</b> Foco total no movimento muscular e abertura de boca.</p>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="w-5 h-5 rounded-lg bg-[#0081FF] flex items-center justify-center text-[10px] text-white font-black shrink-0">2</span>
                                <p class="text-[11px] text-gray-300 leading-relaxed"><b>Fluidez:</b> Realize a leitura em velocidade média com foco na clareza e ritmo.</p>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="w-5 h-5 rounded-lg bg-[#0081FF] flex items-center justify-center text-[10px] text-white font-black shrink-0">3</span>
                                <p class="text-[11px] text-gray-300 leading-relaxed"><b>Direção Vocal:</b> Direcione sua intenção para o ponto mais distante do ambiente, mantendo a coluna de ar estável.</p>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                        <p class="text-[10px] text-gray-500 italic">
                            ⚠️ "Não use a garganta; use a musculatura e o suporte do ar."
                        </p>
                    </div>

                    <button class="complete-practice-btn w-full py-4 bg-brand-gradient rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group">
                        <span class="material-symbols-rounded text-sm group-hover:animate-bounce">workspace_premium</span>
                        Concluir Prática e Receber Feedback
                    </button>
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
                    <div class="bg-black/40 p-4 rounded-xl border-l-4 border-[#6F4CE7]">
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
                    <div class="inline-block px-6 py-3 bg-[#FF00BC]/20 border border-[#FF00BC]/40 rounded-full">
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

export const INITIAL_TASKS: Task[] = [
    { id: 1, time: '08:00', title: 'Aquecimento Matinal', duration: '15 min', status: 'pending', category: 'Técnica', date: '02' },
    { id: 2, time: '10:00', title: 'Técnica de Respiração (Módulo 3)', duration: '15 min', status: 'pending', category: 'Técnica', date: '02' },
    { id: 3, time: '14:00', title: 'Repertório: Let It Be', duration: '30 min', status: 'pending', category: 'Repertório', date: '02' }
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

