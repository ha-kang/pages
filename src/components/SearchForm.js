import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';

const SearchForm = ({ onSearchComplete }) => {
  const [customerAccounts, setCustomerAccounts] = useState({});
  const [customerZones, setCustomerZones] = useState({});
  const [customer, setCustomer] = useState('');
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date();
  const ninetyOneDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const allEndpointsOption = useMemo(() => ({ value: 'all', label: '전체 선택' }), []);

  const customerOptions = useMemo(() => 
    Object.keys(customerAccounts).map(name => ({
      value: name,
      label: name
    })), [customerAccounts]
  );

  const fetchData = useCallback(async (url, errorMessage) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(errorMessage, error);
      setError(`${errorMessage} 오류: ${error.message}`);
      return {};
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const accountsData = await fetchData('https://account-list.megazone-cloud---partner-demo-account.workers.dev', '고객사 목록을 불러오는 데 실패했습니다.');
  setCustomerAccounts(accountsData.reduce((acc, customer) => {
        acc[customer.name] = customer.accountTag;
        return acc;
      }, {}));

      const zonesData = await fetchData('https://zone-list.megazone-cloud---partner-demo-account.workers.dev', '고객사 존 목록을 불러오는 데 실패했습니다.');
      setCustomerZones(zonesData.accountZones || {});

      const endpointsData = await fetchData('https://endpoint-management.megazone-cloud---partner-demo-account.workers.dev', '엔드포인트 목록을 불러오는 데 실패했습니다.');
      setEndpoints(endpointsData.map(endpoint => ({
        value: endpoint.value,
        label: endpoint.label
      })));
    };

    fetchInitialData();
  }, [fetchData]);

  const handleEndpointChange = useCallback((selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedEndpoints([]);
    } else if (selectedOptions.some(option => option.value === 'all')) {
      setSelectedEndpoints(endpoints);
    } else {
      setSelectedEndpoints(selectedOptions);
    }
  }, [endpoints]);

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
      if (typeof onSearchComplete === 'function') {
        onSearchComplete(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [customer, startDate, endDate, selectedEndpoints, customerAccounts, customerZones]);


  const renderResult = useCallback((endpoint, result) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Rendering result for ${endpoint}:`, result);
    }

    if (typeof result === 'string') {
      return <span className="result-item">{result}</span>;
    } else if (typeof result === 'object' && result !== null) {
      return Object.entries(result).map(([key, value]) => (
        <span key={key} className="result-item">{value}</span>
      ));
    } else {
      return <span className="result-item">No data available</span>;
    }
  }, []);

  const getEndpointOptions = useCallback(() => {
    const allSelected = selectedEndpoints.length === endpoints.length;
    return allSelected ? endpoints : [allEndpointsOption, ...endpoints];
  }, [selectedEndpoints, endpoints, allEndpointsOption]);

  return (
    <div className="search-form-container">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="search-form">
        <Select
          options={customerOptions}
          onChange={(selectedOption) => setCustomer(selectedOption ? selectedOption.value : '')}
          placeholder="고객사"
          className="basic-select"
          classNamePrefix="select"
        />
        <Select
          isMulti
          name="endpoints"
          options={getEndpointOptions()}
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={handleEndpointChange}
          value={selectedEndpoints}
          placeholder="엔드포인트 선택 (다중 선택 가능)"
          closeMenuOnSelect={false}
        />
        <div className="date-picker-wrapper">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            minDate={ninetyOneDaysAgo}
            maxDate={today}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD ~ YYYY-MM-DD"
            className="date-picker"
          />
        </div>
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? '로딩 중...' : '검색'}
        </button>
      </form>
      {results && (
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
      )}
    </div>
  );
};

// Utility functions
const formatDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default React.memo(SearchForm);
