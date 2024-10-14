import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/SearchForm.css';

const formatDate = (date) => {
  if (!date) return '';
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
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date();
  const ninetyOneDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const allEndpointsOption = { value: 'all', label: '전체 선택' };
  

  const formatBytes = (bytes) => {
    if (bytes === 0 || bytes === undefined) return '0 B';
    const k = 1000;
    const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const convertedValue = (bytes / Math.pow(k, i)).toFixed(2);
    return `${convertedValue} ${sizes[i]} (${bytes})`;
  };
  
const formatNumber = (number) => {
  if (number === undefined || number === null) return 'N/A';
  if (typeof number === 'string') return number; // Handle error messages
  if (number >= 1000000) {
    const millions = number / 1000000;
    return `${millions.toFixed(2)}MM (${number.toLocaleString()})`;
  }
  return number.toLocaleString();
};

const formatImagesTransformations = (number) => {
  if (number === undefined || number === null) return 'N/A';
  if (typeof number === 'string') return number; // Handle error messages
  
  const kValue = number / 1000;
  if (kValue < 1) {
    // 1000 미만의 값은 소수점 세 자리까지 표시
    return `${kValue.toFixed(3)}k (${number})`;
  } else {
    // 1000 이상의 값은 소수점 두 자리까지 표시
    return `${kValue.toFixed(2)}k (${number})`;
  }
};

const formatStreamMinutes = (minutes) => {
  if (minutes === undefined || minutes === null) return 'N/A';
  if (typeof minutes === 'string') return minutes; // Handle error messages
  
  const kValue = minutes / 1000;
  if (kValue < 1) {
    // 1000 미만의 값은 소수점 세 자리까지 표시
    return `${kValue.toFixed(3)}k (${minutes.toLocaleString()})`;
  } else {
    // 1000 이상의 값은 소수점 두 자리까지 표시
    return `${kValue.toFixed(2)}k (${minutes.toLocaleString()})`;
  }
};
  
const formatCPUTime = (microseconds) => {
  if (microseconds === undefined || microseconds === null) return 'N/A';
  const milliseconds = microseconds / 1000; // 마이크로초를 밀리초로 변환
  const millions = milliseconds / 1000000; // 밀리초를 밀리언 단위로 변환
  return `${millions.toFixed(2)}MM ms (${milliseconds.toLocaleString()} ms)`;
};
  
const renderResult = (endpoint, result) => {
  console.log(`Rendering result for ${endpoint}:`, result); // 디버깅을 위한 로그

  switch (endpoint) {
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
      if (result && typeof result.totalLikelyHuman !== 'undefined') {
        return <span className="result-item">Bot management(Likely Human): {formatNumber(result.totalLikelyHuman)}</span>;
      }
      break;
      
    case 'foundation_dns_queries':
      if (result && result.summary && typeof result.summary.totalQueryCount !== 'undefined') {
        return <span className="result-item">Foundation DNS Queries: {formatNumber(result.summary.totalQueryCount)}</span>;
      }
      break;
      
    case 'workers_kv_read':
    case 'workers_kv_storage':
    case 'workers_kv_write_list_delete':
      if (result && result.data && result.data.viewer && result.data.viewer.accounts && result.data.viewer.accounts.length > 0) {
        const account = result.data.viewer.accounts[0];
        if (endpoint === 'workers_kv_read') {
          const readRequests = account.reads[0]?.sum.requests || 0;
          return <span className="result-item">Workers KV - Read: {formatNumber(readRequests)}</span>;
        } else if (endpoint === 'workers_kv_storage') {
          const storageBytes = account.storage[0]?.max.byteCount || 0;
          return <span className="result-item">Workers KV - Storage: {formatBytes(storageBytes)}</span>;
        } else if (endpoint === 'workers_kv_write_list_delete') {
          const writeRequests = account.writes[0]?.sum.requests || 0;
          const listRequests = account.lists[0]?.sum.requests || 0;
          const deleteRequests = account.deletes[0]?.sum.requests || 0;
          const totalRequests = writeRequests + listRequests + deleteRequests;
          return (
            <span className="result-item">
              Workers KV - Write/List/Delete: {formatNumber(totalRequests)}
              <br />
              * Write: {formatNumber(writeRequests)}, List: {formatNumber(listRequests)}, Delete: {formatNumber(deleteRequests)}
            </span>
          );
        }
      }
      break;
      
    case 'workers_std_requests':
      if (result && result.data && result.data.viewer && result.data.viewer.accounts) {
        const standardRequests = result.data.viewer.accounts[0].workersInvocationsAdaptive
          .find(item => item.dimensions.usageModel === "standard")?.sum.Standatd_request || 0;
        return <span className="result-item">Workers STD Requests: {formatNumber(standardRequests)}</span>;
      }
      break;
      
    case 'workers_std_cpu':
      if (result && result.data && result.data.viewer && result.data.viewer.accounts) {
        const standardCPU = result.data.viewer.accounts[0].workersOverviewRequestsAdaptiveGroups
          .find(item => item.dimensions.usageModel === 2)?.sum.CPU_Time || 0;
        return <span className="result-item">Workers STD CPU: {formatCPUTime(standardCPU)}</span>;
      }
      break;
      
    case 'stream_minutes_viewed':
      if (result && result.data && result.data.viewer && result.data.viewer.accounts && result.data.viewer.accounts[0].Total) {
        const minutesViewed = result.data.viewer.accounts[0].Total[0]?.sum.minutesViewed || 0;
        return <span className="result-item">Stream Minutes Viewed: {formatStreamMinutes(minutesViewed)}</span>;
      }
      break;
      
    case 'images_unique_transformations':
      if (result && result.data && result.data.viewer && result.data.viewer.accounts && result.data.viewer.accounts[0].imagesUniqueTransformations) {
        const transformations = result.data.viewer.accounts[0].imagesUniqueTransformations.reduce((sum, item) => sum + item.transformations, 0);
        return <span className="result-item">Images Unique Transformations: {formatImagesTransformations(transformations)}</span>;
      }
      break;
      
    case 'china_ntw_data_transfer':
      if (Array.isArray(result)) {
        console.log('China NTW Data Transfer results:', result);
        let totalBytes = 0;
        result.forEach(zoneData => {
          if (Array.isArray(zoneData.result)) {
            zoneData.result.forEach(innerResult => {
              const edgeResponseBytes = innerResult.result?.data?.viewer?.zones[0]?.httpRequestsAdaptiveGroups[0]?.sum?.edgeResponseBytes;
              if (typeof edgeResponseBytes === 'number') {
                totalBytes += edgeResponseBytes;
              }
            });
          }
        });
        return (
          <span className="result-item">
            China NTW Data Transfer: {formatBytes(totalBytes)}
          </span>
        );
      }
      return <span className="result-item">China NTW Data Transfer: No data available</span>;


    default:
      // 기본적으로 결과를 JSON 문자열로 표시
      return <pre className="result-item">{JSON.stringify(result, null, 2)}</pre>;
  }

  // 위의 조건에 해당하지 않는 경우, 원본 데이터를 JSON 형식으로 표시
  return <pre className="result-item">{JSON.stringify(result, null, 2)}</pre>;
};


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
    if (!selectedOptions) {
      setSelectedEndpoints([]);
      return;
    }
    if (selectedOptions.some(option => option.value === 'all')) {
      // '전체 선택'이 선택되면 모든 엔드포인트를 선택하되, '전체 선택' 옵션은 제외
      setSelectedEndpoints(endpoints);
    } else {
      setSelectedEndpoints(selectedOptions);
    }
  };

  // 엔드포인트 옵션 생성 함수
  const getEndpointOptions = () => {
    const allSelected = selectedEndpoints.length === endpoints.length;
    return allSelected ? endpoints : [allEndpointsOption, ...endpoints];
  };
    // 모든 엔드포인트가 선택되지 않았을 때만 '전체 선택' 옵션 포함
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
    console.log('Sending request with:', { accountTag, customer, formattedStartDate, formattedEndDate, endpoints: selectedEndpoints.map(e => e.value), zoneIds });
    
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
      setResults(data);
    } else {
      throw new Error('Invalid data received from server');
    }
  } catch (error) {
    console.log('Error occurred, but continuing with available data');
    setResults({}); // 에러 발생 시 빈 객체로 설정
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
          noOptionsMessage={() => null} // "No options" 메시지 제거

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
