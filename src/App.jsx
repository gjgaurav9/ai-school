import { useState } from 'react'
import HomeScreen from './components/screens/HomeScreen'
import WelcomeScreen from './components/screens/WelcomeScreen'
import MoodMirror from './components/games/MoodMirror'
import ColorFeelings from './components/games/ColorFeelings'
import GuddusDay from './components/games/GuddusDay'
import AnimalFriends from './components/games/AnimalFriends'
import SoundSafari from './components/games/SoundSafari'
import ShapeWorld from './components/games/ShapeWorld'
import KindnessSeeds from './components/games/KindnessSeeds'
import DoctorGame from './components/games/DoctorGame'
import { useProgress } from './hooks/useProgress'

const GAME_COMPONENTS = {
  'mood-mirror': MoodMirror,
  'color-feelings': ColorFeelings,
  'guddus-day': GuddusDay,
  'animal-friends': AnimalFriends,
  'sound-safari': SoundSafari,
  'shape-world': ShapeWorld,
  'kindness-seeds': KindnessSeeds,
  'doctor-game': DoctorGame,
}

function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [language, setLanguage] = useState('en')
  const { progress, completeGame, setChildName } = useProgress()

  const childName = progress.childName

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'))
  }

  // Show welcome screen if no name set yet
  if (!childName) {
    return (
      <WelcomeScreen
        onSubmit={(name) => setChildName(name)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />
    )
  }

  if (currentScreen === 'home') {
    return (
      <HomeScreen
        onSelectGame={(gameId) => setCurrentScreen(gameId)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        stars={progress.stars}
        childName={childName}
      />
    )
  }

  const GameComponent = GAME_COMPONENTS[currentScreen]

  if (!GameComponent) {
    setCurrentScreen('home')
    return null
  }

  return (
    <GameComponent
      onComplete={(data) => {
        completeGame(currentScreen, data)
        setCurrentScreen('home')
      }}
      onBack={() => setCurrentScreen('home')}
      language={language}
      childName={childName}
    />
  )
}

export default App
