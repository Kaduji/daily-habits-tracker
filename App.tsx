const React = __vite__cjsImport0_react; const useState = __vite__cjsImport0_react["useState"]; const useEffect = __vite__cjsImport0_react["useEffect"]; const useCallback = __vite__cjsImport0_react["useCallback"];const _jsxDEV = __vite__cjsImport13_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=768266e3";
import { getSavedHabits, saveHabits, getHabitHistory, saveHabitHistory, getAppSettings, saveAppSettings, updateHabitLog, toggleHabitLog, resetAllData, DEFAULT_HABITS, getTodayDateString } from "/src/services/storageService.ts";
import { isHabitScheduledOn } from "/src/services/streakService.ts";
import { checkScheduledReminders } from "/src/services/notificationService.ts";
import { Header } from "/src/components/Header.tsx";
import { BottomNav } from "/src/components/BottomNav.tsx";
import { TodayTab } from "/src/components/TodayTab.tsx";
import { HabitsTab } from "/src/components/HabitsTab.tsx";
import { ProgressTab } from "/src/components/ProgressTab.tsx";
import { SettingsTab } from "/src/components/SettingsTab.tsx";
import { HabitFormModal } from "/src/components/HabitFormModal.tsx";
import { ConfirmModal } from "/src/components/ConfirmModal.tsx";
import { ReminderToast } from "/src/components/ReminderToast.tsx";
var _jsxFileName = "/app/applet/src/App.tsx";
import __vite__cjsImport13_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=768266e3";
export default function App() {
	const [habits, setHabits] = useState(() => getSavedHabits());
	const [history, setHistory] = useState(() => getHabitHistory());
	const [settings, setSettings] = useState(() => getAppSettings());
	const [currentTab, setCurrentTab] = useState("today");
	const [currentDate, setCurrentDate] = useState(() => getTodayDateString());
	// Modals state
	const [isFormModalOpen, setIsFormModalOpen] = useState(false);
	const [editingHabit, setEditingHabit] = useState(null);
	const [activeReminderToast, setActiveReminderToast] = useState(null);
	// Confirmation Modal
	const [confirmConfig, setConfirmConfig] = useState({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {}
	});
	// Apply Theme
	useEffect(() => {
		const root = document.documentElement;
		if (settings.theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [settings.theme]);
	// Periodic Reminder Checker
	useEffect(() => {
		// Initial check
		checkScheduledReminders(habits, (h) => setActiveReminderToast(h));
		const interval = setInterval(() => {
			checkScheduledReminders(habits, (h) => setActiveReminderToast(h));
		}, 3e4);
		return () => clearInterval(interval);
	}, [habits]);
	// Calculate pending habits for today badge
	const todayStr = getTodayDateString();
	const todayDateObj = new Date();
	const todayScheduled = habits.filter((h) => !h.isPaused && isHabitScheduledOn(h, todayDateObj));
	const todayLogs = history[todayStr] || {};
	const pendingTodayCount = todayScheduled.filter((h) => !todayLogs[h.id]?.completed).length;
	// Toggle habit completion
	const handleToggleHabit = useCallback((habit) => {
		const { history: updatedHistory } = toggleHabitLog(currentDate, habit);
		setHistory({ ...updatedHistory });
	}, [currentDate]);
	// Update incremental progress
	const handleUpdateProgress = useCallback((habit, newValue) => {
		const { history: updatedHistory } = updateHabitLog(currentDate, habit, newValue);
		setHistory({ ...updatedHistory });
	}, [currentDate]);
	// Save Habit (Add or Edit)
	const handleSaveHabit = (habitData) => {
		if (editingHabit) {
			// Update existing
			const updated = habits.map((h) => h.id === editingHabit.id ? {
				...h,
				...habitData
			} : h);
			setHabits(updated);
			saveHabits(updated);
		} else {
			// Create new
			const newHabit = {
				id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
				name: habitData.name || "नई आदत",
				icon: habitData.icon || "Droplet",
				category: habitData.category || "स्वास्थ्य",
				targetType: habitData.targetType || "boolean",
				targetValue: habitData.targetValue || 1,
				unit: habitData.unit || "बार",
				frequencyType: habitData.frequencyType || "daily",
				scheduledDays: habitData.scheduledDays || [
					0,
					1,
					2,
					3,
					4,
					5,
					6
				],
				reminderTime: habitData.reminderTime,
				color: habitData.color || "emerald",
				createdAt: new Date().toISOString(),
				isPaused: false
			};
			const updated = [newHabit, ...habits];
			setHabits(updated);
			saveHabits(updated);
		}
		setEditingHabit(null);
	};
	// Request Delete Habit with Confirmation
	const handleRequestDeleteHabit = (habit) => {
		setConfirmConfig({
			isOpen: true,
			title: "आदत हटाएं?",
			message: `क्या आप वाकई "${habit.name}" को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`,
			confirmLabel: "हाँ, हटाएं",
			cancelLabel: "रद्द करें",
			isDestructive: true,
			onConfirm: () => {
				const updated = habits.filter((h) => h.id !== habit.id);
				setHabits(updated);
				saveHabits(updated);
				setConfirmConfig((prev) => ({
					...prev,
					isOpen: false
				}));
			}
		});
	};
	// Toggle Pause/Archive Habit
	const handleTogglePauseHabit = (habit) => {
		const updated = habits.map((h) => h.id === habit.id ? {
			...h,
			isPaused: !h.isPaused
		} : h);
		setHabits(updated);
		saveHabits(updated);
	};
	// Request Restore Starter Habits
	const handleRequestRestoreDefaults = () => {
		setConfirmConfig({
			isOpen: true,
			title: "डिफ़ॉल्ट आदतें पुनः लोड करें?",
			message: "क्या आप प्रारंभिक 5 आदतें (पानी पीना, पढ़ना, व्यायाम आदि) पुनः जोड़ना चाहते हैं? आपकी मौजूदा आदतें भी सुरक्षित रहेंगी।",
			confirmLabel: "हाँ, जोड़ें",
			cancelLabel: "रद्द करें",
			isDestructive: false,
			onConfirm: () => {
				// Merge without duplicating IDs
				const existingIds = new Set(habits.map((h) => h.id));
				const newDefaults = DEFAULT_HABITS.filter((d) => !existingIds.has(d.id));
				const updated = [...habits, ...newDefaults];
				setHabits(updated);
				saveHabits(updated);
				setConfirmConfig((prev) => ({
					...prev,
					isOpen: false
				}));
			}
		});
	};
	// Request Reset All Data
	const handleRequestResetData = () => {
		setConfirmConfig({
			isOpen: true,
			title: "सभी डेटा रीसेट करें?",
			message: "सावधान! यह क्रिया आपकी सभी आदतों, इतिहास और स्ट्रीक रिकॉर्ड को स्थायी रूप से हटा देगी। क्या आप आगे बढ़ना चाहते हैं?",
			confirmLabel: "हाँ, पूरा डेटा साफ़ करें",
			cancelLabel: "नहीं, रहने दें",
			isDestructive: true,
			onConfirm: () => {
				resetAllData();
				setHabits(DEFAULT_HABITS);
				saveHabits(DEFAULT_HABITS);
				setHistory({});
				saveHabitHistory({});
				setConfirmConfig((prev) => ({
					...prev,
					isOpen: false
				}));
			}
		});
	};
	// Reload data after JSON import
	const handleDataImported = () => {
		setHabits(getSavedHabits());
		setHistory(getHabitHistory());
		setSettings(getAppSettings());
	};
	// Settings update
	const handleUpdateSettings = (newSettings) => {
		setSettings(newSettings);
		saveAppSettings(newSettings);
	};
	return /* @__PURE__ */ _jsxDEV("div", {
		className: "min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white",
		children: [
			/* @__PURE__ */ _jsxDEV("div", {
				className: "w-full max-w-md mx-auto min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col shadow-xl sm:border-x border-stone-200 dark:border-stone-800 relative",
				children: [
					/* @__PURE__ */ _jsxDEV(Header, {
						currentDate,
						onDateChange: setCurrentDate,
						onOpenAddModal: () => {
							setEditingHabit(null);
							setIsFormModalOpen(true);
						},
						theme: settings.theme === "dark" ? "dark" : "light",
						onToggleTheme: () => {
							const nextTheme = settings.theme === "dark" ? "light" : "dark";
							handleUpdateSettings({
								...settings,
								theme: nextTheme
							});
						}
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 212,
						columnNumber: 9
					}, this),
					activeReminderToast && /* @__PURE__ */ _jsxDEV(ReminderToast, {
						habit: activeReminderToast,
						onClose: () => setActiveReminderToast(null),
						onComplete: () => {
							handleToggleHabit(activeReminderToast);
							setActiveReminderToast(null);
						}
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 228,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("main", {
						className: "flex-1 overflow-x-hidden",
						children: [
							currentTab === "today" && /* @__PURE__ */ _jsxDEV(TodayTab, {
								currentDate,
								habits,
								history,
								onToggleHabit: handleToggleHabit,
								onUpdateProgress: handleUpdateProgress,
								onOpenAddModal: () => {
									setEditingHabit(null);
									setIsFormModalOpen(true);
								},
								onNavigateToManage: () => setCurrentTab("habits")
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 241,
								columnNumber: 13
							}, this),
							currentTab === "habits" && /* @__PURE__ */ _jsxDEV(HabitsTab, {
								habits,
								onOpenAddModal: () => {
									setEditingHabit(null);
									setIsFormModalOpen(true);
								},
								onOpenEditModal: (habit) => {
									setEditingHabit(habit);
									setIsFormModalOpen(true);
								},
								onRequestDeleteHabit: handleRequestDeleteHabit,
								onTogglePauseHabit: handleTogglePauseHabit
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 256,
								columnNumber: 13
							}, this),
							currentTab === "progress" && /* @__PURE__ */ _jsxDEV(ProgressTab, {
								habits,
								history
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 272,
								columnNumber: 13
							}, this),
							currentTab === "settings" && /* @__PURE__ */ _jsxDEV(SettingsTab, {
								settings,
								onUpdateSettings: handleUpdateSettings,
								habits,
								onRequestResetData: handleRequestResetData,
								onRequestRestoreDefaults: handleRequestRestoreDefaults,
								onDataImported: handleDataImported
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 279,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 239,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ _jsxDEV(BottomNav, {
						currentTab,
						onChangeTab: setCurrentTab,
						pendingTodayCount
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 291,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 210,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(HabitFormModal, {
				isOpen: isFormModalOpen,
				onClose: () => {
					setIsFormModalOpen(false);
					setEditingHabit(null);
				},
				onSave: handleSaveHabit,
				initialHabit: editingHabit
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 299,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(ConfirmModal, {
				isOpen: confirmConfig.isOpen,
				title: confirmConfig.title,
				message: confirmConfig.message,
				confirmLabel: confirmConfig.confirmLabel,
				cancelLabel: confirmConfig.cancelLabel,
				isDestructive: confirmConfig.isDestructive,
				onConfirm: confirmConfig.onConfirm,
				onCancel: () => setConfirmConfig((prev) => ({
					...prev,
					isOpen: false
				}))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 310,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 208,
		columnNumber: 5
	}, this);
}

//# sourceMappingURL=data:application/json;base64,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QUFtQixLQUFLO0tBQ3hCLGdCQUFnQixJQUFJO0lBQ3RCO0lBQ0EsUUFBUTtJQUNSLGNBQWM7R0FDZjs7Ozs7R0FHRCx3QkFBQyxjQUFEO0lBQ0UsUUFBUSxjQUFjO0lBQ3RCLE9BQU8sY0FBYztJQUNyQixTQUFTLGNBQWM7SUFDdkIsY0FBYyxjQUFjO0lBQzVCLGFBQWEsY0FBYztJQUMzQixlQUFlLGNBQWM7SUFDN0IsV0FBVyxjQUFjO0lBQ3pCLGdCQUFnQixrQkFBa0IsVUFBVTtLQUFFLEdBQUc7S0FBTSxRQUFRO0lBQU0sRUFBRTtHQUN4RTs7Ozs7RUFDRTs7Ozs7O0FBRVQiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiQXBwLnRzeCJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBcbiAgZ2V0U2F2ZWRIYWJpdHMsIFxuICBzYXZlSGFiaXRzLCBcbiAgZ2V0SGFiaXRIaXN0b3J5LCBcbiAgc2F2ZUhhYml0SGlzdG9yeSwgXG4gIGdldEFwcFNldHRpbmdzLCBcbiAgc2F2ZUFwcFNldHRpbmdzLCBcbiAgdXBkYXRlSGFiaXRMb2csIFxuICB0b2dnbGVIYWJpdExvZywgXG4gIHJlc2V0QWxsRGF0YSwgXG4gIERFRkFVTFRfSEFCSVRTLCBcbiAgZ2V0VG9kYXlEYXRlU3RyaW5nIFxufSBmcm9tICcuL3NlcnZpY2VzL3N0b3JhZ2VTZXJ2aWNlJztcbmltcG9ydCB7IGlzSGFiaXRTY2hlZHVsZWRPbiB9IGZyb20gJy4vc2VydmljZXMvc3RyZWFrU2VydmljZSc7XG5pbXBvcnQgeyBjaGVja1NjaGVkdWxlZFJlbWluZGVycyB9IGZyb20gJy4vc2VydmljZXMvbm90aWZpY2F0aW9uU2VydmljZSc7XG5pbXBvcnQgeyBIYWJpdCwgSGFiaXRIaXN0b3J5LCBBcHBTZXR0aW5ncyB9IGZyb20gJy4vdHlwZXMvaGFiaXQnO1xuaW1wb3J0IHsgSGVhZGVyIH0gZnJvbSAnLi9jb21wb25lbnRzL0hlYWRlcic7XG5pbXBvcnQgeyBCb3R0b21OYXYsIE5hdlRhYiB9IGZyb20gJy4vY29tcG9uZW50cy9Cb3R0b21OYXYnO1xuaW1wb3J0IHsgVG9kYXlUYWIgfSBmcm9tICcuL2NvbXBvbmVudHMvVG9kYXlUYWInO1xuaW1wb3J0IHsgSGFiaXRzVGFiIH0gZnJvbSAnLi9jb21wb25lbnRzL0hhYml0c1RhYic7XG5pbXBvcnQgeyBQcm9ncmVzc1RhYiB9IGZyb20gJy4vY29tcG9uZW50cy9Qcm9ncmVzc1RhYic7XG5pbXBvcnQgeyBTZXR0aW5nc1RhYiB9IGZyb20gJy4vY29tcG9uZW50cy9TZXR0aW5nc1RhYic7XG5pbXBvcnQgeyBIYWJpdEZvcm1Nb2RhbCB9IGZyb20gJy4vY29tcG9uZW50cy9IYWJpdEZvcm1Nb2RhbCc7XG5pbXBvcnQgeyBDb25maXJtTW9kYWwgfSBmcm9tICcuL2NvbXBvbmVudHMvQ29uZmlybU1vZGFsJztcbmltcG9ydCB7IFJlbWluZGVyVG9hc3QgfSBmcm9tICcuL2NvbXBvbmVudHMvUmVtaW5kZXJUb2FzdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCgpIHtcbiAgY29uc3QgW2hhYml0cywgc2V0SGFiaXRzXSA9IHVzZVN0YXRlPEhhYml0W10+KCgpID0+IGdldFNhdmVkSGFiaXRzKCkpO1xuICBjb25zdCBbaGlzdG9yeSwgc2V0SGlzdG9yeV0gPSB1c2VTdGF0ZTxIYWJpdEhpc3Rvcnk+KCgpID0+IGdldEhhYml0SGlzdG9yeSgpKTtcbiAgY29uc3QgW3NldHRpbmdzLCBzZXRTZXR0aW5nc10gPSB1c2VTdGF0ZTxBcHBTZXR0aW5ncz4oKCkgPT4gZ2V0QXBwU2V0dGluZ3MoKSk7XG4gIGNvbnN0IFtjdXJyZW50VGFiLCBzZXRDdXJyZW50VGFiXSA9IHVzZVN0YXRlPE5hdlRhYj4oJ3RvZGF5Jyk7XG4gIGNvbnN0IFtjdXJyZW50RGF0ZSwgc2V0Q3VycmVudERhdGVdID0gdXNlU3RhdGU8c3RyaW5nPigoKSA9PiBnZXRUb2RheURhdGVTdHJpbmcoKSk7XG5cbiAgLy8gTW9kYWxzIHN0YXRlXG4gIGNvbnN0IFtpc0Zvcm1Nb2RhbE9wZW4sIHNldElzRm9ybU1vZGFsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtlZGl0aW5nSGFiaXQsIHNldEVkaXRpbmdIYWJpdF0gPSB1c2VTdGF0ZTxIYWJpdCB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbYWN0aXZlUmVtaW5kZXJUb2FzdCwgc2V0QWN0aXZlUmVtaW5kZXJUb2FzdF0gPSB1c2VTdGF0ZTxIYWJpdCB8IG51bGw+KG51bGwpO1xuXG4gIC8vIENvbmZpcm1hdGlvbiBNb2RhbFxuICBjb25zdCBbY29uZmlybUNvbmZpZywgc2V0Q29uZmlybUNvbmZpZ10gPSB1c2VTdGF0ZTx7XG4gICAgaXNPcGVuOiBib29sZWFuO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIGNvbmZpcm1MYWJlbD86IHN0cmluZztcbiAgICBjYW5jZWxMYWJlbD86IHN0cmluZztcbiAgICBpc0Rlc3RydWN0aXZlPzogYm9vbGVhbjtcbiAgICBvbkNvbmZpcm06ICgpID0+IHZvaWQ7XG4gIH0+KHtcbiAgICBpc09wZW46IGZhbHNlLFxuICAgIHRpdGxlOiAnJyxcbiAgICBtZXNzYWdlOiAnJyxcbiAgICBvbkNvbmZpcm06ICgpID0+IHt9LFxuICB9KTtcblxuICAvLyBBcHBseSBUaGVtZVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgaWYgKHNldHRpbmdzLnRoZW1lID09PSAnZGFyaycpIHtcbiAgICAgIHJvb3QuY2xhc3NMaXN0LmFkZCgnZGFyaycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByb290LmNsYXNzTGlzdC5yZW1vdmUoJ2RhcmsnKTtcbiAgICB9XG4gIH0sIFtzZXR0aW5ncy50aGVtZV0pO1xuXG4gIC8vIFBlcmlvZGljIFJlbWluZGVyIENoZWNrZXJcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBJbml0aWFsIGNoZWNrXG4gICAgY2hlY2tTY2hlZHVsZWRSZW1pbmRlcnMoaGFiaXRzLCAoaCkgPT4gc2V0QWN0aXZlUmVtaW5kZXJUb2FzdChoKSk7XG5cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGNoZWNrU2NoZWR1bGVkUmVtaW5kZXJzKGhhYml0cywgKGgpID0+IHNldEFjdGl2ZVJlbWluZGVyVG9hc3QoaCkpO1xuICAgIH0sIDMwMDAwKTsgLy8gQ2hlY2sgZXZlcnkgMzAgc2Vjb25kc1xuXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICB9LCBbaGFiaXRzXSk7XG5cbiAgLy8gQ2FsY3VsYXRlIHBlbmRpbmcgaGFiaXRzIGZvciB0b2RheSBiYWRnZVxuICBjb25zdCB0b2RheVN0ciA9IGdldFRvZGF5RGF0ZVN0cmluZygpO1xuICBjb25zdCB0b2RheURhdGVPYmogPSBuZXcgRGF0ZSgpO1xuICBjb25zdCB0b2RheVNjaGVkdWxlZCA9IGhhYml0cy5maWx0ZXIoKGgpID0+ICFoLmlzUGF1c2VkICYmIGlzSGFiaXRTY2hlZHVsZWRPbihoLCB0b2RheURhdGVPYmopKTtcbiAgY29uc3QgdG9kYXlMb2dzID0gaGlzdG9yeVt0b2RheVN0cl0gfHwge307XG4gIGNvbnN0IHBlbmRpbmdUb2RheUNvdW50ID0gdG9kYXlTY2hlZHVsZWQuZmlsdGVyKChoKSA9PiAhdG9kYXlMb2dzW2guaWRdPy5jb21wbGV0ZWQpLmxlbmd0aDtcblxuICAvLyBUb2dnbGUgaGFiaXQgY29tcGxldGlvblxuICBjb25zdCBoYW5kbGVUb2dnbGVIYWJpdCA9IHVzZUNhbGxiYWNrKChoYWJpdDogSGFiaXQpID0+IHtcbiAgICBjb25zdCB7IGhpc3Rvcnk6IHVwZGF0ZWRIaXN0b3J5IH0gPSB0b2dnbGVIYWJpdExvZyhjdXJyZW50RGF0ZSwgaGFiaXQpO1xuICAgIHNldEhpc3RvcnkoeyAuLi51cGRhdGVkSGlzdG9yeSB9KTtcbiAgfSwgW2N1cnJlbnREYXRlXSk7XG5cbiAgLy8gVXBkYXRlIGluY3JlbWVudGFsIHByb2dyZXNzXG4gIGNvbnN0IGhhbmRsZVVwZGF0ZVByb2dyZXNzID0gdXNlQ2FsbGJhY2soKGhhYml0OiBIYWJpdCwgbmV3VmFsdWU6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHsgaGlzdG9yeTogdXBkYXRlZEhpc3RvcnkgfSA9IHVwZGF0ZUhhYml0TG9nKGN1cnJlbnREYXRlLCBoYWJpdCwgbmV3VmFsdWUpO1xuICAgIHNldEhpc3RvcnkoeyAuLi51cGRhdGVkSGlzdG9yeSB9KTtcbiAgfSwgW2N1cnJlbnREYXRlXSk7XG5cbiAgLy8gU2F2ZSBIYWJpdCAoQWRkIG9yIEVkaXQpXG4gIGNvbnN0IGhhbmRsZVNhdmVIYWJpdCA9IChoYWJpdERhdGE6IFBhcnRpYWw8SGFiaXQ+KSA9PiB7XG4gICAgaWYgKGVkaXRpbmdIYWJpdCkge1xuICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nXG4gICAgICBjb25zdCB1cGRhdGVkID0gaGFiaXRzLm1hcCgoaCkgPT4gKGguaWQgPT09IGVkaXRpbmdIYWJpdC5pZCA/IHsgLi4uaCwgLi4uaGFiaXREYXRhIH0gOiBoKSk7XG4gICAgICBzZXRIYWJpdHModXBkYXRlZCk7XG4gICAgICBzYXZlSGFiaXRzKHVwZGF0ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDcmVhdGUgbmV3XG4gICAgICBjb25zdCBuZXdIYWJpdDogSGFiaXQgPSB7XG4gICAgICAgIGlkOiBgaGFiaXQtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA3KX1gLFxuICAgICAgICBuYW1lOiBoYWJpdERhdGEubmFtZSB8fCAn4KSo4KSIIOCkhuCkpuCkpCcsXG4gICAgICAgIGljb246IGhhYml0RGF0YS5pY29uIHx8ICdEcm9wbGV0JyxcbiAgICAgICAgY2F0ZWdvcnk6IGhhYml0RGF0YS5jYXRlZ29yeSB8fCAn4KS44KWN4KS14KS+4KS44KWN4KSl4KWN4KSvJyxcbiAgICAgICAgdGFyZ2V0VHlwZTogaGFiaXREYXRhLnRhcmdldFR5cGUgfHwgJ2Jvb2xlYW4nLFxuICAgICAgICB0YXJnZXRWYWx1ZTogaGFiaXREYXRhLnRhcmdldFZhbHVlIHx8IDEsXG4gICAgICAgIHVuaXQ6IGhhYml0RGF0YS51bml0IHx8ICfgpKzgpL7gpLAnLFxuICAgICAgICBmcmVxdWVuY3lUeXBlOiBoYWJpdERhdGEuZnJlcXVlbmN5VHlwZSB8fCAnZGFpbHknLFxuICAgICAgICBzY2hlZHVsZWREYXlzOiBoYWJpdERhdGEuc2NoZWR1bGVkRGF5cyB8fCBbMCwgMSwgMiwgMywgNCwgNSwgNl0sXG4gICAgICAgIHJlbWluZGVyVGltZTogaGFiaXREYXRhLnJlbWluZGVyVGltZSxcbiAgICAgICAgY29sb3I6IGhhYml0RGF0YS5jb2xvciB8fCAnZW1lcmFsZCcsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICBpc1BhdXNlZDogZmFsc2UsXG4gICAgICB9O1xuICAgICAgY29uc3QgdXBkYXRlZCA9IFtuZXdIYWJpdCwgLi4uaGFiaXRzXTtcbiAgICAgIHNldEhhYml0cyh1cGRhdGVkKTtcbiAgICAgIHNhdmVIYWJpdHModXBkYXRlZCk7XG4gICAgfVxuICAgIHNldEVkaXRpbmdIYWJpdChudWxsKTtcbiAgfTtcblxuICAvLyBSZXF1ZXN0IERlbGV0ZSBIYWJpdCB3aXRoIENvbmZpcm1hdGlvblxuICBjb25zdCBoYW5kbGVSZXF1ZXN0RGVsZXRlSGFiaXQgPSAoaGFiaXQ6IEhhYml0KSA9PiB7XG4gICAgc2V0Q29uZmlybUNvbmZpZyh7XG4gICAgICBpc09wZW46IHRydWUsXG4gICAgICB0aXRsZTogJ+CkhuCkpuCkpCDgpLngpJ/gpL7gpI/gpII/JyxcbiAgICAgIG1lc3NhZ2U6IGDgpJXgpY3gpK/gpL4g4KSG4KSqIOCkteCkvuCkleCkiCBcIiR7aGFiaXQubmFtZX1cIiDgpJXgpYsg4KS54KSf4KS+4KSo4KS+IOCkmuCkvuCkueCkpOClhyDgpLngpYjgpII/IOCkr+CkuSDgpJXgpY3gpLDgpL/gpK/gpL4g4KSq4KWC4KSw4KWN4KS14KS14KSkIOCkqOCkueClgOCkgiDgpJXgpYAg4KSc4KS+IOCkuOCkleCkpOClgOClpGAsXG4gICAgICBjb25maXJtTGFiZWw6ICfgpLngpL7gpIEsIOCkueCkn+CkvuCkj+CkgicsXG4gICAgICBjYW5jZWxMYWJlbDogJ+CksOCkpuCljeCkpiDgpJXgpLDgpYfgpIInLFxuICAgICAgaXNEZXN0cnVjdGl2ZTogdHJ1ZSxcbiAgICAgIG9uQ29uZmlybTogKCkgPT4ge1xuICAgICAgICBjb25zdCB1cGRhdGVkID0gaGFiaXRzLmZpbHRlcigoaCkgPT4gaC5pZCAhPT0gaGFiaXQuaWQpO1xuICAgICAgICBzZXRIYWJpdHModXBkYXRlZCk7XG4gICAgICAgIHNhdmVIYWJpdHModXBkYXRlZCk7XG4gICAgICAgIHNldENvbmZpcm1Db25maWcoKHByZXYpID0+ICh7IC4uLnByZXYsIGlzT3BlbjogZmFsc2UgfSkpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUb2dnbGUgUGF1c2UvQXJjaGl2ZSBIYWJpdFxuICBjb25zdCBoYW5kbGVUb2dnbGVQYXVzZUhhYml0ID0gKGhhYml0OiBIYWJpdCkgPT4ge1xuICAgIGNvbnN0IHVwZGF0ZWQgPSBoYWJpdHMubWFwKChoKSA9PiAoaC5pZCA9PT0gaGFiaXQuaWQgPyB7IC4uLmgsIGlzUGF1c2VkOiAhaC5pc1BhdXNlZCB9IDogaCkpO1xuICAgIHNldEhhYml0cyh1cGRhdGVkKTtcbiAgICBzYXZlSGFiaXRzKHVwZGF0ZWQpO1xuICB9O1xuXG4gIC8vIFJlcXVlc3QgUmVzdG9yZSBTdGFydGVyIEhhYml0c1xuICBjb25zdCBoYW5kbGVSZXF1ZXN0UmVzdG9yZURlZmF1bHRzID0gKCkgPT4ge1xuICAgIHNldENvbmZpcm1Db25maWcoe1xuICAgICAgaXNPcGVuOiB0cnVlLFxuICAgICAgdGl0bGU6ICfgpKHgpL/gpKvgpLzgpYngpLLgpY3gpJ8g4KSG4KSm4KSk4KWH4KSCIOCkquClgeCkqOCkgyDgpLLgpYvgpKEg4KSV4KSw4KWH4KSCPycsXG4gICAgICBtZXNzYWdlOiAn4KSV4KWN4KSv4KS+IOCkhuCkqiDgpKrgpY3gpLDgpL7gpLDgpILgpK3gpL/gpJUgNSDgpIbgpKbgpKTgpYfgpIIgKOCkquCkvuCkqOClgCDgpKrgpYDgpKjgpL4sIOCkquCkouCkvOCkqOCkviwg4KS14KWN4KSv4KS+4KSv4KS+4KSuIOCkhuCkpuCkvykg4KSq4KWB4KSo4KSDIOCknOCli+CkoeCkvOCkqOCkviDgpJrgpL7gpLngpKTgpYcg4KS54KWI4KSCPyDgpIbgpKrgpJXgpYAg4KSu4KWM4KSc4KWC4KSm4KS+IOCkhuCkpuCkpOClh+CkgiDgpK3gpYAg4KS44KWB4KSw4KSV4KWN4KS34KS/4KSkIOCksOCkueClh+CkguCkl+ClgOClpCcsXG4gICAgICBjb25maXJtTGFiZWw6ICfgpLngpL7gpIEsIOCknOCli+CkoeCkvOClh+CkgicsXG4gICAgICBjYW5jZWxMYWJlbDogJ+CksOCkpuCljeCkpiDgpJXgpLDgpYfgpIInLFxuICAgICAgaXNEZXN0cnVjdGl2ZTogZmFsc2UsXG4gICAgICBvbkNvbmZpcm06ICgpID0+IHtcbiAgICAgICAgLy8gTWVyZ2Ugd2l0aG91dCBkdXBsaWNhdGluZyBJRHNcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJZHMgPSBuZXcgU2V0KGhhYml0cy5tYXAoKGgpID0+IGguaWQpKTtcbiAgICAgICAgY29uc3QgbmV3RGVmYXVsdHMgPSBERUZBVUxUX0hBQklUUy5maWx0ZXIoKGQpID0+ICFleGlzdGluZ0lkcy5oYXMoZC5pZCkpO1xuICAgICAgICBjb25zdCB1cGRhdGVkID0gWy4uLmhhYml0cywgLi4ubmV3RGVmYXVsdHNdO1xuICAgICAgICBzZXRIYWJpdHModXBkYXRlZCk7XG4gICAgICAgIHNhdmVIYWJpdHModXBkYXRlZCk7XG4gICAgICAgIHNldENvbmZpcm1Db25maWcoKHByZXYpID0+ICh7IC4uLnByZXYsIGlzT3BlbjogZmFsc2UgfSkpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcblxuICAvLyBSZXF1ZXN0IFJlc2V0IEFsbCBEYXRhXG4gIGNvbnN0IGhhbmRsZVJlcXVlc3RSZXNldERhdGEgPSAoKSA9PiB7XG4gICAgc2V0Q29uZmlybUNvbmZpZyh7XG4gICAgICBpc09wZW46IHRydWUsXG4gICAgICB0aXRsZTogJ+CkuOCkreClgCDgpKHgpYfgpJ/gpL4g4KSw4KWA4KS44KWH4KSfIOCkleCksOClh+Ckgj8nLFxuICAgICAgbWVzc2FnZTogJ+CkuOCkvuCkteCkp+CkvuCkqCEg4KSv4KS5IOCkleCljeCksOCkv+Ckr+CkviDgpIbgpKrgpJXgpYAg4KS44KSt4KWAIOCkhuCkpuCkpOCli+Ckgiwg4KSH4KSk4KS/4KS54KS+4KS4IOCklOCksCDgpLjgpY3gpJ/gpY3gpLDgpYDgpJUg4KSw4KS/4KSV4KWJ4KSw4KWN4KShIOCkleCliyDgpLjgpY3gpKXgpL7gpK/gpYAg4KSw4KWC4KSqIOCkuOClhyDgpLngpJ/gpL4g4KSm4KWH4KSX4KWA4KWkIOCkleCljeCkr+CkviDgpIbgpKog4KSG4KSX4KWHIOCkrOCkouCkvOCkqOCkviDgpJrgpL7gpLngpKTgpYcg4KS54KWI4KSCPycsXG4gICAgICBjb25maXJtTGFiZWw6ICfgpLngpL7gpIEsIOCkquClguCksOCkviDgpKHgpYfgpJ/gpL4g4KS44KS+4KSr4KS8IOCkleCksOClh+CkgicsXG4gICAgICBjYW5jZWxMYWJlbDogJ+CkqOCkueClgOCkgiwg4KSw4KS54KSo4KWHIOCkpuClh+CkgicsXG4gICAgICBpc0Rlc3RydWN0aXZlOiB0cnVlLFxuICAgICAgb25Db25maXJtOiAoKSA9PiB7XG4gICAgICAgIHJlc2V0QWxsRGF0YSgpO1xuICAgICAgICBzZXRIYWJpdHMoREVGQVVMVF9IQUJJVFMpO1xuICAgICAgICBzYXZlSGFiaXRzKERFRkFVTFRfSEFCSVRTKTtcbiAgICAgICAgc2V0SGlzdG9yeSh7fSk7XG4gICAgICAgIHNhdmVIYWJpdEhpc3Rvcnkoe30pO1xuICAgICAgICBzZXRDb25maXJtQ29uZmlnKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBpc09wZW46IGZhbHNlIH0pKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUmVsb2FkIGRhdGEgYWZ0ZXIgSlNPTiBpbXBvcnRcbiAgY29uc3QgaGFuZGxlRGF0YUltcG9ydGVkID0gKCkgPT4ge1xuICAgIHNldEhhYml0cyhnZXRTYXZlZEhhYml0cygpKTtcbiAgICBzZXRIaXN0b3J5KGdldEhhYml0SGlzdG9yeSgpKTtcbiAgICBzZXRTZXR0aW5ncyhnZXRBcHBTZXR0aW5ncygpKTtcbiAgfTtcblxuICAvLyBTZXR0aW5ncyB1cGRhdGVcbiAgY29uc3QgaGFuZGxlVXBkYXRlU2V0dGluZ3MgPSAobmV3U2V0dGluZ3M6IEFwcFNldHRpbmdzKSA9PiB7XG4gICAgc2V0U2V0dGluZ3MobmV3U2V0dGluZ3MpO1xuICAgIHNhdmVBcHBTZXR0aW5ncyhuZXdTZXR0aW5ncyk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1zdG9uZS0xMDAgZGFyazpiZy1zdG9uZS05NTAgdGV4dC1zdG9uZS05MDAgZGFyazp0ZXh0LXN0b25lLTEwMCBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlbiBzZWxlY3Rpb246YmctZW1lcmFsZC01MDAgc2VsZWN0aW9uOnRleHQtd2hpdGVcIj5cbiAgICAgIHsvKiBNb2JpbGUgU2hlbGwgV3JhcHBlciAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIG1heC13LW1kIG14LWF1dG8gbWluLWgtc2NyZWVuIGJnLXN0b25lLTUwIGRhcms6Ymctc3RvbmUtOTUwIGZsZXggZmxleC1jb2wgc2hhZG93LXhsIHNtOmJvcmRlci14IGJvcmRlci1zdG9uZS0yMDAgZGFyazpib3JkZXItc3RvbmUtODAwIHJlbGF0aXZlXCI+XG4gICAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICAgIDxIZWFkZXJcbiAgICAgICAgICBjdXJyZW50RGF0ZT17Y3VycmVudERhdGV9XG4gICAgICAgICAgb25EYXRlQ2hhbmdlPXtzZXRDdXJyZW50RGF0ZX1cbiAgICAgICAgICBvbk9wZW5BZGRNb2RhbD17KCkgPT4ge1xuICAgICAgICAgICAgc2V0RWRpdGluZ0hhYml0KG51bGwpO1xuICAgICAgICAgICAgc2V0SXNGb3JtTW9kYWxPcGVuKHRydWUpO1xuICAgICAgICAgIH19XG4gICAgICAgICAgdGhlbWU9e3NldHRpbmdzLnRoZW1lID09PSAnZGFyaycgPyAnZGFyaycgOiAnbGlnaHQnfVxuICAgICAgICAgIG9uVG9nZ2xlVGhlbWU9eygpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHRUaGVtZSA9IHNldHRpbmdzLnRoZW1lID09PSAnZGFyaycgPyAnbGlnaHQnIDogJ2RhcmsnO1xuICAgICAgICAgICAgaGFuZGxlVXBkYXRlU2V0dGluZ3MoeyAuLi5zZXR0aW5ncywgdGhlbWU6IG5leHRUaGVtZSB9KTtcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuXG4gICAgICAgIHsvKiBJbi1hcHAgUmVtaW5kZXIgVG9hc3QgTm90aWZpY2F0aW9uICovfVxuICAgICAgICB7YWN0aXZlUmVtaW5kZXJUb2FzdCAmJiAoXG4gICAgICAgICAgPFJlbWluZGVyVG9hc3RcbiAgICAgICAgICAgIGhhYml0PXthY3RpdmVSZW1pbmRlclRvYXN0fVxuICAgICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0QWN0aXZlUmVtaW5kZXJUb2FzdChudWxsKX1cbiAgICAgICAgICAgIG9uQ29tcGxldGU9eygpID0+IHtcbiAgICAgICAgICAgICAgaGFuZGxlVG9nZ2xlSGFiaXQoYWN0aXZlUmVtaW5kZXJUb2FzdCk7XG4gICAgICAgICAgICAgIHNldEFjdGl2ZVJlbWluZGVyVG9hc3QobnVsbCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIFRhYiBDb250ZW50ICovfVxuICAgICAgICA8bWFpbiBjbGFzc05hbWU9XCJmbGV4LTEgb3ZlcmZsb3cteC1oaWRkZW5cIj5cbiAgICAgICAgICB7Y3VycmVudFRhYiA9PT0gJ3RvZGF5JyAmJiAoXG4gICAgICAgICAgICA8VG9kYXlUYWJcbiAgICAgICAgICAgICAgY3VycmVudERhdGU9e2N1cnJlbnREYXRlfVxuICAgICAgICAgICAgICBoYWJpdHM9e2hhYml0c31cbiAgICAgICAgICAgICAgaGlzdG9yeT17aGlzdG9yeX1cbiAgICAgICAgICAgICAgb25Ub2dnbGVIYWJpdD17aGFuZGxlVG9nZ2xlSGFiaXR9XG4gICAgICAgICAgICAgIG9uVXBkYXRlUHJvZ3Jlc3M9e2hhbmRsZVVwZGF0ZVByb2dyZXNzfVxuICAgICAgICAgICAgICBvbk9wZW5BZGRNb2RhbD17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEVkaXRpbmdIYWJpdChudWxsKTtcbiAgICAgICAgICAgICAgICBzZXRJc0Zvcm1Nb2RhbE9wZW4odHJ1ZSk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIG9uTmF2aWdhdGVUb01hbmFnZT17KCkgPT4gc2V0Q3VycmVudFRhYignaGFiaXRzJyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7Y3VycmVudFRhYiA9PT0gJ2hhYml0cycgJiYgKFxuICAgICAgICAgICAgPEhhYml0c1RhYlxuICAgICAgICAgICAgICBoYWJpdHM9e2hhYml0c31cbiAgICAgICAgICAgICAgb25PcGVuQWRkTW9kYWw9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRFZGl0aW5nSGFiaXQobnVsbCk7XG4gICAgICAgICAgICAgICAgc2V0SXNGb3JtTW9kYWxPcGVuKHRydWUpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBvbk9wZW5FZGl0TW9kYWw9eyhoYWJpdCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEVkaXRpbmdIYWJpdChoYWJpdCk7XG4gICAgICAgICAgICAgICAgc2V0SXNGb3JtTW9kYWxPcGVuKHRydWUpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBvblJlcXVlc3REZWxldGVIYWJpdD17aGFuZGxlUmVxdWVzdERlbGV0ZUhhYml0fVxuICAgICAgICAgICAgICBvblRvZ2dsZVBhdXNlSGFiaXQ9e2hhbmRsZVRvZ2dsZVBhdXNlSGFiaXR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7Y3VycmVudFRhYiA9PT0gJ3Byb2dyZXNzJyAmJiAoXG4gICAgICAgICAgICA8UHJvZ3Jlc3NUYWJcbiAgICAgICAgICAgICAgaGFiaXRzPXtoYWJpdHN9XG4gICAgICAgICAgICAgIGhpc3Rvcnk9e2hpc3Rvcnl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7Y3VycmVudFRhYiA9PT0gJ3NldHRpbmdzJyAmJiAoXG4gICAgICAgICAgICA8U2V0dGluZ3NUYWJcbiAgICAgICAgICAgICAgc2V0dGluZ3M9e3NldHRpbmdzfVxuICAgICAgICAgICAgICBvblVwZGF0ZVNldHRpbmdzPXtoYW5kbGVVcGRhdGVTZXR0aW5nc31cbiAgICAgICAgICAgICAgaGFiaXRzPXtoYWJpdHN9XG4gICAgICAgICAgICAgIG9uUmVxdWVzdFJlc2V0RGF0YT17aGFuZGxlUmVxdWVzdFJlc2V0RGF0YX1cbiAgICAgICAgICAgICAgb25SZXF1ZXN0UmVzdG9yZURlZmF1bHRzPXtoYW5kbGVSZXF1ZXN0UmVzdG9yZURlZmF1bHRzfVxuICAgICAgICAgICAgICBvbkRhdGFJbXBvcnRlZD17aGFuZGxlRGF0YUltcG9ydGVkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L21haW4+XG5cbiAgICAgICAgey8qIEJvdHRvbSBNb2JpbGUgTmF2aWdhdGlvbiAqL31cbiAgICAgICAgPEJvdHRvbU5hdlxuICAgICAgICAgIGN1cnJlbnRUYWI9e2N1cnJlbnRUYWJ9XG4gICAgICAgICAgb25DaGFuZ2VUYWI9e3NldEN1cnJlbnRUYWJ9XG4gICAgICAgICAgcGVuZGluZ1RvZGF5Q291bnQ9e3BlbmRpbmdUb2RheUNvdW50fVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHsvKiBIYWJpdCBDcmVhdGUgLyBFZGl0IE1vZGFsICovfVxuICAgICAgPEhhYml0Rm9ybU1vZGFsXG4gICAgICAgIGlzT3Blbj17aXNGb3JtTW9kYWxPcGVufVxuICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgc2V0SXNGb3JtTW9kYWxPcGVuKGZhbHNlKTtcbiAgICAgICAgICBzZXRFZGl0aW5nSGFiaXQobnVsbCk7XG4gICAgICAgIH19XG4gICAgICAgIG9uU2F2ZT17aGFuZGxlU2F2ZUhhYml0fVxuICAgICAgICBpbml0aWFsSGFiaXQ9e2VkaXRpbmdIYWJpdH1cbiAgICAgIC8+XG5cbiAgICAgIHsvKiBSZXVzYWJsZSBDb25maXJtYXRpb24gRGlhbG9nICovfVxuICAgICAgPENvbmZpcm1Nb2RhbFxuICAgICAgICBpc09wZW49e2NvbmZpcm1Db25maWcuaXNPcGVufVxuICAgICAgICB0aXRsZT17Y29uZmlybUNvbmZpZy50aXRsZX1cbiAgICAgICAgbWVzc2FnZT17Y29uZmlybUNvbmZpZy5tZXNzYWdlfVxuICAgICAgICBjb25maXJtTGFiZWw9e2NvbmZpcm1Db25maWcuY29uZmlybUxhYmVsfVxuICAgICAgICBjYW5jZWxMYWJlbD17Y29uZmlybUNvbmZpZy5jYW5jZWxMYWJlbH1cbiAgICAgICAgaXNEZXN0cnVjdGl2ZT17Y29uZmlybUNvbmZpZy5pc0Rlc3RydWN0aXZlfVxuICAgICAgICBvbkNvbmZpcm09e2NvbmZpcm1Db25maWcub25Db25maXJtfVxuICAgICAgICBvbkNhbmNlbD17KCkgPT4gc2V0Q29uZmlybUNvbmZpZygocHJldikgPT4gKHsgLi4ucHJldiwgaXNPcGVuOiBmYWxzZSB9KSl9XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApO1xufVxuIl19