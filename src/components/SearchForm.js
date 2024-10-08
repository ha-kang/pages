import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SearchForm = () => {
  const [customerAccounts, setCustomerAccounts] = useState({});
  const [customerZones, setCustomerZones] = useState({});
  const [customer, setCustomer] = useState('');
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date();
  const ninetyOneDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCustomerAccounts();
        await fetchCustomerZones();
        await fetchEndpoints();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('초기 데이터를 불러오는 데 실패했습니다. 페이지를 새로고침해 주세요.');
      }
    };

    fetchData();
  }, []);

  
  const fetchCustomerAccounts = async () => {
    try {
      const response = await fetch('https://account-list.megazone-cloud---partner-demo-account.workers.dev');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const accountsObject = data.reduce((acc, customer) => {
        acc[customer.name] = customer.accountTag;
        return acc;
      }, {});
      setCustomerAccounts(accountsObject);
    } catch (error) {
      console.error('Error fetching customer accounts:', error);
      setError('고객사 목록을 불러오는 데 실패했습니다.');
      setCustomerAccounts({});
    }
  };

  const fetchCustomerZones = async () => {
    try {
      const response = await fetch('https://zone-list.megazone-cloud---partner-demo-account.workers.dev');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received zone data:', data); // 데이터 구조 확인

      // accountZones 객체를 그대로 사용
      setCustomerZones(data.accountZones || {});
      
      console.log(`Total number of zones: ${data.totalZones}`);
    } catch (error) {
      console.error('Error fetching customer zones:', error);
      setError(`고객사 존 목록을 불러오는 데 실패했습니다. 오류: ${error.message}`);
      setCustomerZones({});
    }
  };

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('https://endpoint-management.megazone-cloud---partner-demo-account.workers.dev');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedEndpoints = data.map(endpoint => ({
        value: endpoint.value,
        label: endpoint.label
      }));
      setEndpoints(formattedEndpoints);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      setError('엔드포인트 목록을 불러오는 데 실패했습니다.');
      setEndpoints([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer || !startDate || !endDate || selectedEndpoints.length === 0) {
      setError('고객사, 시작 기간, 종료 기간, 그리고 최소 하나의 엔드포인트를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setResults(null);
    setError(null);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const accountTag = customerAccounts[customer];
    const zoneId = customerZones[customer] ? Object.values(customerZones[customer])[0] : null;

    if (!zoneId) {
      setError('선택된 고객사에 대한 zone ID를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://endpoint-management.megazone-cloud---partner-demo-account.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountTag,
          zoneId,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          endpoints: selectedEndpoints.map(e => e.value)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('데이터 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };


  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '48px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '15px',
    }),
    placeholder: (provided) => ({
      ...provided,
      margin: '0',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0',
      opacity: 0,  // 커서를 완전히 숨김
    }),
  };

  const customerOptions = Object.keys(customerAccounts).map(name => ({
    value: name,
    label: name
  }));

  return (
    <div className="search-form-container">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="search-form">
        <Select
          options={customerOptions}
          onChange={(selectedOption) => setCustomer(selectedOption.value)}
          placeholder="고객사"
          className="basic-select"
          classNamePrefix="select"
          styles={customStyles}
        />
        <Select
          isMulti
          name="endpoints"
          options={endpoints}
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={setSelectedEndpoints}
          placeholder="엔드포인트 선택 (다중 선택 가능)"
          styles={customStyles}
        />
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
