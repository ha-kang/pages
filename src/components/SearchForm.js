import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';
import { formatDate } from '../utils';

const SearchForm = ({ onResultsReceived }) => {
  const [customerAccounts, setCustomerAccounts] = useState({});
  const [customerZones, setCustomerZones] = useState({});
  const [customer, setCustomer] = useState('');
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date();
  const ninetyOneDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const allEndpointsOption = { value: 'all', label: '전체 선택' };

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
      setCustomerZones(data.accountZones || {});
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

  const handleEndpointChange = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedEndpoints([]);
      return;
    }
    if (selectedOptions.some(option => option.value === 'all')) {
      setSelectedEndpoints(endpoints);
    } else {
      setSelectedEndpoints(selectedOptions);
    }
  };

  const getEndpointOptions = () => {
    const allSelected = selectedEndpoints.length === endpoints.length;
    return allSelected ? endpoints : [allEndpointsOption, ...endpoints];
  };

  const handleSubmit = async (e) => {
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', JSON.stringify(data, null, 2));

      if (data && typeof data === 'object') {
        onResultsReceived(data);
      } else {
        throw new Error('Invalid data received from server');
      }
    } catch (error) {
      console.log('Error occurred:', error);
      setError('데이터를 가져오는 중 오류가 발생했습니다.');
      onResultsReceived(null);
    } finally {
      setIsLoading(false);
    }
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
          noOptionsMessage={() => null}
        />
        <div className="date-picker-wrapper">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
            }}
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
    </div>
  );
};

export default SearchForm;
