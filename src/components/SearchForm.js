import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';

const SearchForm = () => {
  const [customer, setCustomer] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);

    if (!startDate || !endDate) {
      alert('시작 기간과 종료 기간을 모두 선택해주세요.');
      setIsLoading(false);
      return;
    }

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    try {
      if (customer === '쿠팡') {
        const response = await fetch('https://hakang.cflare.kr/coupang-usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start: formattedStartDate,
            end: formattedEndDate,
            customer,
            endpoint
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.text();
        setResults(data);
      } else {
        setResults(`${customer}에 대한 API 요청은 아직 구현되지 않았습니다.`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setResults('데이터 조회 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
        <select value={customer} onChange={(e) => setCustomer(e.target.value)} required>
          <option value="">고객사</option>
          <option value="쿠팡">쿠팡</option>
          <option value="두나무">두나무</option>
          <option value="빗썸">빗썸</option>
        </select>
        <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} required>
          <option value="">Endpoint</option>
          <option value="Ent available zone">Ent available zone</option>
          <option value="zone list">zone list</option>
          <option value="zone setting">zone setting</option>
        </select>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="시작 기간"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="종료 기간"
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }} disabled={isLoading}>
          {isLoading ? '로딩 중...' : '검색'}
        </button>
      </form>
      {results && (
        <div style={{ marginTop: '20px', maxWidth: '600px', margin: '20px auto' }}>
          <h2>결과:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{results}</pre>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
