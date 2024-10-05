import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';

const customerAccounts = {
  '쿠팡': '1d1ca21566108092c27471a6e97b047f',
  '두나무': 'dummy_account_id_for_dunamu',
  '빗썸': 'dummy_account_id_for_bithumb'
};

const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
  return (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + sizes[i];
};

const formatMillions = (num) => (num / 1000000).toFixed(2) + 'M';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatSeconds = (seconds) => {
  const days = Math.floor(seconds / (24 * 3600));
  return `${days}일`;
};

const SearchForm = () => {
  const [customer, setCustomer] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date();
  const ninetyOneDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('시작 기간과 종료 기간을 모두 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setResults(null);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const accountTag = customerAccounts[customer];

    try {
      const response = await fetch('https://hakang.cflare.kr/pages-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountTag, startDate: formattedStartDate, endDate: formattedEndDate, endpoint }),
      });

      const data = await response.json();

      if (data.errors && data.errors.length > 0) {
        const errorMessage = data.errors[0].message;
        if (typeof errorMessage === 'string' && errorMessage.includes("query time range is too large")) {
          const match = errorMessage.match(/Time range can't be wider than (\d+)s, but it's (\d+)s/);
          if (match) {
            const [, maxSeconds, actualSeconds] = match;
            const maxDays = formatSeconds(parseInt(maxSeconds));
            const actualDays = formatSeconds(parseInt(actualSeconds));
            setResults(`조회 가능한 최대 기간은 ${maxDays}입니다. 현재 선택된 기간은 ${actualDays}입니다. 조회 기간을 줄여주세요.`);
          } else {
            setResults(`조회 기간이 너무 깁니다. 더 짧은 기간을 선택해주세요.`);
          }
        } else {
          setResults(`오류: ${errorMessage}`);
        }
      } else if (data.data?.viewer?.accounts[0]?.httpRequestsOverviewAdaptiveGroups[0]) {
        const { bytes, requests } = data.data.viewer.accounts[0].httpRequestsOverviewAdaptiveGroups[0].sum;
        setResults(`Data Transfer: ${formatBytes(bytes)} (${bytes} bytes)\nRequest: ${formatMillions(requests)} (${requests})`);
      } else {
        setResults('데이터를 찾을 수 없습니다. 다른 기간이나 엔드포인트를 선택해보세요.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setResults('데이터 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="search-form">
        <select value={customer} onChange={(e) => setCustomer(e.target.value)} required>
          <option value="">고객사</option>
          {Object.keys(customerAccounts).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} required>
          <option value="">Endpoint</option>
          <option value="DT/Request">DT/Request</option>
          <option value="zone list">zone list</option>
          <option value="zone setting">zone setting</option>
        </select>
        <div className="date-picker-container">
          <div className="date-picker-wrapper">
            <label>시작 기간</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={ninetyOneDaysAgo}
              maxDate={today}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="date-picker"
            />
          </div>
          <div className="date-picker-wrapper">
            <label>종료 기간</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || ninetyOneDaysAgo}
              maxDate={today}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="date-picker"
            />
          </div>
        </div>
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? '로딩 중...' : '검색'}
        </button>
      </form>
      {results && (
        <div className="results">
          <h2>결과</h2>
          <pre>{results}</pre>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
