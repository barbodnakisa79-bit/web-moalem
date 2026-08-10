import React, { useState, useEffect } from 'react';
import { Classroom, Student, AttendanceRecord, ScoreRecord, ClassJournalEntry, BehavioralPoint, TimetableItem } from './types';
import {
  initialClassrooms,
  initialStudents,
  initialAttendance,
  initialScores,
  initialJournals,
  initialBehavioralPoints,
  initialTimetable,
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudentManagement } from './components/StudentManagement';
import { AttendanceTracker } from './components/AttendanceTracker';
import { GradeTracker } from './components/GradeTracker';
import { JournalManager } from './components/JournalManager';
import { BehaviorTracker } from './components/BehaviorTracker';
import { TimetableView } from './components/TimetableView';
import { ReportsView } from './components/ReportsView';
import { AndroidCodeImporter } from './components/AndroidCodeImporter';
import { ClassroomModal } from './components/ClassroomModal';
import { SettingsView } from './components/SettingsView';
import { DeveloperContactModal } from './components/DeveloperContactModal';
import { StudentProfileView } from './components/StudentProfileView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SubjectCardsView } from './components/SubjectCardsView';
import { LockScreen } from './components/LockScreen';
import { isStudentInClassroom } from './utils/studentUtils';

export default function App() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_classrooms');
      return saved ? JSON.parse(saved) : initialClassrooms;
    } catch {
      return initialClassrooms;
    }
  });

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_selectedClassId');
      if (saved) return saved;
    } catch {}
    return initialClassrooms[0]?.id || '';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_students');
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_attendance');
      return saved ? JSON.parse(saved) : initialAttendance;
    } catch {
      return initialAttendance;
    }
  });

  const [scores, setScores] = useState<ScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_scores');
      return saved ? JSON.parse(saved) : initialScores;
    } catch {
      return initialScores;
    }
  });

  const [journals, setJournals] = useState<ClassJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_journals');
      return saved ? JSON.parse(saved) : initialJournals;
    } catch {
      return initialJournals;
    }
  });

  const [behavioralPoints, setBehavioralPoints] = useState<BehavioralPoint[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_behavioralPoints');
      return saved ? JSON.parse(saved) : initialBehavioralPoints;
    } catch {
      return initialBehavioralPoints;
    }
  });

  const [timetable, setTimetable] = useState<TimetableItem[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_timetable');
      return saved ? JSON.parse(saved) : initialTimetable;
    } catch {
      return initialTimetable;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_activeTab');
      if (saved) return saved as TabType;
    } catch {}
    return 'dashboard';
  });
  const [dashboardSubView, setDashboardSubView] = useState<'cards' | 'detail'>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_dashboardSubView');
      if (saved === 'cards' || saved === 'detail') return saved;
    } catch {}
    return 'cards';
  });
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_isDarkMode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const isPinEnabled = localStorage.getItem('amoozgar_pin_enabled') === 'true';
      const pinCode = localStorage.getItem('amoozgar_pin_code');
      return isPinEnabled && !!pinCode;
    } catch {
      return false;
    }
  });

  // Active student profile modal state
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<Student | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_classrooms', JSON.stringify(classrooms));
    } catch (e) {
      console.error(e);
    }
  }, [classrooms]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_selectedClassId', selectedClassId);
    } catch (e) {
      console.error(e);
    }
  }, [selectedClassId]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_students', JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_attendance', JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_scores', JSON.stringify(scores));
    } catch (e) {
      console.error(e);
    }
  }, [scores]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_journals', JSON.stringify(journals));
    } catch (e) {
      console.error(e);
    }
  }, [journals]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_behavioralPoints', JSON.stringify(behavioralPoints));
    } catch (e) {
      console.error(e);
    }
  }, [behavioralPoints]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_timetable', JSON.stringify(timetable));
    } catch (e) {
      console.error(e);
    }
  }, [timetable]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_isDarkMode', JSON.stringify(isDarkMode));
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_activeTab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_dashboardSubView', dashboardSubView);
    } catch (e) {
      console.error(e);
    }
  }, [dashboardSubView]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const activeClassroom = classrooms.find((c) => c.id === selectedClassId) || classrooms[0] || {
    id: 'class-fallback',
    name: 'کلاس تعریف نشده',
    grade: 'نامشخص',
    subject: 'نامشخص',
    schoolName: 'نامشخص',
    academicYear: '۱۴۰۳-۱۴۰۴',
    evaluationSystem: 'numeric',
  };

  // Effect to automatically sync student classIds with matching grade classrooms
  useEffect(() => {
    if (classrooms.length > 0 && students.length > 0) {
      setStudents((prev) => {
        let changed = false;
        const updated = prev.map((s) => {
          const matchingIds = classrooms
            .filter((c) => {
              const schoolMatch = !s.schoolName || !c.schoolName || c.schoolName.trim() === s.schoolName.trim();
              const gradeMatch = s.grade && c.grade && c.grade.trim() === s.grade.trim();
              return schoolMatch && gradeMatch;
            })
            .map((c) => c.id);

          if (s.classId && !matchingIds.includes(s.classId)) matchingIds.push(s.classId);
          const currentIds = s.classIds || (s.classId ? [s.classId] : []);
          const mergedSet = new Set([...currentIds, ...matchingIds]);

          if (mergedSet.size !== currentIds.length) {
            changed = true;
            return { ...s, classIds: Array.from(mergedSet) };
          }
          return s;
        });
        return changed ? updated : prev;
      });
    }
  }, [classrooms]);

  // Handler to add classroom
  const handleAddClassroom = (newCls: Omit<Classroom, 'id'>) => {
    const created: Classroom = {
      ...newCls,
      id: `class-${Date.now()}`,
    };
    setClassrooms((prev) => [...prev, created]);
    setSelectedClassId(created.id);
    setDashboardSubView('detail');

    // Automatically assign existing students of the same grade & school to this new classroom
    setStudents((prev) =>
      prev.map((s) => {
        const schoolMatch = !newCls.schoolName || !s.schoolName || s.schoolName.trim() === newCls.schoolName.trim();
        const gradeMatch = s.grade && newCls.grade && s.grade.trim() === newCls.grade.trim();
        if (schoolMatch && gradeMatch) {
          const currentIds = s.classIds || (s.classId ? [s.classId] : []);
          const merged = Array.from(new Set([...currentIds, created.id]));
          return { ...s, classIds: merged };
        }
        return s;
      })
    );
  };

  // Handler to update classroom
  const handleUpdateClassroom = (updatedCls: Classroom) => {
    setClassrooms((prev) => prev.map((c) => (c.id === updatedCls.id ? updatedCls : c)));
  };

  // Handler to delete classroom
  const handleDeleteClassroom = (classroomId: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== classroomId));
    if (selectedClassId === classroomId) {
      const remaining = classrooms.filter((c) => c.id !== classroomId);
      if (remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
    }
  };

  // Handler to delete an entire school and all its classrooms
  const handleDeleteSchool = (schoolName: string) => {
    const classesInSchool = classrooms.filter((c) => c.schoolName === schoolName);
    const classIdsInSchool = classesInSchool.map((c) => c.id);

    setClassrooms((prev) => prev.filter((c) => c.schoolName !== schoolName));
    setStudents((prev) => prev.filter((s) => !classIdsInSchool.includes(s.classId)));
    setScores((prev) => prev.filter((s) => !classIdsInSchool.includes(s.classId)));
    setAttendance((prev) => prev.filter((a) => !classIdsInSchool.includes(a.classId)));
    setJournals((prev) => prev.filter((j) => !classIdsInSchool.includes(j.classId)));
    setBehavioralPoints((prev) => prev.filter((p) => !classIdsInSchool.includes(p.classId)));

    const remaining = classrooms.filter((c) => c.schoolName !== schoolName);
    if (remaining.length > 0) {
      setSelectedClassId(remaining[0].id);
    }
  };

  // Handler to rename a school across all classrooms
  const handleRenameSchool = (oldName: string, newName: string) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.schoolName === oldName ? { ...c, schoolName: newName } : c))
    );
  };

  // Handler to add student
  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    // Find all matching classrooms in same grade & school
    const matchingClassIds = classrooms
      .filter((c) => {
        const schoolMatch = !newStudent.schoolName || !c.schoolName || c.schoolName.trim() === newStudent.schoolName.trim();
        const gradeMatch = newStudent.grade && c.grade && c.grade.trim() === newStudent.grade.trim();
        return schoolMatch && gradeMatch;
      })
      .map((c) => c.id);

    if (newStudent.classId && !matchingClassIds.includes(newStudent.classId)) {
      matchingClassIds.push(newStudent.classId);
    }

    const currentClassIds = newStudent.classIds || [];
    const mergedClassIds = Array.from(new Set([...currentClassIds, ...matchingClassIds]));

    const created: Student = {
      ...newStudent,
      classIds: mergedClassIds,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [...prev, created]);
  };

  // Handler to update student
  const handleUpdateStudent = (updatedStudent: Student) => {
    // Update classIds for updated grade/school
    const matchingClassIds = classrooms
      .filter((c) => {
        const schoolMatch = !updatedStudent.schoolName || !c.schoolName || c.schoolName.trim() === updatedStudent.schoolName.trim();
        const gradeMatch = updatedStudent.grade && c.grade && c.grade.trim() === updatedStudent.grade.trim();
        return schoolMatch && gradeMatch;
      })
      .map((c) => c.id);

    const mergedClassIds = Array.from(new Set([...(updatedStudent.classIds || []), ...matchingClassIds]));
    const finalStudent = { ...updatedStudent, classIds: mergedClassIds };

    setStudents((prev) => prev.map((s) => (s.id === finalStudent.id ? finalStudent : s)));
    if (selectedProfileStudent?.id === finalStudent.id) {
      setSelectedProfileStudent(finalStudent);
    }
  };

  // Handler to delete student
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Handler to save batch attendance
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const date = records[0]?.date;
      const classId = records[0]?.classId;
      const filtered = prev.filter((a) => !(a.classId === classId && a.date === date));
      return [...filtered, ...records];
    });
  };

  // Handler for single attendance add/update
  const handleSingleAddAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(a.studentId === record.studentId && a.classId === record.classId && a.date === record.date));
      return [record, ...filtered];
    });
  };

  // Handler to add scores
  const handleAddScores = (newScores: ScoreRecord[]) => {
    setScores((prev) => [...prev, ...newScores]);
  };

  // Handler for single score addition
  const handleSingleAddScore = (score: ScoreRecord) => {
    setScores((prev) => [score, ...prev]);
  };

  // Handler to delete score
  const handleDeleteScore = (scoreId: string) => {
    setScores((prev) => prev.filter((s) => s.id !== scoreId));
  };

  // Handler to add journal
  const handleAddJournal = (entry: ClassJournalEntry) => {
    setJournals((prev) => [entry, ...prev]);
  };

  // Handler to add behavior point
  const handleAddBehaviorPoint = (point: BehavioralPoint) => {
    setBehavioralPoints((prev) => [point, ...prev]);
  };

  // Handler to delete behavior point
  const handleDeleteBehaviorPoint = (pointId: string) => {
    setBehavioralPoints((prev) => prev.filter((bp) => bp.id !== pointId));
  };

  // Handler to import students parsed from Android converter
  const handleImportParsedStudents = (parsedStudents: Array<{ fullName: string; studentCode: string; fatherName?: string; parentPhone?: string }>) => {
    const matchingClassIds = classrooms
      .filter((c) => {
        const schoolMatch = !activeClassroom.schoolName || !c.schoolName || c.schoolName.trim() === activeClassroom.schoolName.trim();
        const gradeMatch = activeClassroom.grade && c.grade && c.grade.trim() === activeClassroom.grade.trim();
        return schoolMatch && gradeMatch;
      })
      .map((c) => c.id);

    if (activeClassroom.id && !matchingClassIds.includes(activeClassroom.id)) {
      matchingClassIds.push(activeClassroom.id);
    }

    const createdList: Student[] = parsedStudents.map((st, i) => ({
      id: `android-std-${Date.now()}-${i}`,
      classId: activeClassroom.id,
      classIds: matchingClassIds,
      grade: activeClassroom.grade,
      schoolName: activeClassroom.schoolName,
      className: activeClassroom.name,
      fullName: st.fullName,
      studentCode: st.studentCode || `00${Date.now() % 1000000}`,
      fatherName: st.fatherName,
      parentPhone: st.parentPhone,
    }));
    setStudents((prev) => [...prev, ...createdList]);
  };

  const handleClearAllData = () => {
    setClassrooms([]);
    setSelectedClassId('');
    setStudents([]);
    setAttendance([]);
    setScores([]);
    setJournals([]);
    setBehavioralPoints([]);
    setTimetable([]);

    try {
      localStorage.removeItem('amoozgar_classrooms');
      localStorage.removeItem('amoozgar_selectedClassId');
      localStorage.removeItem('amoozgar_students');
      localStorage.removeItem('amoozgar_attendance');
      localStorage.removeItem('amoozgar_scores');
      localStorage.removeItem('amoozgar_journals');
      localStorage.removeItem('amoozgar_behavioralPoints');
      localStorage.removeItem('amoozgar_timetable');
      localStorage.removeItem('amoozgar_schools_details');
      localStorage.removeItem('amoozgar_custom_schools');
      localStorage.removeItem('amoozgar_grade_colors');
    } catch (e) {
      console.error(e);
    }
  };

  const activeStudentsCount = students.filter((s) => isStudentInClassroom(s, activeClassroom)).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const attendanceTodayCount = attendance.filter((a) => a.classId === activeClassroom?.id && a.date === todayStr).length;

  if (isLocked) {
    return (
      <LockScreen
        onUnlock={() => setIsLocked(false)}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDarkMode ? 'bg-[#07151E] text-slate-100' : 'bg-[#edf2f7] text-slate-900'
    }`} dir="rtl">
      
      {/* Top Header */}
      <Header
        classrooms={classrooms}
        selectedClassId={selectedClassId}
        onSelectClassroom={(id) => {
          setSelectedClassId(id);
          setDashboardSubView('detail');
        }}
        onOpenAddClassModal={() => setIsAddClassModalOpen(true)}
        onOpenAndroidImporter={() => setActiveTab('android_importer')}
        studentCount={activeStudentsCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar Menu */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'dashboard') {
              setDashboardSubView('cards');
            }
          }}
          attendanceCountToday={attendanceTodayCount}
          isDarkMode={isDarkMode}
        />

        {/* View Container */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto pb-20 lg:pb-5">
          {selectedProfileStudent ? (
            <StudentProfileView
              student={selectedProfileStudent}
              classroom={activeClassroom}
              scores={scores}
              attendance={attendance}
              behavioralPoints={behavioralPoints}
              onClose={() => setSelectedProfileStudent(null)}
              onUpdateStudent={handleUpdateStudent}
              onAddScore={handleSingleAddScore}
              onDeleteScore={handleDeleteScore}
              onAddAttendance={handleSingleAddAttendance}
              onAddBehaviorPoint={handleAddBehaviorPoint}
              onDeleteBehaviorPoint={handleDeleteBehaviorPoint}
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                dashboardSubView === 'cards' ? (
                  <SubjectCardsView
                    classrooms={classrooms}
                    students={students}
                    onSelectClassroom={(cls, autoOpenDetail = true) => {
                      setSelectedClassId(cls.id);
                      if (autoOpenDetail) {
                        setDashboardSubView('detail');
                      }
                    }}
                    onOpenAddClassModal={() => setIsAddClassModalOpen(true)}
                    onUpdateClassroom={handleUpdateClassroom}
                    onDeleteClassroom={handleDeleteClassroom}
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  <DashboardView
                    classroom={activeClassroom}
                    students={students}
                    attendance={attendance}
                    scores={scores}
                    journals={journals}
                    onNavigate={(tab) => setActiveTab(tab)}
                    onSelectStudentProfile={(student) => setSelectedProfileStudent(student)}
                    onQuickAddScore={handleSingleAddScore}
                    onQuickAddAttendance={handleSingleAddAttendance}
                    onBackToCards={() => setDashboardSubView('cards')}
                    isDarkMode={isDarkMode}
                  />
                )
              )}

              {activeTab === 'students' && (
                <StudentManagement
                  classroom={activeClassroom}
                  classrooms={classrooms}
                  students={students}
                  scores={scores}
                  attendance={attendance}
                  behavioralPoints={behavioralPoints}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onAddScore={handleSingleAddScore}
                  onDeleteScore={handleDeleteScore}
                  onAddAttendance={handleSingleAddAttendance}
                  onAddBehaviorPoint={handleAddBehaviorPoint}
                  onSelectStudentProfile={(student) => setSelectedProfileStudent(student)}
                  onSelectClassroom={(cls) => setSelectedClassId(cls.id)}
                  isDarkMode={isDarkMode}
                />
              )}

          {activeTab === 'attendance' && (
            <AttendanceTracker
              classroom={activeClassroom}
              students={students}
              attendance={attendance}
              onSaveAttendance={handleSaveAttendance}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'grades' && (
            <GradeTracker
              classroom={activeClassroom}
              students={students}
              scores={scores}
              onAddScores={handleAddScores}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'journal' && (
            <JournalManager
              classroom={activeClassroom}
              journals={journals}
              onAddJournal={handleAddJournal}
              students={students}
              scores={scores}
              attendance={attendance}
              behavioralPoints={behavioralPoints}
              onAddBehaviorPoint={handleAddBehaviorPoint}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'behavior' && (
            <JournalManager
              classroom={activeClassroom}
              journals={journals}
              onAddJournal={handleAddJournal}
              students={students}
              scores={scores}
              attendance={attendance}
              behavioralPoints={behavioralPoints}
              onAddBehaviorPoint={handleAddBehaviorPoint}
              defaultTab="behavior"
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableView
              classrooms={classrooms}
              timetable={timetable}
              onUpdateTimetable={(newTt) => setTimetable(newTt)}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'reports' && (
            <JournalManager
              classroom={activeClassroom}
              journals={journals}
              onAddJournal={handleAddJournal}
              students={students}
              scores={scores}
              attendance={attendance}
              defaultTab="reports"
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
              isDarkMode={isDarkMode}
              onToggleDarkMode={(dark) => setIsDarkMode(dark)}
              classrooms={classrooms}
              students={students}
              attendance={attendance}
              scores={scores}
              journals={journals}
              behavioralPoints={behavioralPoints}
              timetable={timetable}
              onRestoreData={(restored) => {
                if (restored.classrooms && restored.classrooms.length > 0) {
                  setClassrooms(restored.classrooms);
                  setSelectedClassId(restored.classrooms[0].id);
                }
                if (restored.students) setStudents(restored.students);
                if (restored.attendance) setAttendance(restored.attendance);
                if (restored.scores) setScores(restored.scores);
                if (restored.journals) setJournals(restored.journals);
                if (restored.behavioralPoints) setBehavioralPoints(restored.behavioralPoints);
              }}
              onDeleteSchool={handleDeleteSchool}
              onRenameSchool={handleRenameSchool}
              onClearAllData={handleClearAllData}
            />
          )}

          {activeTab === 'android_importer' && (
            <AndroidCodeImporter
              onImportParsedStudents={handleImportParsedStudents}
            />
          )}
            </>
          )}
        </main>

      </div>

      {/* Add Classroom Modal */}
      <ClassroomModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onAddClassroom={handleAddClassroom}
        classrooms={classrooms}
      />

      {/* Developer Contact Modal */}
      <DeveloperContactModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
      />

    </div>
  );
}
