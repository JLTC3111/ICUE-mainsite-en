import { Link } from 'react-router-dom';
import './Navbar.css'; // optional

const Navbar = () => (
  <nav className="navbar">
    <Link to="/">🏠 Home</Link>
    <Link to="/article">📰 Article</Link>
    <Link to="/contact">📞 Contact</Link>
  </nav>
);

export default Navbar;