const fs = require('fs');

// Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(/function App\(\) \{\\n.*\\n/, `function App() {
  const { theme, primaryColor } = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    root.style.setProperty('--primary-custom', primaryColor);
  }, [theme, primaryColor]);
`);
fs.writeFileSync('src/App.tsx', appContent);

// Fix Configuracion.tsx
let confContent = fs.readFileSync('src/pages/Configuracion.tsx', 'utf-8');
// The issue was escaping \${theme} in the string. I will replace it using literal strings now.
confContent = confContent.replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/Configuracion.tsx', confContent);
