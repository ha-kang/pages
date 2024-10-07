import React from 'react';
import SearchForm from './components/SearchForm';
import './styles/App.css';
import cloudflareImage from './images/cloudflare.png';

const App = () => {
  return (
    <div className="app">
      <main>
        <div className="content">
          <h1>Cloudflare API</h1>
          <p>API를 조회할 고객사, 엔드포인트, 기간을 선택하세요.</p>
          <SearchForm />
        </div>
        <div className="image">
          <img src={cloudflareImage} alt="Cloudflare logo" />
        </div>
      </main>
    </div>
  );
};

export default App;
