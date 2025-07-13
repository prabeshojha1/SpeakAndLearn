import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QuizProvider } from "./context/QuizContext";
import { SupabaseProvider } from "./context/SupabaseContext";
import MainLayout from "./components/MainLayout";
import { GameProvider } from './context/GameContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SpeakAndLearn",
  description: "Learn languages through interactive quizzes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <QuizProvider>
            <GameProvider> 
              <MainLayout>{children}</MainLayout>
            </GameProvider>
          </QuizProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}