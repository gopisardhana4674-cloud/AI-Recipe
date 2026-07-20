import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings, Sliders, Globe, ShieldAlert, Check } from 'lucide-react';

export default function SettingsPage() {
  const [metric, setMetric] = useState(true); // true = Metric, false = Imperial
  const [tempCelsius, setTempCelsius] = useState(true); // true = Celsius, false = Fahrenheit
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSave = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span>Settings</span>
        </h1>
      </div>

      {/* Culinary Preferences */}
      <Card hoverEffect={false} className="border-white/[0.05]">
        <CardHeader>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Sliders size={16} className="text-orange-400" />
            <span>Culinary Preferences</span>
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {/* Measurement System */}
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">Measurement System</span>
              <span className="text-xs text-gray-500">Toggle default recipes ingredient scales</span>
            </div>
            <div className="flex p-0.5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <button
                onClick={() => setMetric(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${metric ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400'}`}
              >
                Metric
              </button>
              <button
                onClick={() => setMetric(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${!metric ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400'}`}
              >
                Imperial
              </button>
            </div>
          </div>

          {/* Temperature System */}
          <div className="flex justify-between items-center py-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">Oven Temperature System</span>
              <span className="text-xs text-gray-500">Toggle Celsius vs Fahrenheit defaults</span>
            </div>
            <div className="flex p-0.5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <button
                onClick={() => setTempCelsius(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${tempCelsius ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400'}`}
              >
                °C
              </button>
              <button
                onClick={() => setTempCelsius(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${!tempCelsius ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400'}`}
              >
                °F
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Security Fallbacks Info */}
      <Card hoverEffect={false} className="border-white/[0.05]">
        <CardHeader>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Globe size={16} className="text-orange-400" />
            <span>Infrastructure Integrations</span>
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-3 text-xs leading-relaxed text-orange-300 font-semibold">
            <ShieldAlert size={20} className="flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <span>Security Fallback Enabled</span>
              <p className="text-gray-400 text-[10px] font-medium leading-relaxed uppercase mt-0.5">
                The database ORM connection currently detects no active Supabase PostgreSQL connection string. The server automatically routing CRUD updates to a local JSON file-based database model to secure system execution out-of-the-box.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full font-bold">
        {savedSettings ? (
          <span className="flex items-center gap-1">
            <Check size={16} className="text-green-400" />
            Saved Changes
          </span>
        ) : (
          <span>Save Changes</span>
        )}
      </Button>
    </div>
  );
}
