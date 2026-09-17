// export default function App() {
//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="glass-card p-8 text-center">
//         <h1 className="text-3xl font-bold text-gradient mb-2">
//           FinFlow
//         </h1>
//         <p className="text-gray-400">
//           Frontend is alive. Next: routing + auth + design system.
//         </p>
//       </div>
//     </div>
//   );
// }

//change
import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useThemeStore } from './store/themeStore';

export default function App() {
  const initTheme = useThemeStore((s) => s.init);
  useEffect(() => { initTheme(); }, [initTheme]);

  return <AppRoutes />;
}