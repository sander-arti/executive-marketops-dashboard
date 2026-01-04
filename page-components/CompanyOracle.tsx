'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FinancialMetric } from '../types';
import { Button, cn, Badge } from '../components/ui';
import { Bot, Sparkles, Send, Paperclip, BarChart3, FileText, Database, ArrowUp, User, StopCircle } from 'lucide-react';

interface CompanyOracleProps {
  financials: FinancialMetric[];
}

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    sources?: string[];
}

export const CompanyOracle: React.FC<CompanyOracleProps> = ({ financials }) => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Only start with empty or welcome state logic
    const [messages, setMessages] = useState<Message[]>([]);

    const suggestedPrompts = [
        { title: "Salgstrend", text: "Hvordan påvirker de danske refusjonsendringene omsetningen til Proponent?" },
        { title: "Konkurranse", text: "Hva er sammenhengen mellom Bentrio sin markedsandel og konkurrentens mangel?" },
        { title: "Strategi", text: "Lag en SWOT-analyse for Smertebehandling basert på siste måneds data." },
        { title: "Risiko", text: "Oppsummer risikoen i forsyningskjeden opp mot budsjettmålene." }
    ];

    const handleSend = (text: string = input) => {
        if (!text.trim()) return;

        const newMsg: Message = { id: Date.now().toString(), role: 'user', text: text };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            
            let responseText = "Jeg analyserer dataene...";
            let sources = ['Markedsinnsikt Okt', 'Finansielle nøkkeltall'];

            if (text.toLowerCase().includes('proponent') || text.toLowerCase().includes('danske')) {
                const propData = financials.find(f => f.productId === 'Proponent');
                responseText = `Basert på **Oktober-rapporten** ser vi at de nye refusjonsvilkårene i Danmark er en hoveddriver. \n\nNår jeg kryssjekker dette med finanstallene du har lagt inn, ser vi at Proponent nådde **${propData?.revenue} MNOK** i omsetning, som er over målet på ${propData?.targetRevenue} MNOK. \n\nDette bekrefter at den strategiske muligheten nå konverteres til faktisk verdi. Jeg anbefaler å øke markedsføringsbudsjettet i Danmark for Q4 for å forsterke denne trenden.`;
                sources = ['Proponent Okt Rapport', 'Finansdata 2023-10'];
            } else if (text.toLowerCase().includes('bentrio')) {
                const benData = financials.find(f => f.productId === 'Bentrio');
                responseText = `Mangelsituasjonen hos konkurrenten i Norge er kritisk. Dataene viser at Bentrio har en markedsandel på **${benData?.marketShare}%**, men med konkurrenten ute, indikerer modellene mine at vi kan nå 20% innen utgangen av året hvis vi agerer raskt.`;
                sources = ['Bentrio Okt Rapport', 'Markedsrapport', 'Finansdata 2023-10'];
            } else {
                responseText = "Jeg ser en generell positiv trend i porteføljen. Kombinasjonen av stabil drift i Smertebehandling og vekstmuligheter for Proponent og Bentrio gir et solid fundament for Q4. Er det spesifikke tall eller risikoer du vil jeg skal utdype?";
            }

            setMessages(prev => [...prev, { 
                id: (Date.now() + 1).toString(), 
                role: 'ai', 
                text: responseText,
                sources: sources
            }]);
        }, 1500);
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] animate-in fade-in bg-white relative">
            
            {/* 1. Header (Minimalist) */}
            <header className="absolute top-0 left-0 right-0 z-10 px-8 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-transparent">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                         <Bot size={18} />
                    </div>
                    <span className="font-bold text-slate-900">Bedriftsorakel</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Beta 2.0</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5"><Database size={12}/> Finans</span>
                    <span className="flex items-center gap-1.5"><FileText size={12}/> 42 Rapporter</span>
                </div>
            </header>

            {/* 2. Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-20 pb-40">
                
                {/* Empty State / Welcome Hero */}
                {!hasMessages && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-200">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4 tracking-tight">
                            Hei, Jonas. Hva analyserer vi i dag?
                        </h1>
                        <p className="text-slate-500 text-center max-w-xl mb-12 text-lg">
                            Jeg har lest alle rapportene for oktober og har tilgang til oppdaterte finanstall.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                            {suggestedPrompts.map((p, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSend(p.text)}
                                    className="text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group bg-white shadow-sm hover:shadow-md"
                                >
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">{p.title}</span>
                                    <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">{p.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message Stream */}
                {hasMessages && (
                    <div className="max-w-3xl mx-auto px-4 space-y-8">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1">
                                        <Bot size={16} className="text-indigo-600" />
                                    </div>
                                )}

                                <div className={cn("max-w-[85%]", msg.role === 'user' ? "text-right" : "text-left")}>
                                    
                                    <div className={cn(
                                        "inline-block p-4 text-sm leading-relaxed shadow-sm",
                                        msg.role === 'user' 
                                            ? "bg-slate-900 text-white rounded-2xl rounded-tr-sm" 
                                            : "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm"
                                    )}>
                                        <div className="markdown" dangerouslySetInnerHTML={{ 
                                            __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                                        }} />
                                    </div>

                                    {/* AI Sources styled as pills */}
                                    {msg.role === 'ai' && msg.sources && (
                                        <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in delay-150">
                                            {msg.sources.map((src, i) => (
                                                <button key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                                    {src.includes('Finans') ? <BarChart3 size={12} /> : <FileText size={12} />}
                                                    {src}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                             <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1">
                                    <Bot size={16} className="text-indigo-600" />
                                </div>
                                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                             </div>
                        )}
                        <div ref={scrollRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* 3. Floating Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/80 to-transparent z-20">
                <div className="max-w-3xl mx-auto relative group">
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl transition-opacity duration-500",
                        isTyping ? "opacity-50" : "opacity-0 group-hover:opacity-30"
                    )}></div>
                    
                    <div className="relative bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-full flex items-center p-2 pl-6 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                        <input 
                            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-3"
                            placeholder="Still et oppfølgingsspørsmål..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            autoFocus
                        />
                        <div className="flex items-center gap-2 pr-2">
                             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Legg ved fil">
                                <Paperclip size={18} />
                            </button>
                            <button 
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200",
                                    input.trim() 
                                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md transform hover:scale-105" 
                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                )}
                            >
                                <ArrowUp size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                    <div className="text-center mt-3">
                         <p className="text-[10px] text-slate-400 font-medium">
                            AI kan gjøre feil. Sjekk viktige tall mot kilderapportene.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CompanyOracle;
