import React from 'react';
import SearchForm from './components/SearchForm';
import './styles/App.css';

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
          <h1>Cloudflare API Query</h1>
          <p>API를 조회할 고객사, 엔드포인트, 기간을 선택하세요.</p>
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
