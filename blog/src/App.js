import {HashRouter,Route,Routes} from 'react-router-dom';
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

function App() {
  return(
    <HashRouter>
      <div className = "App">
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="signin" element={<Signin />} />
            <Route path="signup" element={<Signup />} />
            <Route path="/profile/:userId" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
