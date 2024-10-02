import React from 'react';
import SearchForm from './components/SearchForm';
import './App.css';

const App = () => {
  return (
    <div className="app">
      <header>
        <nav>
          <div className="logo">Rentiz</div>
          <ul>
            <li className="active">Home</li>
            <li>Properties</li>
            <li>About</li>
            <li>Contact</li>
            <li>Pages</li>
          </ul>
          <div className="auth-buttons">
            <button className="login">Login</button>
            <button className="signup">Sign Up</button>
          </div>
        </nav>
      </header>
      <main>
        <div className="content">
          <h1>Perfect Way To Buy And Sell A Home</h1>
          <p>Diam vitae, nec mattis lectus quam pretium amet facilisis. Urna, massa aliqua dui pellentesque.</p>
          <SearchForm />
        </div>
        <div className="image">
          <img src="/path-to-your-house-image.jpg" alt="Beautiful home" />
        </div>
      </main>
    </div>
  );
};

export default App;
