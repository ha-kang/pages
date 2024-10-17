import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import './styles/App.css';
import cloudflareImage from './images/cloudflare.png';
import { 
  formatBytes, 
  formatNumber, 
  formatMinutesToK, 
  formatImagesTransformations, 
  formatStreamMinutes, 
  formatCPUTime 
} from './utils';

const DataTransferDownload = ({ data }) => {
  const downloadCSV = () => {
    const countryData = data.reduce((acc, item) => {
      if (!acc[item.country]) {
        acc[item.country] = { bytes: 0, requests: 0 };
      }
      acc[item.country].bytes += item.bytes;
      acc[item.country].requests += item.requests;
      return acc;
    }, {});

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Country,Bytes,Formatted Bytes,Requests,Formatted Requests\n";

    Object.entries(countryData).forEach(([country, stats]) => {
      csvContent += `${country},${stats.bytes},"${formatBytes(stats.bytes)}",${stats.requests},"${formatNumber(stats.requests)}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_transfer_by_country.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="data-transfer-download result-item">
      <span>Data Transfer by Country: </span>
      <button className="download-button" onClick={downloadCSV}>Download CSV</button>
    </div>
  );
};

const App = () => {
  const [results, setResults] = useState(null);

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
        if (result && Array.isArray(result)) {
          let totalLikelyHuman = 0;
          result.forEach(zoneResult => {
            if (zoneResult.result && zoneResult.result.data && zoneResult.result.data.viewer && zoneResult.result.data.viewer.zones) {
              zoneResult.result.data.viewer.zones.forEach(zone => {
                if (zone.likely_human && zone.likely_human.length > 0) {
                  totalLikelyHuman += zone.likely_human[0].count || 0;
                }
              });
            }
          });
          return <span className="result-item">Bot management(Likely Human): {formatNumber(totalLikelyHuman)}</span>;
        } else {
          return <span className="result-item">Bot management(Likely Human): No data available</span>;
        }
      
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
  
      case 'data_transfer_by_country':
        if (Array.isArray(result)) {
          const dataWithZoneInfo = result.map(zoneData => {
            return zoneData.result.map(item => ({
              ...item,
              zoneId: zoneData.zoneId,
              zoneName: zoneData.zoneName || zoneData.zoneId
            }));
          }).flat();
          return <DataTransferDownload data={dataWithZoneInfo} />;
        }
        break;

      case 'stream_minutes_stored':
        if (result && result.result && result.success) {
          const { totalStorageMinutes, totalStorageMinutesLimit } = result.result;
          const currentFormatted = formatMinutesToK(totalStorageMinutes);
          const limitFormatted = formatMinutesToK(totalStorageMinutesLimit);
          return (
            <span className="result-item">
              Stream Minutes Stored: Current: {currentFormatted} ({totalStorageMinutes}) / Limit: {limitFormatted} ({totalStorageMinutesLimit})
            </span>
          );
        } else if (result && result.messages && result.messages.some(msg => msg.message === "Cloudflare Stream not enabled")) {
          return (
            <span className="result-item">
              Stream Minutes Stored: Cloudflare Stream not enabled
            </span>
          );
        } else if (result && result.errors && result.errors.length > 0) {
          return (
            <span className="result-item error">
              Stream Minutes Stored: Error - {result.errors[0].message}
            </span>
          );
        } else {
          return <span className="result-item">Stream Minutes Stored: No data available</span>;
        }

        case 'images_stored':
      if (result.errors && result.errors.length > 0) {
        // 에러가 있는 경우
        return (
          <span className="result-item error">
            Images Stored: Error - {result.errors[0].message}
          </span>
        );
      } else if (result.result && result.result.count) {
        const { current, allowed } = result.result.count;
        const currentFormatted = formatNumber(current / 1000); // k 단위로 변환
        const allowedFormatted = formatNumber(allowed / 1000); // k 단위로 변환
        return (
          <span className="result-item">
            Images Stored: Current: {currentFormatted}k ({current}) / Limit: {allowedFormatted}k ({allowed})
          </span>
        );
      } else {
        return <span className="result-item">Images Stored: No data available</span>;
      }

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
        return <pre className="result-item">{JSON.stringify(result, null, 2)}</pre>;
    }

    return <pre className="result-item">{JSON.stringify(result, null, 2)}</pre>;
  };

  return (
    <div className="app">
      <main>
        <div className="content">
          <h1>Cloudflare API</h1>
          <p>사용량을 조회할 고객사, 엔드포인트, 기간을 선택하세요.</p>
          <SearchForm onResultsReceived={setResults} />
        </div>
        <div className="image">
          {results ? (
            <div className="results-container">
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
          ) : (
            <img src={cloudflareImage} alt="Cloudflare logo" />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
