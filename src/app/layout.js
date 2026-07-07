import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Orivex — Gestion scolaire",
  description: "Orivex, la plateforme de gestion scolaire complète",
};

// Applique la classe .dark AVANT le premier rendu (évite un flash clair→sombre
// au chargement si l'utilisateur avait déjà choisi le mode sombre).
const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('orivex_theme_preference');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = saved ? saved === 'dark' : prefersDark;
      if (isDark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} font-sans bg-bg text-ink antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
