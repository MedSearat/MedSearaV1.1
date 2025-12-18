
import React, { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';

const Calculators: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState('imc');

  // IMC State
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [imcResult, setImcResult] = useState<{val: number, cat: string} | null>(null);

  // BSA State
  const [bsaWeight, setBsaWeight] = useState('');
  const [bsaHeight, setBsaHeight] = useState('');
  const [bsaResult, setBsaResult] = useState<number | null>(null);

  // GFR State (MDRD Simplified)
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [gfrResult, setGfrResult] = useState<number | null>(null);

  // Parkland State
  const [parkWeight, setParkWeight] = useState('');
  const [burnPerc, setBurnPerc] = useState('');
  const [parkResult, setParkResult] = useState<number | null>(null);

  // Drip State
  const [volume, setVolume] = useState('');
  const [time, setTime] = useState('');
  const [factor, setFactor] = useState('20');
  const [dripResult, setDripResult] = useState<number | null>(null);

  // TAM State
  const [pas, setPas] = useState('');
  const [pad, setPad] = useState('');
  const [tamResult, setTamResult] = useState<number | null>(null);

  useEffect(() => {
    if (weight && height) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      const imc = w / (h * h);
      let cat = '';
      if (imc < 18.5) cat = 'Abaixo do peso';
      else if (imc < 25) cat = 'Peso normal';
      else if (imc < 30) cat = 'Sobrepeso';
      else cat = 'Obesidade';
      setImcResult({ val: parseFloat(imc.toFixed(2)), cat });
    } else setImcResult(null);
  }, [weight, height]);

  useEffect(() => {
    if (bsaWeight && bsaHeight) {
      const bsa = Math.sqrt((parseFloat(bsaHeight) * 100 * parseFloat(bsaWeight)) / 3600);
      setBsaResult(parseFloat(bsa.toFixed(2)));
    } else setBsaResult(null);
  }, [bsaWeight, bsaHeight]);

  useEffect(() => {
    if (creatinine && age) {
        // MDRD formula simplified
        const cr = parseFloat(creatinine);
        const a = parseFloat(age);
        let gfr = 186 * Math.pow(cr, -1.154) * Math.pow(a, -0.203);
        if (gender === 'female') gfr *= 0.742;
        setGfrResult(parseFloat(gfr.toFixed(2)));
    } else setGfrResult(null);
  }, [creatinine, age, gender]);

  useEffect(() => {
    if (parkWeight && burnPerc) {
      const res = 4 * parseFloat(parkWeight) * parseFloat(burnPerc);
      setParkResult(res);
    } else setParkResult(null);
  }, [parkWeight, burnPerc]);

  useEffect(() => {
    if (volume && time) {
      const res = (parseFloat(volume) * parseFloat(factor)) / parseFloat(time);
      setDripResult(Math.round(res));
    } else setDripResult(null);
  }, [volume, time, factor]);

  useEffect(() => {
    if (pas && pad) {
      const res = (parseFloat(pas) + 2 * parseFloat(pad)) / 3;
      setTamResult(parseFloat(res.toFixed(1)));
    } else setTamResult(null);
  }, [pas, pad]);

  const calcs = [
    { id: 'imc', name: 'IMC', desc: 'Índice de Massa Corporal' },
    { id: 'sc', name: 'Superfície Corporal', desc: 'Fórmula de Mosteller' },
    { id: 'tfg', name: 'Taxa de Filtração Glomerular', desc: 'MDRD / CKD-EPI' },
    { id: 'parkland', name: 'Fórmula de Parkland', desc: 'Hidratação em queimados' },
    { id: 'gotejo', name: 'Cálculo de Gotejo', desc: 'Gotas por minuto' },
    { id: 'tam', name: 'Tensão Arterial Média', desc: 'Cálculo de TAM' },
  ];

  return (
    <div className="space-y-8 max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="text-blue-600" /> Calculadoras Médicas
        </h1>
        <p className="text-slate-500">Ferramentas de precisão para auxílio clínico diário.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {calcs.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCalc(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCalc === c.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        {activeCalc === 'imc' && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Cálculo de IMC</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Peso (kg)</label>
                  <input 
                    type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 75" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Altura (m)</label>
                  <input 
                    type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ex: 1.75" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
                {imcResult ? (
                  <>
                    <p className="text-slate-500 text-sm mb-2">Resultado</p>
                    <p className="text-5xl font-black text-blue-600 mb-2">{imcResult.val}</p>
                    <p className="text-xl font-bold text-slate-800">{imcResult.cat}</p>
                  </>
                ) : (
                  <p className="text-slate-400">Insira os dados para ver o resultado.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeCalc === 'sc' && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Superfície Corporal (SC)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Peso (kg)</label>
                  <input type="number" value={bsaWeight} onChange={(e) => setBsaWeight(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Altura (m)</label>
                  <input type="number" value={bsaHeight} onChange={(e) => setBsaHeight(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
                {bsaResult ? (
                  <>
                    <p className="text-slate-500 text-sm mb-2">SC Calculada</p>
                    <p className="text-5xl font-black text-blue-600 mb-2">{bsaResult} <span className="text-2xl">m²</span></p>
                  </>
                ) : (
                  <p className="text-slate-400">Insira peso e altura.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeCalc === 'tfg' && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Taxa de Filtração Glomerular (GFR)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Creatinina (mg/dL)</label>
                  <input type="number" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Idade</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none">
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
                {gfrResult ? (
                  <>
                    <p className="text-slate-500 text-sm mb-2">TFG (MDRD)</p>
                    <p className="text-5xl font-black text-blue-600 mb-2">{gfrResult}</p>
                    <p className="text-sm font-medium text-slate-600">ml/min/1.73m²</p>
                  </>
                ) : (
                  <p className="text-slate-400">Insira creatinina e idade.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ... Other calculators implemented with same pattern ... */}
        {activeCalc === 'parkland' && (
           <div className="p-8 space-y-6">
           <h2 className="text-xl font-bold text-slate-800">Fórmula de Parkland</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Peso (kg)</label>
                 <input type="number" value={parkWeight} onChange={(e) => setParkWeight(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">% de Superfície Queimada</label>
                 <input type="number" value={burnPerc} onChange={(e) => setBurnPerc(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
             </div>
             <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
               {parkResult ? (
                 <>
                   <p className="text-slate-500 text-sm mb-2">Fluidos Totais (24h)</p>
                   <p className="text-4xl font-black text-blue-600 mb-2">{parkResult} <span className="text-xl">ml</span></p>
                   <p className="text-xs text-slate-500 mt-2">1ª metade ({parkResult/2}ml) nas primeiras 8h.</p>
                 </>
               ) : (
                 <p className="text-slate-400">Insira peso e % de área.</p>
               )}
             </div>
           </div>
         </div>
        )}

        {activeCalc === 'gotejo' && (
           <div className="p-8 space-y-6">
           <h2 className="text-xl font-bold text-slate-800">Cálculo de Gotejo</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Volume (ml)</label>
                 <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Tempo (min)</label>
                 <input type="number" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Fator de Gotejo (gts/ml)</label>
                 <select value={factor} onChange={(e) => setFactor(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none">
                    <option value="20">Macro (20 gts/ml)</option>
                    <option value="60">Micro (60 gts/ml)</option>
                 </select>
               </div>
             </div>
             <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
               {dripResult ? (
                 <>
                   <p className="text-slate-500 text-sm mb-2">Velocidade</p>
                   <p className="text-5xl font-black text-blue-600 mb-2">{dripResult}</p>
                   <p className="text-sm font-medium text-slate-600">gotas/minuto</p>
                 </>
               ) : (
                 <p className="text-slate-400">Insira volume e tempo.</p>
               )}
             </div>
           </div>
         </div>
        )}

        {activeCalc === 'tam' && (
           <div className="p-8 space-y-6">
           <h2 className="text-xl font-bold text-slate-800">Tensão Arterial Média (TAM)</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Pressão Sistólica (PAS)</label>
                 <input type="number" value={pas} onChange={(e) => setPas(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Pressão Diastólica (PAD)</label>
                 <input type="number" value={pad} onChange={(e) => setPad(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
             </div>
             <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
               {tamResult ? (
                 <>
                   <p className="text-slate-500 text-sm mb-2">TAM</p>
                   <p className="text-5xl font-black text-blue-600 mb-2">{tamResult}</p>
                   <p className="text-sm font-medium text-slate-600">mmHg</p>
                 </>
               ) : (
                 <p className="text-slate-400">Insira PAS e PAD.</p>
               )}
             </div>
           </div>
         </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-1" size={20} />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Aviso Clínico:</strong> Estas calculadoras são ferramentas auxiliares. Os resultados devem ser sempre validados pelo profissional de saúde responsável, considerando o contexto clínico completo do paciente.
        </p>
      </div>
    </div>
  );
};

export default Calculators;
