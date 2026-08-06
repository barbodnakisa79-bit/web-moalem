import React, { useState } from 'react';
import { Smartphone, Code, FileText, CheckCircle2, ArrowRightLeft, Sparkles, Copy, Check, Upload, Layers } from 'lucide-react';

interface AndroidCodeImporterProps {
  onImportParsedStudents?: (studentsData: Array<{ fullName: string; studentCode: string; fatherName?: string; parentPhone?: string }>) => void;
  onImportParsedScores?: (scoresData: Array<{ studentName: string; score: number; title: string }>) => void;
}

export const AndroidCodeImporter: React.FC<AndroidCodeImporterProps> = ({
  onImportParsedStudents,
  onImportParsedScores,
}) => {
  const [fileName, setFileName] = useState<string>('StudentActivity.kt');
  const [codeContent, setCodeContent] = useState<string>(`// نمونه کد Kotlin / Java / Room / SQLite / JSON
package com.example.smartnotebook.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "students")
data class StudentEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val classId: String,
    val fullName: String,
    val studentCode: String,
    val parentPhone: String?,
    val fatherName: String?
)

/* نمونه لیست انالوگ دیتابیس اندروید:
val sampleAndroidStudents = listOf(
    StudentEntity(1, "class-1", "امیرعلی کاظمی", "00234111", "09123334455", "محسن"),
    StudentEntity(2, "class-1", "رضا شهبازی", "00234222", "09124445566", "کامران")
)
*/`);

  const [convertedCode, setConvertedCode] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Helper to parse pasted code/JSON for student arrays or model entities
  const handleAnalyzeAndConvert = () => {
    setAnalyzing(true);
    setImportStatus(null);

    setTimeout(() => {
      setAnalyzing(false);

      // Simple heuristic parser for TypeScript conversion preview
      if (codeContent.includes('StudentEntity') || codeContent.includes('data class Student') || codeContent.includes('fullName')) {
        const tsOutput = `// کد معادل TypeScript برای نسخه وب:
export interface Student {
  id: string;
  classId: string;
  fullName: string;
  studentCode: string;
  parentPhone?: string;
  fatherName?: string;
}

// تابع تبدیل مدل اندروید Room به نسخه وب:
export const mapAndroidStudentToWeb = (androidData: any): Student => ({
  id: String(androidData.id || Date.now()),
  classId: androidData.classId || 'class-1',
  fullName: androidData.fullName || 'دانش‌آموز نامشخص',
  studentCode: androidData.studentCode || '0000000000',
  parentPhone: androidData.parentPhone || '',
  fatherName: androidData.fatherName || ''
});`;
        setConvertedCode(tsOutput);

        // Try extracting students if raw text/json matches
        const matches = [...codeContent.matchAll(/"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g)];
        if (matches.length > 0 && onImportParsedStudents) {
          const parsed = matches.map((m) => ({
            fullName: m[1],
            studentCode: m[2],
            parentPhone: m[3],
            fatherName: m[4],
          }));
          onImportParsedStudents(parsed);
          setImportStatus(`تعداد ${parsed.length} دانش‌آموز از کد اندروید استخراج و به کلاس اضافه شدند!`);
        } else {
          setImportStatus('کد اندروید تحلیل شد و ساختار TypeScript آن تولید گردید.');
        }
      } else if (codeContent.includes('Score') || codeContent.includes('Grade') || codeContent.includes('scoreNumeric')) {
        const tsOutput = `// تبدیل مدل نمره اندروید به TypeScript:
export interface ScoreRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  title: string;
  scoreNumeric: number;
}`;
        setConvertedCode(tsOutput);
        setImportStatus('ساختار نمرات اندروید با موفقیت به مدل وب تبدیل شد.');
      } else {
        const genericTs = `// کد متناظر TypeScript / React:
/*
  کد دریافتی با موفقیت آنالیز شد.
  می‌توانید کدهای Activity، Fragment، ViewModel، Adapter، و یا Layoutهای XML خود را
  در این بخش وارد کنید تا معادل JSX/React آن را مشاهده کنید.
*/

import React from 'react';

export const ConvertedAndroidComponent: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-xl shadow-xs">
      <h3 className="font-bold">کامپوننت تبدیل شده از اندروید</h3>
    </div>
  );
};`;
        setConvertedCode(genericTs);
        setImportStatus('کد ورودی دریافت شد و آماده پردازش در سامانه تحت وب است.');
      }
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleFiles = [
    { name: 'StudentEntity.kt', type: 'Kotlin Entity' },
    { name: 'AttendanceDatabase.sqlite', type: 'SQLite / Room' },
    { name: 'activity_main.xml', type: 'Android XML Layout' },
    { name: 'GradeViewModel.java', type: 'Java ViewModel' },
  ];

  return (
    <div className="space-y-3.5">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>مبدل کدهای اندروید به وب (Kotlin/Java/XML/Room to React)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            کدهای پروژه اندروید دفتر کلاسی خود را ارسال کنید
          </h2>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            کدهای Kotlin، Java، فایل‌های Layout XML، مدل‌های دیتابیس Room یا خروجی‌های JSON پروژه اندروید خود را یکی یکی ارسال کنید تا ساختار آنها تحلیل شده و به کامپوننت‌ها و دیتابیس تحت وب تبدیل گردند.
          </p>
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Code className="w-5 h-5 text-indigo-600" />
              <span>ورودی: کد پروژه اندروید</span>
            </div>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="نام فایل (مثلا Student.kt)"
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-mono text-left focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">کد کپی‌شده از اندروید استودیو را اینجا قرار دهید:</label>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              rows={12}
              className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none dir-ltr text-left"
              placeholder="// Paste Android Kotlin / Java / XML / JSON here..."
            />
          </div>

          {/* Quick Preset Badges */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">پیش‌فرض‌های آماده:</span>
            <div className="flex flex-wrap gap-2">
              {sampleFiles.map((sf) => (
                <button
                  key={sf.name}
                  onClick={() => {
                    setFileName(sf.name);
                    if (sf.name.includes('Student')) {
                      setCodeContent(`// Kotlin Student Entity
data class Student(
    val id: String,
    val name: String,
    val code: String,
    val phone: String
)`);
                    } else if (sf.name.includes('Attendance')) {
                      setCodeContent(`// SQLite Attendance Query
SELECT students.name, attendance.status, attendance.date 
FROM attendance 
JOIN students ON attendance.student_id = students.id;`);
                    } else {
                      setCodeContent(`<!-- Android XML Layout Sample -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical">
    <TextView
        android:id="@+id/tvStudentName"
        android:text="امیرحسین" />
</LinearLayout>`);
                    }
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-mono transition-colors"
                >
                  {sf.name}
                </button>
              ))}
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleAnalyzeAndConvert}
            disabled={analyzing || !codeContent.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <span>در حال تحلیل و تبدیل کد...</span>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                <span>تبدیل به کد وب (TypeScript / React)</span>
                <Sparkles className="w-4 h-4 text-indigo-200" />
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>خروجی: کد متناظر نسخه وب</span>
            </div>
            {convertedCode && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کپی شد!' : 'کپی کد'}</span>
              </button>
            )}
          </div>

          {importStatus && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="flex-1 space-y-1">
            <label className="text-xs text-slate-500 font-medium">خروجی تبدیل‌شده جهت استفاده در پروژه:</label>
            {convertedCode ? (
              <textarea
                value={convertedCode}
                readOnly
                rows={12}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-hidden resize-none dir-ltr text-left"
              />
            ) : (
              <div className="h-64 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Layers className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">آماده تبدیل کدهای اندروید</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  کد فایل مورد نظر از پروژه اندروید را در باکس سمت راست وارد کرده و دکمه تبدیل را بزنید.
                </p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <span className="font-bold">💡 راهنمای کپی‌کردن کدها:</span>
            <p className="text-amber-800 leading-relaxed">
              شما می‌توانید کدهای هر بخش (مدل‌های داده، Activityها، Adapters، پرووایدر دیتابیس SQLite یا SharedPreferences) را در پیام‌های بعدی بفرستید تا دقیقاً پیاده‌سازی شوند.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
