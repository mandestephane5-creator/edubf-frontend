import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Sainte Marie — EduBF",
  description: "Plateforme de gestion scolaire de l'école Sainte Marie",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans bg-bg text-ink antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
