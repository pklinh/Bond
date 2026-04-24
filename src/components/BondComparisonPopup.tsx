import React from 'react';
import ReactECharts from 'echarts-for-react';
import { X, ArrowLeft, RotateCcw, Plus, Check } from 'lucide-react';
import { Bond } from '../types';
import { formatNumber, formatInterestRate } from '../utils/format';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

interface BondComparisonPopupProps {
  primaryBond: Bond;
  onClose: () => void;
  onBack: () => void;
}

// Mock comparison data for demonstration
const COMPARISON_BONDS: Bond[] = [
  {
    id: 'tc-b-28',
    code: 'TCB2028',
    enterpriseId: 'tcb',
    term: '5 năm',
    interestRate: 8.1,
    listedVolume: 5000000,
    issueValue: 5000,
    listedValue: 4800,
    issueDate: '2023-01-15',
    maturityDate: '2028-01-15',
    interestType: 'Cố định',
    status: 'Đang lưu hành'
  },
  {
    id: 'nv-l-26',
    code: 'NVL2026',
    enterpriseId: 'nvl',
    term: '3 năm',
    interestRate: 11.5,
    listedVolume: 3000000,
    issueValue: 3000,
    listedValue: 2500,
    issueDate: '2023-05-20',
    maturityDate: '2026-05-20',
    interestType: 'Thả nổi',
    status: 'Đang lưu hành'
  }
];

export default function BondComparisonPopup({ primaryBond, onClose, onBack }: BondComparisonPopupProps) {
  const { effectiveTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = effectiveTheme === 'dark';

  const selectedBonds = [primaryBond, ...COMPARISON_BONDS];

  const getTimelineOptions = () => {
    const years = selectedBonds.map(b => new Date(b.maturityDate).getFullYear()).sort((a, b) => a - b);
    const minYear = Math.min(...years) - 1;
    const maxYear = Math.max(...years) + 1;
    
    // Create points on the line
    const data = selectedBonds.map(b => ({
      name: b.code,
      value: [new Date(b.maturityDate).getFullYear(), 0],
      isPrimary: b.code === primaryBond.code
    }));

    return {
      grid: { top: 60, bottom: 40, left: 50, right: 50 },
      xAxis: {
        type: 'value',
        min: minYear,
        max: maxYear,
        interval: 1,
        axisLine: { lineStyle: { color: isDark ? '#333' : '#eee' } },
        splitLine: { show: false },
        axisLabel: { 
          formatter: '{value}',
          color: isDark ? '#888' : '#333',
          fontWeight: 'bold',
          margin: 15
        }
      },
      yAxis: { show: false, min: -1, max: 1 },
      series: [
        {
          type: 'line',
          data: [[minYear, 0], [maxYear, 0]],
          lineStyle: { color: isDark ? '#333' : '#eee', width: 2 },
          symbol: 'none',
          silent: true
        },
        {
          type: 'scatter',
          data: data.map(d => ({
            ...d,
            itemStyle: { color: d.isPrimary ? '#3634B3' : (isDark ? '#444' : '#ccc') },
            label: {
              show: true,
              position: 'top',
              formatter: '{b}',
              fontWeight: 'bold',
              fontSize: 10,
              backgroundColor: d.isPrimary ? '#3634B3' : (isDark ? '#222' : '#f0f0f0'),
              color: d.isPrimary ? '#fff' : (isDark ? '#eee' : '#555'),
              padding: [4, 8],
              borderRadius: 4,
              offset: [0, -10]
            }
          })),
          symbolSize: 12,
          emphasis: { scale: 1.2 }
        }
      ]
    };
  };

  const getScaleOptions = () => {
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 9 }
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: selectedBonds.map(b => b.code),
        axisLabel: { fontSize: 10, fontWeight: 'bold' }
      },
      yAxis: { show: false },
      series: [
        {
          name: t('issueVolumeLong'),
          type: 'bar',
          barWidth: 8,
          data: selectedBonds.map(b => b.listedVolume / 1000000),
          itemStyle: { color: '#3634B3' }
        },
        {
          name: t('issueValueShort'),
          type: 'bar',
          barWidth: 8,
          data: selectedBonds.map(b => b.issueValue / 1000),
          itemStyle: { color: '#1a187a' }
        },
        {
          name: t('listedValueShort'),
          type: 'bar',
          barWidth: 8,
          data: selectedBonds.map(b => b.listedValue / 1000),
          itemStyle: { color: isDark ? '#444' : '#ccc' }
        }
      ]
    };
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-bg-surface w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border-base flex items-center justify-between transition-colors">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-bold">{t('back')}</span>
            </button>
            <div>
              <h3 className="text-xl font-bold text-text-base leading-tight transition-colors">{t('bondComparisonTitle')}</h3>
              <p className="text-xs text-text-muted transition-colors">{t('bondComparisonSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors">
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm font-bold">{t('reset')}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-bg-base rounded-full transition-colors text-text-muted hover:text-text-base"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 transition-colors">
          {/* Selected Pills */}
          <div className="flex flex-wrap gap-3">
            {selectedBonds.map((b) => (
              <div 
                key={b.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  b.code === primaryBond.code 
                    ? 'bg-[#3634B3] border-[#3634B3] text-white' 
                    : 'bg-bg-base border-border-base text-text-base'
                }`}
              >
                <span className="text-sm font-bold tracking-tight">{b.code}</span>
                {b.code === primaryBond.code && <Check className="h-3 w-3" />}
              </div>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-dashed border-border-base text-text-muted rounded-full hover:border-text-highlight hover:text-text-highlight transition-all">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-bold">{t('addBond')}</span>
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-text-base tracking-widest transition-colors">{t('maturityTimeline')}</h4>
            <div className="h-[120px] bg-bg-base/20 rounded-2xl p-4 transition-colors">
              <ReactECharts option={getTimelineOptions()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Issue Scale & Coupon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-baseline justify-between">
                <h4 className="text-sm font-bold text-text-base tracking-widest transition-colors">{t('issueScale')}</h4>
                <span className="text-[10px] text-text-muted font-bold tracking-tighter">({t('unitBillionShort')})</span>
              </div>
              <div className="h-[220px] transition-colors">
                <ReactECharts option={getScaleOptions()} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-baseline justify-between">
                <h4 className="text-sm font-bold text-text-base tracking-widest transition-colors">{t('couponYield')}</h4>
                <span className="text-[10px] text-text-muted font-bold font-mono">(%)</span>
              </div>
              <div className="flex justify-between items-end h-[220px] px-8 pb-10 transition-colors">
                {selectedBonds.map((b) => (
                  <div key={b.id} className="flex flex-col items-center gap-4">
                    <span className={`text-lg font-bold ${b.interestRate > 10 ? 'text-rose-500' : 'text-text-base'}`}>
                      {formatInterestRate(b.interestRate)}%
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{b.code.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detail Table */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-text-base tracking-widest transition-colors">{t('detailedSpecs')}</h4>
            <div className="rounded-2xl border border-border-base bg-bg-surface overflow-hidden transition-colors">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {[
                    { label: t('bondCode'), key: 'code' },
                    { label: t('term'), key: 'term' },
                    { label: t('interestRate'), key: 'interestRate', isRate: true },
                    { label: t('interestType'), key: 'interestType' },
                    { label: t('issueDate'), key: 'issueDate' },
                    { label: t('maturityDate'), key: 'maturityDate' },
                    { label: t('issuedValue'), key: 'issueValue', isValue: true }
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-bg-base/30' : ''}>
                      <td className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider transition-colors">{row.label}</td>
                      {selectedBonds.map((b) => (
                        <td key={b.id} className="px-6 py-4 text-sm font-bold text-text-base transition-colors">
                          {row.isRate ? `${formatInterestRate(b.interestRate)}%` : 
                           row.isValue ? `${formatNumber(b.issueValue, 0)} ${t('unitBillionShort')}` :
                           (b as any)[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-base flex items-center justify-end gap-3 bg-bg-base/20 transition-colors">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-text-base hover:bg-bg-base rounded-xl transition-all"
          >
            {t('cancel')}
          </button>
          <button 
            className="px-8 py-2.5 bg-[#3634B3] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#3634B3]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t('tradeNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
