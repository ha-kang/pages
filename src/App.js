import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';

const SearchForm = ({ onSearchComplete }) => {
  // ... (이전 상태 및 useEffect 코드는 그대로 유지)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!customer || !startDate || !endDate || selectedEndpoints.length === 0) {
      setError('고객사, 시작 기간, 종료 기간, 그리고 최소 하나의 엔드포인트를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const accountTag = customerAccounts[customer];
    const zoneIds = customerZones[customer] ? Object.values(customerZones[customer]) : [];

    try {
      const response = await fetch('https://endpoint-management.megazone-cloud---partner-demo-account.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountTag,
          customerName: customer,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          endpoints: selectedEndpoints.map(e => e.value),
          zoneIds
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setResults(data);
      onSearchComplete(data);  // 부모 컴포넌트에 결과 전달
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [customer, startDate, endDate, selectedEndpoints, customerAccounts, customerZones, onSearchComplete]);

  // ... (나머지 코드는 그대로 유지)

  return (
    <div className="search-form-container">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="search-form">
        {/* ... (기존 폼 요소들) */}
      </form>
      {/* 결과 렌더링 부분 제거 */}
    </div>
  );
};

export default React.memo(SearchForm);
