
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, AlertCircle, CheckCircle2, Info, Music, ChevronRight, Binary } from 'lucide-react';

interface AnalysisResult {
  tonica: string;
  tipo_triada: string;
  tipo_tetrade: string | null;
  notas_base: string[];
  tensoes: string[];
  baixo: string | null;
  enarmonias_possiveis: string[];
  observacoes: string;
}

const HarmonicAnalyzer: React.FC = () => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const systemInstruction = `Você é um motor harmônico profissional para um APP de Dicionário de Acordes baseado no sistema CAGED.

OBJETIVO:
Adicionar e reconhecer qualidades de acordes de forma correta, musical e didática, SEM gerar acordes inválidos.

REGRAS GERAIS (OBRIGATÓRIAS):
1. Trabalhe sempre a partir da TÔNICA do acorde.
2. Todos os acordes devem ser construídos por INTERVALOS relativos à tônica.
3. Nunca invente extensões, baixos ou acidentes não solicitados.
4. Se a combinação for inválida, retorne observação de erro.
5. Slash chords só podem ser gerados se o baixo NÃO for a tônica.
6. Cm7(b5) e C°7 são acordes DIFERENTES.
7. Priorize a nomenclatura mais usada na música popular brasileira e internacional.

QUALIDADES SUPORTADAS PARA ANÁLISE:
- TRÍADES: Maior, Menor, Diminuta, Aumentada.
- SÉTIMAS: 7M, 7, m7, m7(b5), Dim7.
- SUSPENSOS: Sus2, Sus4.
- SEXTAS: 6, m6.
- NONAS: 9, maj9, m9.
- ADD: add9, add4.
- POWER CHORDS: 5.

FORMATO DE SAÍDA (JSON OBRIGATÓRIO):
{
  "tonica": "",
  "tipo_triada": "",
  "tipo_tetrade": null,
  "notas_base": [],
  "tensoes": [],
  "baixo": null,
  "enarmonias_possiveis": [],
  "observacoes": ""
}`;

  const analyzeChord = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise a cifra musical abaixo aplicando as REGRAS OBRIGATÓRIAS.
 CIFRA A ANALISAR: ${input}`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json"
        },
      });

      const result = JSON.parse(response.text || "{}");
      setAnalysis(result);
    } catch (err) {
      setError("Erro na análise. Certifique-se de usar uma cifra válida.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#0e1017] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Music size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Analisador <span className="text-blue-500">Oficial</span></h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Padrão Internacional de Cifragem</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyzeChord()}
                  placeholder="Digite a cifra (ex: Bb7#9b13)"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all uppercase"
                />
              </div>
              <button 
                onClick={analyzeChord}
                disabled={isLoading || !input.trim()}
                className={`px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isLoading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'
                }`}
              >
                {isLoading ? 'Analisando...' : 'Analisar'} <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Consultando Motor Teórico...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-center gap-4 text-red-400 animate-in zoom-in-95">
          <AlertCircle size={24} />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-top-4 duration-500">
          
          {/* Ficha Técnica */}
          <div className="lg:col-span-8 bg-[#0e1017] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Análise Validada</span>
              </div>
              <Binary size={20} className="text-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Tônica / Raiz</label>
                  <div className="text-5xl font-black text-white">{analysis.tonica || '---'}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Estrutura de Tríade</label>
                  <div className="text-2xl font-black text-blue-500 uppercase">{analysis.tipo_triada}</div>
                </div>
                {analysis.baixo && (
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Inversão (Baixo em)</label>
                    <div className="text-3xl font-black text-orange-500 uppercase">{analysis.baixo}</div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Tipo de Tétrade</label>
                  <div className="text-2xl font-black text-slate-300 uppercase">{analysis.tipo_tetrade || 'Não se aplica'}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Tensões Adicionais</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.tensoes.length > 0 ? analysis.tensoes.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-black">{t}</span>
                    )) : <span className="text-slate-700 text-xs font-bold italic">Nenhuma tensão explícita</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-4">Notas da Formação (T, 3, 5, 7...)</label>
              <div className="flex flex-wrap gap-3">
                {analysis.notas_base.map((n, i) => (
                  <div key={i} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-white font-black text-lg">{n}</span>
                    <span className="text-[8px] text-slate-600 font-bold uppercase">{i === 0 ? 'Root' : `Int ${i+1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Observações e Erros */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1a1c25] p-8 rounded-[3rem] border border-blue-500/10 shadow-xl">
               <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info size={14}/> Observações Técnicas
               </h4>
               <p className="text-sm text-slate-400 leading-relaxed font-medium">
                 {analysis.observacoes || "Análise teórica completa sem inconsistências detectadas."}
               </p>
            </div>

            {analysis.enarmonias_possiveis.length > 0 && (
              <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Enarmonias</h4>
                <div className="flex gap-2">
                  {analysis.enarmonias_possiveis.map((e, i) => (
                    <span key={i} className="text-xs font-black text-slate-500">{e}{i < analysis.enarmonias_possiveis.length - 1 ? ' =' : ''}</span>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => { setAnalysis(null); setInput(''); }}
              className="w-full py-5 rounded-[2rem] border border-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Nova Consulta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HarmonicAnalyzer;
