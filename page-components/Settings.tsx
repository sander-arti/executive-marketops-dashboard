'use client';

import React, { useState } from 'react';
import { FinancialMetric } from '../types';
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, cn } from '../components/ui';
import { Save, Database, Calendar, Bell, Shield, Eye, Calculator, Check, Wifi, AlertCircle, Mail, Slack, Smartphone } from 'lucide-react';

interface SettingsProps {
    financialData: FinancialMetric[];
    onUpdateFinancials: (data: FinancialMetric[]) => void;
}

interface ExtendedMetric extends FinancialMetric {
    totalMarket: number;
}

// --- Simple Toggle Switch Component for the Prototype ---
const Toggle: React.FC<{ label: string; description?: string; checked: boolean; onChange: () => void }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
        <div>
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button 
            onClick={onChange}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                checked ? "bg-indigo-600" : "bg-slate-200"
            )}
        >
            <span className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                checked ? "translate-x-6" : "translate-x-1"
            )} />
        </button>
    </div>
);

export const Settings: React.FC<SettingsProps> = ({ financialData, onUpdateFinancials }) => {
    // Financial Data State
    const [localData, setLocalData] = useState<ExtendedMetric[]>(() => 
        financialData.map(item => ({
            ...item,
            totalMarket: item.revenue && item.marketShare 
                ? parseFloat((item.revenue / (item.marketShare / 100)).toFixed(1)) 
                : 0
        }))
    );
    
    // Mock States for the Prototype
    const [isSaved, setIsSaved] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('2023-10');
    
    const [notifications, setNotifications] = useState({
        email: true,
        slack: false,
        push: true,
        weeklyDigest: true
    });

    const [competitors, setCompetitors] = useState([
        { id: 1, name: "Nordic Pharma Group", status: 'active', country: 'SE' },
        { id: 2, name: "EuroGenerics", status: 'active', country: 'DK' },
        { id: 3, name: "BioLife Solutions", status: 'paused', country: 'NO' },
    ]);

    const handleInputChange = (productId: string, field: 'revenue' | 'targetRevenue' | 'totalMarket', value: string) => {
        const numValue = parseFloat(value) || 0;
        setLocalData(prev => prev.map(item => {
            if (item.productId !== productId) return item;
            const updatedItem = { ...item, [field]: numValue };
            
            // Auto-calculate Market Share
            if (field === 'revenue' || field === 'totalMarket') {
                const rev = field === 'revenue' ? numValue : item.revenue;
                const tot = field === 'totalMarket' ? numValue : item.totalMarket;
                updatedItem.marketShare = (rev > 0 && tot > 0) 
                    ? parseFloat(((rev / tot) * 100).toFixed(1)) 
                    : 0;
            }
            return updatedItem;
        }));
        setIsSaved(false);
    };

    const handleSave = () => {
        onUpdateFinancials(localData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-12">
            
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Innstillinger & Datakilder</h2>
                <p className="text-slate-500">Administrer bedriftsdata, kilder og varslinger for arbeidsområdet.</p>
            </div>

            {/* Financial Data Input Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Finansiell Rapportering</h3>
                            <p className="text-xs text-slate-500">Tallene her brukes av AI-motoren for å beregne markedsandeler og ytelse.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Periode:</span>
                        <select 
                            value={selectedPeriod} 
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="text-sm font-bold bg-transparent focus:outline-none text-slate-900 cursor-pointer"
                        >
                            <option value="2023-10">Oktober 2023</option>
                            <option value="2023-09">September 2023</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Calculator size={18} className="text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-900 leading-relaxed">
                            <strong>Autokalkulering:</strong> Du legger inn <em>Din Omsetning</em> og <em>Totalmarked</em>. Systemet regner automatisk ut din markedsandel i sanntid.
                        </p>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="w-[180px] font-bold text-slate-900">Produkt</TableHead>
                                <TableHead className="font-bold text-slate-900 w-[160px]">Din Omsetning <span className="text-slate-400 font-normal ml-1">(MNOK)</span></TableHead>
                                <TableHead className="font-bold text-slate-900 w-[160px]">Totalmarked <span className="text-slate-400 font-normal ml-1">(MNOK)</span></TableHead>
                                <TableHead className="font-bold text-slate-900">Markedsandel <span className="text-indigo-500 font-normal ml-1">(Auto)</span></TableHead>
                                <TableHead className="text-right font-bold text-slate-900">Budsjettmål</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localData.map((item) => (
                                <TableRow key={item.productId} className="hover:bg-slate-50/50 border-b border-slate-50 last:border-0">
                                    <TableCell className="font-bold text-slate-700">{item.productId}</TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={item.revenue}
                                                onChange={(e) => handleInputChange(item.productId, 'revenue', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono font-medium shadow-sm"
                                                step="0.1"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={item.totalMarket}
                                                onChange={(e) => handleInputChange(item.productId, 'totalMarket', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono font-medium shadow-sm"
                                                step="0.1"
                                                placeholder="0"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 py-2 px-3 bg-slate-100/50 rounded-md border border-transparent">
                                            <span className={`font-mono font-bold text-lg ${item.marketShare > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                {item.marketShare}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <input 
                                            type="number" 
                                            value={item.targetRevenue}
                                            onChange={(e) => handleInputChange(item.productId, 'targetRevenue', e.target.value)}
                                            className="w-full max-w-[100px] px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-600 focus:ring-2 focus:ring-slate-900 outline-none text-right font-mono text-sm ml-auto"
                                            step="0.1"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                     {isSaved && (
                        <span className="text-emerald-600 text-sm font-medium flex items-center animate-in fade-in slide-in-from-right-2">
                            <Check size={16} className="mr-1.5" /> Endringer lagret
                        </span>
                     )}
                     <Button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-sm">
                        <Save size={16} /> Lagre tall
                     </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Notification Preferences (Mocked but functional look) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                     <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white">
                        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Varslingsinnstillinger</h3>
                            <p className="text-xs text-slate-500">Styr hvordan og når du mottar strategiske varsler.</p>
                        </div>
                     </div>
                     <div className="p-6 flex-1">
                        <div className="space-y-1">
                            <Toggle 
                                label="E-postvarsling for 'Kritiske Risikoer'" 
                                description="Motta umiddelbar e-post når en risiko overstiger nivå 8."
                                checked={notifications.email} 
                                onChange={() => setNotifications(prev => ({...prev, email: !prev.email}))} 
                            />
                            <Toggle 
                                label="Slack Integrasjon" 
                                description="Send oppdateringer til #strategy-ops kanalen."
                                checked={notifications.slack} 
                                onChange={() => setNotifications(prev => ({...prev, slack: !prev.slack}))} 
                            />
                            <Toggle 
                                label="Ukentlig Briefing" 
                                description="Sammendrag hver mandag kl 08:00."
                                checked={notifications.weeklyDigest} 
                                onChange={() => setNotifications(prev => ({...prev, weeklyDigest: !prev.weeklyDigest}))} 
                            />
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100 flex gap-4">
                            <Badge variant="outline" className="text-slate-500 font-normal gap-1 bg-slate-50">
                                <Mail size={12}/> jonas.doe@pharmanordic.com
                            </Badge>
                             <Badge variant="outline" className="text-slate-500 font-normal gap-1 bg-slate-50">
                                <Slack size={12}/> Ikke tilkoblet
                            </Badge>
                        </div>
                     </div>
                </div>

                {/* 2. Competitor Watchlist & API Status */}
                <div className="flex flex-col gap-6">
                    
                    {/* Competitors */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                         <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Overvåkning</h3>
                                    <p className="text-xs text-slate-500">Aktive søkeagenter.</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline"><Check size={14} className="mr-1"/> Legg til</Button>
                         </div>
                         <div className="p-0">
                             <table className="w-full text-sm text-left">
                                 <tbody className="divide-y divide-slate-50">
                                     {competitors.map(comp => (
                                         <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                                             <td className="p-4 font-semibold text-slate-700">{comp.name}</td>
                                             <td className="p-4">
                                                <Badge variant="outline" className="bg-slate-50">{comp.country}</Badge>
                                             </td>
                                             <td className="p-4 text-right">
                                                 <div className="flex items-center justify-end gap-2">
                                                     <span className={cn("w-2 h-2 rounded-full", comp.status === 'active' ? "bg-emerald-500" : "bg-slate-300")}></span>
                                                     <span className="text-xs font-medium text-slate-500">{comp.status === 'active' ? 'Aktiv' : 'Pauset'}</span>
                                                 </div>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>

                    {/* API Status */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                            <Shield size={16} className="text-slate-400" />
                            <h3 className="font-bold text-slate-700 text-sm">Datakilder (Systemstatus)</h3>
                         </div>
                         <div className="p-4 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 p-2 rounded border border-emerald-100 bg-emerald-50/50">
                                <Wifi size={14} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-800">GlobalData API</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded border border-emerald-100 bg-emerald-50/50">
                                <Wifi size={14} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-800">PubMed Monitor</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded border border-emerald-100 bg-emerald-50/50">
                                <Wifi size={14} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-800">ClinicalTrials.gov</span>
                            </div>
                             <div className="flex items-center gap-2 p-2 rounded border border-amber-100 bg-amber-50/50">
                                <AlertCircle size={14} className="text-amber-600" />
                                <span className="text-xs font-bold text-amber-800">SSB (Forsinkelse)</span>
                            </div>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;
