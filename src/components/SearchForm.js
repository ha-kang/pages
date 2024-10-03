import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';


const SearchForm = () => {
  const [customer, setCustomer] = useState('');
  const [accountZone, setAccountZone] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Search params:', { customer, accountZone, endpoint, startDate, endDate });
    // 여기에 실제 검색 로직 구현
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
      <select value={customer} onChange={(e) => setCustomer(e.target.value)} required>
        <option value="">고객사 선택</option>
        <option value="쿠팡">쿠팡</option>
        <option value="두나무">두나무</option>
        <option value="빗썸">빗썸</option>
      </select>

      <select value={accountZone} onChange={(e) => setAccountZone(e.target.value)} required>
        <option value="">Account/zone 선택</option>
        <option value="Account">Account</option>
        <option value="Zone">Zone</option>
      </select>

      <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} required>
        <option value="">조회 엔드포인트 선택</option>
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

      <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>검색</button>
    </form>
  );
};

export default SearchForm;
