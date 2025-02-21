import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './components/Home'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import NotFound from './components/NotFound'


function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
