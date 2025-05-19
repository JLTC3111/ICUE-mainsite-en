import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Article from './pages/Article';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/article" element={<Article />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;