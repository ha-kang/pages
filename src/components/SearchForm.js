import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';

// 유틸리티 함수
const formatDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatBytes = (bytes) => {
  if (bytes === 0 || bytes === undefined) return '0 B';
  const k = 1000;
  const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (number) => {
  if (number === undefined || number === null) return 'N/A';
  if (typeof number === 'string') return number;
  return number.toLocaleString();
};

const formatMinutesToK = (minutes) => {
  if (minutes === undefined || minutes === null) return 'N/A';
  const kValue = minutes / 1000;
  return kValue < 1 ? `${kValue.toFixed(3)}k` : `${kValue.toFixed(2)}k`;
};

const formatImagesTransformations = (number) => {
  if (number === undefined || number === null) return 'N/A';
  if (typeof number === 'string') return number;
  const kValue = number / 1000;
  return kValue < 1 ? `${kValue.toFixed(3)}k` : `${kValue.toFixed(2)}k`;
};

const formatCPUTime = (microseconds) => {
  if (microseconds === undefined || microseconds === null) return 'N/A';
  const milliseconds = microseconds / 1000;
  return `${(milliseconds / 1000000).toFixed(2)}MM ms`;
};

// 메인 컴포넌트
const SearchForm = () => {
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
  const allEndpointsOption = { value: 'all', label: '전체 선택' };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchCustomerAccounts(),
          fetchCustomerZones(),
          fetchEndpoints()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('초기 데이터를 불러오는 데 실패했습니다. 페이지를 새로고침해 주세요.');
      }
    };

    fetchInitialData();
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
      const response = await fetch('https://optimization.megazone-cloud---partner-demo-account.workers.dev');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEndpoints(data);
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

  const getEndpointOptions = useCallback(() => {
    const allSelected = selectedEndpoints.length === endpoints.length;
    return allSelected ? endpoints : [allEndpointsOption, ...endpoints];
  }, [selectedEndpoints, endpoints]);

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
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('결과를 불러오는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = (endpoint, result) => {
    console.log(`Rendering result for ${endpoint}:`, result);

    switch (endpoint) {
      case 'ent_zone':
        if (result && typeof result.maximum !== 'undefined' && typeof result.current !== 'undefined') {
          return (
            <span className="result-item">
              Ent Zone: 최대 {result.maximum} 개, 현재 사용중인 존 갯수 {result.current} 개
            </span>
          );
        }
        break;
      
      case 'data_transfer_request':
        if (result && typeof result.totalBytes !== 'undefined' && typeof result.totalRequests !== 'undefined') {
          return (
            <>
              <span className="result-item">Data Transferred: {formatBytes(result.totalBytes)}</span>
              <span className="result-item">Total Requests: {formatNumber(result.totalRequests)}</span>
            </>
          );
        }
        break;
      
    case 'bot_management_request':
      if (result && result.message) {
        return <span className="result-item">Bot management(Likely Human): {result.message}</span>;
      } else if (result && typeof result.totalLikelyHuman !== 'undefined') {
        return <span className="result-item">Bot management(Likely Human): {formatNumber(result.totalLikelyHuman)}</span>;
      } else {
        return <span className="result-item">Bot management(Likely Human): No data available</span>;
      }
        break;
      
      case 'foundation_dns_queries':
        if (result && result.summary && typeof result.summary.totalQueryCount !== 'undefined') {
          return <span className="result-item">Foundation DNS Queries: {formatNumber(result.summary.totalQueryCount)}</span>;
        }
        break;
      
      case 'workers_kv_read':
        if (result && typeof result.reads !== 'undefined') {
          return <span className="result-item">Workers KV - Read: {formatNumber(result.reads)}</span>;
        }
        break;

      case 'workers_kv_storage':
        if (result && typeof result.storage !== 'undefined') {
          return <span className="result-item">Workers KV - Storage: {formatBytes(result.storage)}</span>;
        }
        break;

      case 'workers_kv_write_list_delete':
        if (result && typeof result.writes !== 'undefined' && typeof result.lists !== 'undefined' && typeof result.deletes !== 'undefined') {
          const totalRequests = result.writes + result.lists + result.deletes;
          return (
            <span className="result-item">
              Workers KV - Write/List/Delete: {formatNumber(totalRequests)}
              <br />
              * Write: {formatNumber(result.writes)}, List: {formatNumber(result.lists)}, Delete: {formatNumber(result.deletes)}
            </span>
          );
        }
        break;
      
      case 'workers_std_requests':
        if (result && typeof result.totalStandardRequests !== 'undefined') {
          return <span className="result-item">Workers STD Requests: {formatNumber(result.totalStandardRequests)}</span>;
        }
        break;
      
      case 'workers_std_cpu':
        if (result && typeof result.totalStandardCPUTime !== 'undefined') {
          return <span className="result-item">Workers STD CPU: {formatCPUTime(result.totalStandardCPUTime)}</span>;
        }
        break;
      
      case 'stream_minutes_viewed':
        if (result && typeof result.totalMinutesViewed !== 'undefined') {
          return <span className="result-item">Stream Minutes Viewed: {formatMinutesToK(result.totalMinutesViewed)}</span>;
        }
        break;
      
      case 'images_unique_transformations':
        if (result && typeof result.totalUniqueTransformations !== 'undefined') {
          return <span className="result-item">Images Unique Transformations: {formatImagesTransformations(result.totalUniqueTransformations)}</span>;
        }
        break;

      case 'data_transfer_by_country':
        if (Array.isArray(result)) {
          return <span className="result-item">Data Transfer by Country: <button onClick={() => downloadCSV(result)}>Download CSV</button></span>;
        }
        break;

      case 'china_ntw_data_transfer':
        if (result && typeof result.totalEdgeResponseBytes !== 'undefined') {
          return <span className="result-item">China NTW Data Transfer: {formatBytes(result.totalEdgeResponseBytes)}</span>;
        }
        break;

    case 'stream_minutes_viewed':
      if (result && typeof result.totalMinutesViewed !== 'undefined') {
        return <span className="result-item">Stream Minutes Viewed: {formatMinutesToK(result.totalMinutesViewed)}</span>;
      } else {
        return <span className="result-item">Stream Minutes Viewed: No data available</span>;
      }

    case 'images_unique_transformations':
      if (result && typeof result.totalUniqueTransformations !== 'undefined') {
        return <span className="result-item">Images Unique Transformations: {formatImagesTransformations(result.totalUniqueTransformations)}</span>;
      } else {
        return <span className="result-item">Images Unique Transformations: No data available</span>;
      }

    case 'data_transfer_by_country':
      if (Array.isArray(result)) {
        return <span className="result-item">Data Transfer by Country: <button onClick={() => downloadCSV(result)}>Download CSV</button></span>;
      } else {
        return <span className="result-item">Data Transfer by Country: No data available</span>;
      }

    case 'china_ntw_data_transfer':
      if (result && typeof result.totalEdgeResponseBytes !== 'undefined') {
        return <span className="result-item">China NTW Data Transfer: {formatBytes(result.totalEdgeResponseBytes)}</span>;
      } else {
        return <span className="result-item">China NTW Data Transfer: No data available</span>;
      }

    default:
      return <pre className="result-item">{JSON.stringify(result, null, 2)}</pre>;
  }
};

const downloadCSV = (data) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Country,Bytes,Formatted Bytes,Requests,Formatted Requests\n";

  data.forEach(({ country, bytes, requests }) => {
    csvContent += `${country},${bytes},"${formatBytes(bytes)}",${requests},"${formatNumber(requests)}"\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "data_transfer_by_country.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    {results && typeof results === 'object' && Object.keys(results).length > 0 && (
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

export default SearchForm;
