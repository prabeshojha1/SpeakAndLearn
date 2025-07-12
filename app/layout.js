import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QuizProvider } from "./context/QuizContext";
import { SupabaseProvider } from "./context/SupabaseContext";

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
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </QuizProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
