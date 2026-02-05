type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	let theme = $state<Theme>('system');
	let resolvedTheme = $state<'light' | 'dark'>('light');

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', newTheme);
			applyTheme();
		}
	}

	function applyTheme() {
		if (typeof window === 'undefined') return;

		const root = document.documentElement;
		let effectiveTheme: 'light' | 'dark';

		if (theme === 'system') {
			effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		} else {
			effectiveTheme = theme;
		}

		resolvedTheme = effectiveTheme;

		if (effectiveTheme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}

	function initialize() {
		if (typeof window === 'undefined') return;

		// localStorageから読み込み
		const stored = localStorage.getItem('theme') as Theme | null;
		if (stored && ['light', 'dark', 'system'].includes(stored)) {
			theme = stored;
		}

		applyTheme();

		// システムテーマの変更を監視
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (theme === 'system') {
				applyTheme();
			}
		});
	}

	function toggle() {
		// light -> dark -> system -> light
		if (theme === 'light') {
			setTheme('dark');
		} else if (theme === 'dark') {
			setTheme('system');
		} else {
			setTheme('light');
		}
	}

	return {
		get theme() {
			return theme;
		},
		get resolvedTheme() {
			return resolvedTheme;
		},
		setTheme,
		toggle,
		initialize
	};
}

export const themeStore = createThemeStore();
