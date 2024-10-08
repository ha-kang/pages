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
  const today = new Date();
  const ninetyOneDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const fetchCustomerAccounts = async () => {
      try {
        const response = await fetch('https://hakang.cflare.kr/account-list');
        if (!response.ok) throw new Error('Failed to fetch customer accounts');
        const data = await response.json();
        const accountsObject = data.reduce((acc, customer) => {
          acc[customer.name] = customer.accountTag;
          return acc;
        }, {});
        setCustomerAccounts(accountsObject);
      } catch (error) {
        console.error('Error fetching customer accounts:', error);
        setCustomerAccounts({
          '쿠팡': '1d1ca21566108092c27471a6e97b047f',
          '두나무': 'dummy_account_id_for_dunamu',
          '빗썸': 'dummy_account_id_for_bithumb'
        });
      }
    };

    const fetchCustomerZones = async () => {
      try {
        const response = await fetch('https://hakang.cflare.kr/zone-list');
        if (!response.ok) throw new Error('Failed to fetch customer zones');
        const data = await response.json();
        const zonesObject = data.reduce((acc, zone) => {
          acc[zone.name] = zone.id;
          return acc;
        }, {});
        setCustomerZones(zonesObject);
      } catch (error) {
        console.error('Error fetching customer zones:', error);
        setCustomerZones({
          '쿠팡': 'dummy_zone_id_for_coupang',
          '두나무': 'dummy_zone_id_for_dunamu',
          '빗썸': 'dummy_zone_id_for_bithumb'
        });
      }
    };

    const fetchEndpoints = async () => {
      try {
        const response = await fetch('https://hakang.cflare.kr/endpoint-management');
        if (!response.ok) throw new Error('Failed to fetch endpoints');
        const data = await response.json();
        const formattedEndpoints = data.map(endpoint => ({
          value: endpoint.value,
          label: endpoint.label
        }));
        setEndpoints(formattedEndpoints);
      } catch (error) {
        console.error('Error fetching endpoints:', error);
        // Fallback to hardcoded endpoints if API call fails
        setEndpoints([
          { value: 'foundation_dns_queries', label: 'Foundation DNS Queries' },
          { value: 'china_ntw_data_transfer', label: 'China Ntw (data transfer)' },
          { value: 'bot_management_request', label: 'Bot Management Request' },
          { value: 'request', label: 'Request' }
        ]);
      }
    };

    fetchCustomerAccounts();
    fetchCustomerZones();
    fetchEndpoints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || selectedEndpoints.length === 0) {
      alert('시작 기간, 종료 기간, 그리고 최소 하나의 엔드포인트를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setResults(null);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const accountTag = customerAccounts[customer];
    const zoneId = customerZones[customer];

    try {
      const response = await fetch('https://hakang.cflare.kr/endpoint-management', {
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

      const data = await response.json();

      if (data.error) {
        setResults(`오류: ${data.error}`);
      } else {
        setResults(JSON.stringify(data, null, 2));
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
        <Select
          isMulti
          name="endpoints"
          options={endpoints}
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={setSelectedEndpoints}
          placeholder="엔드포인트 선택 (다중 선택 가능)"
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
