import React from 'react';
import SearchForm from './components/SearchForm';

const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Cloudflare API 검색</h1>
      <SearchForm />
    </div>
  );
};

export default App;
