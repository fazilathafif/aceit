import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { GameProvider } from './context/GameContext';
import { RevisionProvider } from './context/RevisionContext';
import { ModeProvider } from './context/ModeContext';
import HomeScreen from './screens/HomeScreen';
import SetupScreen from './screens/SetupScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ArenaScreen from './screens/ArenaScreen';
import StatsScreen from './screens/StatsScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import DailyChallengeScreen from './screens/DailyChallengeScreen';
import SpeedRoundScreen from './screens/SpeedRoundScreen';
import DuelScreen from './screens/DuelScreen';
import MockTestScreen from './screens/MockTestScreen';
import MockResultScreen from './screens/MockResultScreen';
import StudyPathScreen from './screens/StudyPathScreen';
import SocialScreen from './screens/SocialScreen';
import ConceptsScreen from './screens/ConceptsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AITutor from './components/AITutor';
import { useState } from 'react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function TutorPage() {
  const [open, setOpen] = useState(true);
  return open ? (
    <AITutor topic="General" wrongQuestions={[]} onClose={() => setOpen(false)} />
  ) : (
    <Navigate to="/" replace />
  );
}

function QuizGuard() {
  const { state } = useQuiz();
  if (state.status === 'complete') return <Navigate to="/results" replace />;
  if (!state.config) return <Navigate to="/setup" replace />;
  return <QuizScreen />;
}

function AppWithGame() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return (
    <ModeProvider userId={userId}>
      <GameProvider userId={userId}>
        <RevisionProvider userId={userId}>
        <BrowserRouter>
          <div className="dark font-sans antialiased">
            <Routes>
              <Route path="/login"      element={<LoginScreen />} />
              <Route path="/register"   element={<RegisterScreen />} />

              <Route path="/"           element={<RequireAuth><HomeScreen /></RequireAuth>} />
              <Route path="/arena"      element={<RequireAuth><ArenaScreen /></RequireAuth>} />
              <Route path="/setup"      element={<RequireAuth><SetupScreen /></RequireAuth>} />
              <Route path="/quiz"       element={<RequireAuth><QuizGuard /></RequireAuth>} />
              <Route path="/results"    element={<RequireAuth><ResultsScreen /></RequireAuth>} />
              <Route path="/profile"    element={<RequireAuth><ProfileScreen /></RequireAuth>} />
              <Route path="/stats"      element={<RequireAuth><StatsScreen /></RequireAuth>} />
              <Route path="/flashcards" element={<RequireAuth><FlashcardScreen /></RequireAuth>} />
              <Route path="/daily"      element={<RequireAuth><DailyChallengeScreen /></RequireAuth>} />
              <Route path="/speed"      element={<RequireAuth><SpeedRoundScreen /></RequireAuth>} />
              <Route path="/duel"         element={<RequireAuth><DuelScreen /></RequireAuth>} />
              <Route path="/mock"         element={<RequireAuth><MockTestScreen /></RequireAuth>} />
              <Route path="/mock-results" element={<RequireAuth><MockResultScreen /></RequireAuth>} />
              <Route path="/studypath"    element={<RequireAuth><StudyPathScreen /></RequireAuth>} />
              <Route path="/social"       element={<RequireAuth><SocialScreen /></RequireAuth>} />
              <Route path="/concepts"     element={<RequireAuth><ConceptsScreen /></RequireAuth>} />
              <Route path="/tutor"        element={<RequireAuth><TutorPage /></RequireAuth>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </RevisionProvider>
    </GameProvider>
    </ModeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <AppWithGame />
      </QuizProvider>
    </AuthProvider>
  );
}
