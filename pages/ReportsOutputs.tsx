
import React from 'react';
import { REPORTS, OUTPUTS } from '../mock/data';
import { Card, Button, Badge } from '../components/ui';
import { FileText, Download, Calendar } from 'lucide-react';

export const ReportsList: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-900">Rapportbibliotek</h2>
        <div className="grid gap-4">
            {REPORTS.map(report => (
                <Card key={report.id} className="p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{report.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Calendar size={14}/> {report.date}</span>
                                <Badge variant="secondary">{report.track}</Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline">Vis rapport</Button>
                </Card>
            ))}
        </div>
    </div>
  );
};

export const OutputsList: React.FC = () => {
    return (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-slate-900">Genererte leveranser</h2>
          <div className="grid gap-4">
              {OUTPUTS.map(output => (
                  <Card key={output.id} className="p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <Download size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900">{output.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                  <span className="flex items-center gap-1"><Calendar size={14}/> {output.date}</span>
                                  <Badge variant="outline">{output.type}</Badge>
                              </div>
                          </div>
                      </div>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Last ned .md</Button>
                  </Card>
              ))}
          </div>
      </div>
    );
  };
