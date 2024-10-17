import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import './styles/App.css';
import cloudflareImage from './images/cloudflare.png';

const App = () => {
  const [results, setResults] = useState(null);

  return (
    <div className="app">
      <main>
        <div className="content">
          <h1>Cloudflare API</h1>
          <p>API를 조회할 고객사, 엔드포인트, 기간을 선택하세요.</p>
          <SearchForm onResultsReceived={setResults} />
        </div>
        <div className="image">
          {results ? (
            <div className="results-container">
              <h2 className="results-title">결과</h2>
              <div className="results-box">
                <div className="endpoint-results">
                  {Object.entries(results).map(([endpoint, result]) => (
                    <div key={endpoint} className="result-group">
                      {renderResult(endpoint, result)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <img src={cloudflareImage} alt="Cloudflare logo" />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
