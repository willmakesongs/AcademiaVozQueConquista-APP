# Novos Módulos de Teoria Musical (Baseado no Livro Opus 3)

Este arquivo contém o código para os novos módulos de Harmonia e Teoria Musical.
Adicione este conteúdo ao array `MODULES` no arquivo `constants.ts`.

## Instruções para Antigravity

1.  Abra `constants.ts`.
2.  Localize o array `export const MODULES: Module[] = [ ... ];`.
3.  Insira os objetos abaixo **no final do array**, antes do fechamento `];`.

---

```typescript
    // --- NOVO: MÓDULOS DE HARMONIA E TEORIA (OPUS 3) ---
    {
        id: 'm_harmony_08',
        courseId: 'teoria', // Certifique-se de que o curso 'teoria' existe ou altere para 'canto' se necessário
        number: '08',
        title: 'O CAMPO HARMÔNICO MAIOR',
        subtitle: 'A Estrutura Tonal',
        description: 'Domine a formação de acordes em tríades e tétrades dentro da tonalidade maior.',
        icon: 'grid_view',
        topics: [
            {
                id: 'h_08_concept',
                title: 'O Que é Campo Harmônico?',
                description: 'Definição e utilidade prática.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-gradient-to-br from-[#0081FF]/20 to-transparent p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                      <div class="absolute top-0 right-0 w-32 h-32 bg-[#0081FF] blur-[80px] opacity-20"></div>
                      <h3 class="text-3xl font-black text-white mb-6 tracking-tighter">O Mapa da Música</h3>
                      <p class="text-gray-300 leading-relaxed text-lg">
                        O Campo Harmônico é o conjunto de acordes formados exclusivamente com as notas de uma determinada escala. É como uma "família" de acordes que conversam bem entre si.
                      </p>
                    </div>
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <h4 class="text-[#0081FF] font-bold mb-2">Para que serve?</h4>
                        <ul class="text-sm text-gray-400 space-y-2">
                            <li>• Tirar músicas de ouvido (sabendo a tonalidade, você limita as opções).</li>
                            <li>• Compor músicas coerentes.</li>
                            <li>• Re-harmonizar e criar arranjos.</li>
                        </ul>
                    </div>
                  </div>
                \`
            },
            {
                id: 'h_08_triads',
                title: 'Campo Harmônico em Tríades',
                description: 'Acordes de 3 sons na escala maior.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <p class="text-gray-300 mb-4">Em tonalidade maior, a estrutura de tríades segue sempre este padrão:</p>
                        <div class="grid grid-cols-7 gap-2 text-center">
                            <div class="bg-black/40 p-2 rounded text-white text-xs">I<br>Maior</div>
                            <div class="bg-black/40 p-2 rounded text-white text-xs">ii<br>Menor</div>
                            <div class="bg-black/40 p-2 rounded text-white text-xs">iii<br>Menor</div>
                            <div class="bg-black/40 p-2 rounded text-white text-xs">IV<br>Maior</div>
                            <div class="bg-black/40 p-2 rounded text-white text-xs">V<br>Maior</div>
                            <div class="bg-black/40 p-2 rounded text-white text-xs">vi<br>Menor</div>
                            <div class="bg-black/40 p-2 rounded text-white text-xs">vii°<br>Dim</div>
                        </div>
                    </div>
                     <div class="bg-[#0081FF]/10 p-6 rounded-3xl border border-[#0081FF]/20">
                        <h4 class="text-white font-bold mb-2">Exemplo em Dó Maior (C):</h4>
                        <p class="text-lg text-[#0081FF] font-black">C - Dm - Em - F - G - Am - B°</p>
                    </div>
                  </div>
                \`
            },
            {
                id: 'h_08_tetrads',
                title: 'Campo Harmônico em Tétrades',
                description: 'Adicionando a sétima para enriquecer a harmonia.',
                content: \`
                  <div class="space-y-6">
                     <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <p class="text-gray-300 mb-4">Adicionando a 7ª (sétima) a cada acorde, a sofisticação aumenta. O padrão é:</p>
                        <ul class="space-y-2 text-sm text-gray-400">
                            <li><strong>I7M e IV7M:</strong> Sétima Maior (Maj7) - Som estável e doce.</li>
                            <li><strong>ii7, iii7, vi7:</strong> Sétima Menor (m7) - Som suave.</li>
                            <li><strong>V7:</strong> Sétima Menor (Dominante) - Tensão máxima!</li>
                            <li><strong>vii°(m7b5):</strong> Meio-Diminuto - Tensão e instabilidade.</li>
                        </ul>
                    </div>
                     <div class="bg-[#6F4CE7]/10 p-6 rounded-3xl border border-[#6F4CE7]/20">
                        <h4 class="text-white font-bold mb-2">Exemplo em Dó Maior (Tétrades):</h4>
                        <p class="text-lg text-[#6F4CE7] font-black">C7M - Dm7 - Em7 - F7M - G7 - Am7 - Bm7(b5)</p>
                    </div>
                  </div>
                \`
            }
        ]
    },
    {
        id: 'm_harmony_09',
        courseId: 'teoria',
        number: '09',
        title: 'FUNÇÕES HARMÔNICAS',
        subtitle: 'Sensação e Movimento',
        description: 'Entenda o papel de cada acorde: Tônica (Repouso), Subdominante (Afastamento) e Dominante (Tensão).',
        icon: 'psychology_alt',
        topics: [
            {
                id: 'h_09_functions',
                title: 'As 3 Grandes Funções',
                description: 'Tônica, Subdominante e Dominante.',
                content: \`
                  <div class="space-y-6">
                    <div class="grid gap-4">
                        <div class="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
                            <h4 class="text-blue-400 font-bold uppercase tracking-widest text-xs mb-1">TÔNICA (Repouso)</h4>
                            <p class="text-white text-sm">É a "casa". Sensação de conclusão e estabilidade.</p>
                            <p class="text-xs text-gray-500 mt-2">Acordes: I, vi, iii</p>
                        </div>
                        <div class="bg-yellow-500/10 p-5 rounded-2xl border border-yellow-500/20">
                            <h4 class="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-1">SUBDOMINANTE (Movimento)</h4>
                            <p class="text-white text-sm">Sensação de afastamento, preparação ou meia-tensão.</p>
                            <p class="text-xs text-gray-500 mt-2">Acordes: IV, ii</p>
                        </div>
                         <div class="bg-red-500/10 p-5 rounded-2xl border border-red-500/20">
                            <h4 class="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">DOMINANTE (Tensão)</h4>
                            <p class="text-white text-sm">Pede resolução urgente na Tônica. Cria a expectativa.</p>
                            <p class="text-xs text-gray-500 mt-2">Acordes: V, vii°</p>
                        </div>
                    </div>
                  </div>
                \`
            },
            {
                id: 'h_09_substitutes',
                title: 'Acordes Substitutos',
                description: 'Quem pode substituir quem?',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <p class="text-gray-300">Acordes com a mesma função podem se substituir para variar a harmonia:</p>
                        <ul class="mt-4 space-y-2 text-sm text-gray-400">
                            <li>• <strong>C (I)</strong> pode ser trocado por <strong>Am (vi)</strong> ou <strong>Em (iii)</strong>.</li>
                            <li>• <strong>F (IV)</strong> pode ser trocado por <strong>Dm (ii)</strong>.</li>
                            <li>• <strong>G (V)</strong> pode ser trocado por <strong>B° (vii°)</strong>.</li>
                        </ul>
                    </div>
                  </div>
                \`
            }
        ]
    },
    {
        id: 'm_harmony_10',
        courseId: 'teoria',
        number: '10',
        title: 'CADÊNCIAS E PREPARAÇÕES',
        subtitle: 'Conduzindo a Música',
        description: 'Domine as progressões mais usadas: II-V-I, Cadências Conclusivas e o uso do Trítono.',
        icon: 'route',
        topics: [
             {
                id: 'h_10_cadences',
                title: 'Tipos de Cadência',
                description: 'Perfeita, Plagal, Imperfeita e Deceptiva.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5 space-y-3">
                        <div class="p-3 bg-black/40 rounded-xl">
                            <strong class="text-white block">Perfeita (V - I)</strong>
                            <p class="text-xs text-gray-500">Resolução total. Ponto final da música.</p>
                        </div>
                        <div class="p-3 bg-black/40 rounded-xl">
                            <strong class="text-white block">Plagal (IV - I)</strong>
                            <p class="text-xs text-gray-500">O "Amém" da igreja. Suave e sem tensão forte.</p>
                        </div>
                        <div class="p-3 bg-black/40 rounded-xl">
                            <strong class="text-white block">Deceptiva (V - vi)</strong>
                            <p class="text-xs text-gray-500">Engano! Você espera o I, mas cai no vi (menor). Surpreendente.</p>
                        </div>
                    </div>
                  </div>
                \`
            },
            {
                id: 'h_10_tritone',
                title: 'O Poder do Trítono',
                description: 'A dissonância que move a música.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <h3 class="text-2xl font-bold text-white mb-4">O Motor da Tonalidade</h3>
                        <p class="text-gray-300 mb-4">
                            O Trítono é um intervalo de 3 tons (daí o nome) que gera uma tensão muito forte. Ele está presente no acorde <strong>Dominante (V7)</strong>.
                        </p>
                        <p class="text-sm text-gray-400">
                            No tom de Dó Maior (C), o dominante é G7 (Sol, Si, Ré, Fá). O trítono ocorre entre <strong>Si</strong> e <strong>Fá</strong>.
                        </p>
                        <p class="text-sm text-gray-400 mt-2">
                            Essa tensão "implora" para resolver nas notas Dó e Mi (do acorde C). Por isso o V7 puxa o I.
                        </p>
                    </div>
                  </div>
                \`
            },
            {
                id: 'h_10_251',
                title: 'O Clássico II - V - I',
                description: 'A progressão mais famosa do Jazz e MPB.',
                content: \`
                   <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <h3 class="text-2xl font-bold text-white mb-4">Two - Five - One</h3>
                        <p class="text-gray-300 mb-4">
                            É a sequência de acordes mais forte e comum no Jazz, Bossa Nova e Pop.
                        </p>
                        <div class="flex items-center gap-2 justify-center my-6">
                            <div class="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                                <span class="block text-gray-500 text-xs">Subdominante</span>
                                <strong class="text-white text-xl">ii7</strong>
                            </div>
                            <span class="material-symbols-rounded text-gray-500">arrow_forward</span>
                             <div class="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                                <span class="block text-gray-500 text-xs">Dominante</span>
                                <strong class="text-white text-xl">V7</strong>
                            </div>
                            <span class="material-symbols-rounded text-gray-500">arrow_forward</span>
                             <div class="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                                <span class="block text-gray-500 text-xs">Tônica</span>
                                <strong class="text-white text-xl">I7M</strong>
                            </div>
                        </div>
                         <p class="text-sm text-gray-400 text-center">
                            Ex em C: <strong>Dm7 ➔ G7 ➔ C7M</strong>
                        </p>
                    </div>
                  </div>
                \`
            }
        ]
    },
    {
        id: 'm_harmony_11',
        courseId: 'teoria',
        number: '11',
        title: 'PREPARAÇÕES E DOMINANTES',
        subtitle: 'Expandindo a Harmonia',
        description: 'Domine Dominantes Secundários, SubV7 e Acordes Sus4.',
        icon: 'extension',
        topics: [
            {
                id: 'h_11_sec_dom',
                title: 'Dominantes Secundários',
                description: 'Preparando acordes além da Tônica.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <h3 class="text-2xl font-bold text-white mb-4">V7/X</h3>
                        <p class="text-gray-300 mb-4">
                            Todo acorde do campo harmônico (exceto o vii°) pode ter seu próprio dominante "emprestado" para prepará-lo.
                        </p>
                        <p class="text-sm text-gray-400">
                            Ex: Em C, queremos ir para Dm (ii). O dominante de D é A7. Então usamos: <strong>C ➔ A7 ➔ Dm</strong>.
                        </p>
                    </div>
                  </div>
                \`
            },
            {
                id: 'h_11_subv7',
                title: 'SubV7 (Substituto Tritonal)',
                description: 'A substituição cromática elegante.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <p class="text-gray-300 mb-4">
                            O Dominante (V7) pode ser substituído por um acorde meio tom acima da resolução.
                        </p>
                        <div class="bg-black/40 p-4 rounded-xl border border-white/10 text-center">
                            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Normal</p>
                            <strong class="text-white text-lg block mb-3">Dm7 - G7 - C7M</strong>
                            
                            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Com SubV7</p>
                            <strong class="text-[#0081FF] text-lg block">Dm7 - Db7 - C7M</strong>
                        </div>
                        <p class="text-xs text-gray-400 mt-4 text-center">
                            Isso cria uma linha de baixo cromática descendente suave.
                        </p>
                    </div>
                  </div>
                \`
            }
        ]
    },
    {
        id: 'm_harmony_12',
        courseId: 'teoria',
        number: '12',
        title: 'HARMONIA AVANÇADA',
        subtitle: 'Cores e Modos',
        description: 'Empréstimo Modal (AEM) e o Universo Menor.',
        icon: 'palette',
        topics: [
            {
                id: 'h_12_aem',
                title: 'Empréstimo Modal (AEM)',
                description: 'Pegando acordes emprestados de outros modos.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <h3 class="text-2xl font-bold text-white mb-4">Misturando Cores</h3>
                        <p class="text-gray-300 mb-4">
                            Usar acordes do modo Menor dentro de uma música em Maior (ou vice-versa).
                        </p>
                        <p class="text-sm text-gray-400">
                            O mais famoso é o <strong>iv menor</strong> (Fm em tom de C). Ele adiciona uma "tristeza" ou "nostalgia" instantânea.
                        </p>
                    </div>
                  </div>
                \`
            },
            {
                id: 'h_12_minor_universe',
                title: 'O Universo Menor',
                description: 'Natural, Harmônica e Melódica.',
                content: \`
                  <div class="space-y-6">
                    <div class="bg-[#1A202C] p-6 rounded-3xl border border-white/5">
                        <p class="text-gray-300 mb-4">
                            Diferente do Maior, o tom Menor possui 3 escalas principais para gerar acordes:
                        </p>
                        <ul class="space-y-3 text-sm text-gray-400">
                            <li class="flex gap-2"><span class="text-[#0081FF] font-bold">1. Menor Natural:</span> A escala relativa pura. (Vm7 - Dominante menor fraco).</li>
                            <li class="flex gap-2"><span class="text-[#6F4CE7] font-bold">2. Menor Harmônica:</span> Altera o 7º grau para criar o V7 (Dominante forte).</li>
                            <li class="flex gap-2"><span class="text-[#FF00BC] font-bold">3. Menor Melódica:</span> Altera 6º e 7º graus para suavizar a melodia.</li>
                        </ul>
                    </div>
                  </div>
                \`
            }
        ]
    }
```
