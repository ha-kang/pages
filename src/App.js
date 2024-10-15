import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import './styles/App.css';
import cloudflareImage from './images/cloudflare.png';

const App = () => {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchComplete = (results) => {
    setSearchResults(results);
  };

  return (
    <div className="app">
      <header>
        <h1>Cloudflare API</h1>
        <p>API를 조회할 고객사, 엔드포인트, 기간을 선택하세요.</p>
      </header>
      <main>
        <div className="content">
          <SearchForm onSearchComplete={handleSearchComplete} />
        </div>
        <div className="image-container">
          <img src={cloudflareImage} alt="Cloudflare logo" />
        </div>
      </main>
      {searchResults && (
        <section className="results-section">
          <h2>검색 결과</h2>
          <div className="results-container">
            {Object.entries(searchResults).map(([endpoint, result]) => (
              <div key={endpoint} className="result-item">
                <h3>{endpoint}</h3>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default App;
