import React, { useState } from 'react';
import { Lock, Fingerprint, ShieldCheck, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
  isDarkMode?: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, isDarkMode = false }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const savedPin = localStorage.getItem('amoozgar_pin_code') || '';
  const savedQuestionAnswer = localStorage.getItem('amoozgar_security_answer') || '';
  const fingerprintEnabled = localStorage.getItem('amoozgar_fingerprint_enabled') === 'true';

  const handlePinSubmit = (inputPin: string) => {
    if (inputPin === savedPin) {
      setError('');
      onUnlock();
    } else {
      setError('رمز عبور اشتباه است.');
      setPin('');
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        handlePinSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleFingerprintUnlock = () => {
    // Simulate fingerprint biometric success
    onUnlock();
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      savedQuestionAnswer &&
      recoveryAnswer.trim().toLowerCase() === savedQuestionAnswer.trim().toLowerCase()
    ) {
      setRecoverySuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 1000);
    } else {
      setError('پاسخ سوال امنیتی نادرست است.');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors ${
        isDarkMode ? 'bg-[#0B1E28] text-white' : 'bg-slate-900 text-white'
      }`}
      dir="rtl"
    >
      <div className="w-full max-w-sm space-y-6 text-center animate-fade-in">
        {/* App Branding Header */}
        <div className="space-y-2">
          <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg mb-2">
            <Lock className="w-10 h-10 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">دستیار هوشمند معلم</h1>
          <p className="text-xs text-slate-400">برنامه قفل است. لطفاً جهت ورود رمز عبور را وارد کنید.</p>
        </div>

        {!showRecovery ? (
          <>
            {/* PIN Display Dots */}
            <div className="space-y-3">
              <div className="flex justify-center items-center gap-4 dir-ltr py-3">
                {[0, 1, 2, 3].map((index) => {
                  const filled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                        filled
                          ? 'bg-purple-500 border-purple-400 scale-110 shadow-md shadow-purple-500/30'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {error && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto dir-ltr">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-purple-600 text-white font-extrabold text-xl transition-all shadow-sm active:scale-95 flex items-center justify-center border border-slate-700/60"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDelete}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 font-bold text-xs transition-all active:scale-95 flex items-center justify-center border border-slate-800"
              >
                پاک کردن
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-purple-600 text-white font-extrabold text-xl transition-all shadow-sm active:scale-95 flex items-center justify-center border border-slate-700/60"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-purple-400 font-bold text-xs transition-all active:scale-95 flex items-center justify-center border border-slate-800 p-1"
              >
                بازیابی
              </button>
            </div>

            {/* Fingerprint Option if enabled */}
            {fingerprintEnabled && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFingerprintUnlock}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Fingerprint className="w-5 h-5 text-teal-400" />
                  <span>ورود با اثر انگشت</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Recovery Mode via Security Question */
          <form onSubmit={handleRecoverySubmit} className="space-y-4 bg-slate-800/60 p-5 rounded-3xl border border-slate-700 text-right animate-fade-in">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm border-b border-slate-700 pb-3">
              <ShieldCheck className="w-5 h-5" />
              <span>بازیابی رمز عبور با سوال امنیتی</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">
                پاسخ سوال امنیتی (نام اولین معلم یا شهر محل تولد):
              </label>
              <input
                type="text"
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
                placeholder="پاسخ..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-400"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {recoverySuccess && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>پاسخ صحیح است. در حال احراز هویت...</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs transition-all"
              >
                تایید و ورود
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRecovery(false);
                  setError('');
                }}
                className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-xs"
              >
                بازگشت
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
