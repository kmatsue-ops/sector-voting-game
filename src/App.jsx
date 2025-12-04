import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Stock Name Mapping (Ticker -> Japanese Name)
const STOCK_NAMES = {
    // AI・ロボット
    "9984.T": "ソフトバンクG", "6861.T": "キーエンス", "6954.T": "ファナック", "6273.T": "SMC", "6645.T": "オムロン",
    "3993.T": "PKSHA", "4180.T": "Appier", "247A.T": "Aiロボティクス", "4382.T": "HEROZ", "4011.T": "ヘッドウォータース",
    // 量子技術
    "6702.T": "富士通", "6701.T": "NEC", "9432.T": "NTT", "6501.T": "日立製作所", "6503.T": "三菱電機",
    "3687.T": "フィックスターズ", "6597.T": "HPCシステムズ", "6521.T": "オキサイド", "7713.T": "シグマ光機", "2693.T": "YKT",
    // 半導体・通信
    "8035.T": "東京エレクトロン", "6857.T": "アドバンテスト", "4063.T": "信越化学", "6146.T": "ディスコ", "6920.T": "レーザーテック",
    "6323.T": "ローツェ", "6315.T": "TOWA", "4369.T": "トリケミカル", "6871.T": "日本マイクロニクス", "6266.T": "タツモ",
    // バイオ・ヘルスケア
    "4519.T": "中外製薬", "4568.T": "第一三共", "4502.T": "武田薬品", "4578.T": "大塚HD", "4503.T": "アステラス製薬",
    "4587.T": "ペプチドリーム", "2160.T": "GNIグループ", "4552.T": "JCRファーマ", "4592.T": "サンバイオ", "4599.T": "ステムリム",
    // 核融合
    "7013.T": "IHI", "5802.T": "住友電気工業", "5803.T": "フジクラ", "5801.T": "古河電気工業", "1963.T": "日揮HD",
    "5310.T": "東洋炭素", "7711.T": "助川電気工業", "3446.T": "ジェイテック", "6378.T": "木村化工機", "6864.T": "エヌエフHD",
    // 宇宙
    "7011.T": "三菱重工業", "7012.T": "川崎重工業", "9412.T": "スカパーJSAT", "7751.T": "キヤノン", "9433.T": "KDDI",
    "9348.T": "ispace", "464A.T": "QPSホールディングス", "186A.T": "アストロスケール", "290A.T": "Synspective", "402A.T": "アクセルスペース"
};

const INITIAL_DATA = {
    "AI_Robot": { name: "AI・ロボット", change: 0, tickers: [] },
    "Quantum": { name: "量子技術", change: 0, tickers: [] },
    "Semi": { name: "半導体・通信", change: 0, tickers: [] },
    "Bio": { name: "バイオ・ヘルスケア", change: 0, tickers: [] },
    "Fusion": { name: "核融合", change: 0, tickers: [] },
    "Space": { name: "宇宙", change: 0, tickers: [] }
};

function App() {
    const [data, setData] = useState(INITIAL_DATA);
    const [historyData, setHistoryData] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [lastUpdated, setLastUpdated] = useState('');
    const [nikkeiPrice, setNikkeiPrice] = useState(null);
    const [timeRange, setTimeRange] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try production path first, then local, with cache busting
                const timestamp = Date.now();
                let res = await fetch(`/six-national-strategic/stock_data.json?t=${timestamp}`);
                if (!res.ok) res = await fetch(`/stock_data.json?t=${timestamp}`);

                const json = await res.json();
                if (json.sectors) {
                    setData(prev => {
                        const newData = { ...prev };
                        Object.keys(json.sectors).forEach(key => {
                            if (newData[key]) {
                                newData[key].change = json.sectors[key].change_percent;
                                newData[key].tickers = json.sectors[key].tickers || [];
                            }
                        });
                        return newData;
                    });
                }
                if (json.history) {
                    setHistoryData(json.history);
                }
                if (json.last_updated) {
                    setLastUpdated(new Date(json.last_updated).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
                }
                if (json.nikkei_current_price) {
                    setNikkeiPrice(json.nikkei_current_price);
                }
            } catch (err) {
                console.error("Failed to load stock data", err);
            }
        };
        fetchData();
    }, []);

    // Filter history data based on time range
    const getFilteredHistory = () => {
        if (!historyData.length) return [];

        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '6M':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'YTD':
                startDate = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
                break;
            case 'ALL':
            default:
                return historyData;
        }

        return historyData.filter(item => new Date(item.date) >= startDate);
    };

    const filteredHistory = getFilteredHistory();

    // Calculate Nikkei change since Tax Cut News
    const getNikkeiChange = () => {
        if (!historyData.length) return null;
        const newsDateStr = "2025-11-26";
        const newsDataPoint = historyData.find(d => d.date >= newsDateStr) || historyData[historyData.length - 1];
        const currentDataPoint = historyData[historyData.length - 1];

        if (newsDataPoint && currentDataPoint && newsDataPoint.Nikkei225 !== undefined && currentDataPoint.Nikkei225 !== undefined) {
            const vNews = newsDataPoint.Nikkei225;
            const vCurrent = currentDataPoint.Nikkei225;
            return ((vCurrent - vNews) / (100 + vNews)) * 100;
        }
        return 0;
    };

    const nikkeiChange = getNikkeiChange();

    return (
        <div className="min-h-screen text-green-400 p-4 md:p-8 font-mono selection:bg-green-500 selection:text-black relative overflow-hidden">
            <div className="scanline"></div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-green-500/30 pb-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter cyber-glitch" data-text="JAPAN TECH 6">
                            JAPAN TECH 6
                        </h1>
                        <p className="text-green-600 mt-2 font-bold tracking-widest uppercase text-xs">&gt;&gt; National Strategic Sectors Tracker v2.0</p>
                        {nikkeiPrice && (
                            <div className="mt-4 flex items-center gap-4 text-sm font-bold font-mono">
                                <span className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-500/50">NIKKEI 225</span>
                                <span className="text-white text-lg">¥{nikkeiPrice.toLocaleString()}</span>
                                <span className={`${nikkeiChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    [ {nikkeiChange > 0 ? '+' : ''}{nikkeiChange?.toFixed(2)}% ]
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <div className="px-4 py-2 bg-black border border-green-500/30 text-xs text-green-500 font-mono mb-2">
                            SYSTEM STATUS: ONLINE
                        </div>
                        <div className="text-xs text-green-700">
                            LAST UPDATE: {lastUpdated || 'FETCHING...'}
                        </div>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(data).map(([key, info]) => {
                        const newsDateStr = "2025-11-26";
                        const newsDataPoint = historyData.find(d => d.date >= newsDateStr) || historyData[historyData.length - 1];
                        const currentDataPoint = historyData[historyData.length - 1];

                        let newsChange = 0;
                        if (newsDataPoint && currentDataPoint) {
                            const vNews = newsDataPoint[key] || 0;
                            const vCurrent = currentDataPoint[key] || 0;
                            newsChange = ((vCurrent - vNews) / (100 + vNews)) * 100;
                        }

                        const displayChange = newsChange.toFixed(2);
                        const isPositive = Number(displayChange) > 0;

                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedSector(key)}
                                className="cyber-card group p-6 text-left h-full flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-4xl opacity-80 group-hover:opacity-100 transition-opacity filter drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
                                        {key === 'AI_Robot' && '🤖'}
                                        {key === 'Quantum' && '⚛️'}
                                        {key === 'Semi' && '📱'}
                                        {key === 'Bio' && '💊'}
                                        {key === 'Fusion' && '☀️'}
                                        {key === 'Space' && '🚀'}
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-3xl font-black tracking-tighter ${isPositive ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]'}`}>
                                            {isPositive ? '+' : ''}{displayChange}%
                                        </div>
                                        <div className="text-[10px] text-green-700 uppercase tracking-widest mt-1">vs TAX CUT NEWS</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors uppercase tracking-wider">
                                        {info.name}
                                    </h3>
                                    <div className="w-full h-[1px] bg-green-900 my-3 group-hover:bg-green-500 transition-colors"></div>
                                    <p className="text-xs text-green-600 group-hover:text-green-400">&gt;&gt; ACCESS DATA</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Chart Section */}
                <div className="cyber-card p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-green-900/50 pb-4">
                        <h2 className="text-xl font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
                            MARKET TREND ANALYSIS
                        </h2>
                        <div className="flex gap-2">
                            {['1M', '6M', 'YTD', 'ALL'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 text-xs font-bold border ${timeRange === range
                                        ? 'bg-green-500 text-black border-green-500'
                                        : 'bg-transparent text-green-700 border-green-900 hover:text-green-400 hover:border-green-500'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a331a" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#1a4d1a"
                                    tick={{ fill: '#336633', fontSize: 10, fontFamily: 'monospace' }}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    }}
                                />
                                <YAxis
                                    stroke="#1a4d1a"
                                    tick={{ fill: '#336633', fontSize: 10, fontFamily: 'monospace' }}
                                    unit="%"
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #0f0', boxShadow: '0 0 10px #0f0' }}
                                    itemStyle={{ color: '#0f0', fontFamily: 'monospace' }}
                                    labelStyle={{ color: '#0f0', marginBottom: '0.5rem', borderBottom: '1px solid #0f0' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace' }} />
                                <ReferenceLine x="2024-11-26" stroke="#ff00ff" strokeDasharray="3 3" label={{ value: "EVENT: TAX CUT", position: 'top', fill: '#ff00ff', fontSize: 10 }} />

                                <Line type="monotone" dataKey="Nikkei225" stroke="#ff0000" strokeWidth={2} dot={false} name="NIKKEI 225" />
                                <Line type="monotone" dataKey="AI_Robot" stroke="#00ffff" strokeWidth={2} dot={false} name="AI/ROBOT" />
                                <Line type="monotone" dataKey="Semi" stroke="#00ff00" strokeWidth={2} dot={false} name="SEMI" />
                                <Line type="monotone" dataKey="Bio" stroke="#ff00ff" strokeWidth={2} dot={false} name="BIO" />
                                <Line type="monotone" dataKey="Quantum" stroke="#ffff00" strokeWidth={2} dot={false} name="QUANTUM" />
                                <Line type="monotone" dataKey="Fusion" stroke="#ff8800" strokeWidth={2} dot={false} name="FUSION" />
                                <Line type="monotone" dataKey="Space" stroke="#ffffff" strokeWidth={2} dot={false} name="SPACE" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {selectedSector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedSector(null)}
                    />
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border border-green-500 shadow-[0_0_50px_rgba(0,255,0,0.2)] animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-black/95 border-b border-green-500/50">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                                    {selectedSector === 'AI_Robot' && '🤖'}
                                    {selectedSector === 'Quantum' && '⚛️'}
                                    {selectedSector === 'Semi' && '📱'}
                                    {selectedSector === 'Bio' && '💊'}
                                    {selectedSector === 'Fusion' && '☀️'}
                                    {selectedSector === 'Space' && '🚀'}
                                </span>
                                <div>
                                    <h2 className="text-2xl font-black text-green-400 uppercase tracking-widest">{data[selectedSector].name}</h2>
                                    <p className="text-green-700 text-xs font-mono">&gt;&gt; SECTOR COMPOSITION DATA</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSector(null)}
                                className="p-2 hover:bg-green-900/30 text-green-500 hover:text-green-400 transition-colors border border-transparent hover:border-green-500"
                            >
                                [X] CLOSE
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-8">
                            {/* Large Cap Section */}
                            <div>
                                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-cyan-900/50 pb-2">
                                    <span className="w-2 h-2 bg-cyan-400"></span>
                                    LARGE CAP
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data[selectedSector].tickers.slice(0, 5).map((stock) => {
                                        const isObject = typeof stock === 'object' && stock !== null;
                                        const ticker = isObject ? stock.ticker : stock;
                                        const change = isObject ? stock.change : null;
                                        const price = isObject ? stock.price : null;

                                        return (
                                            <a
                                                key={ticker}
                                                href={`https://finance.yahoo.co.jp/quote/${ticker}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex justify-between items-center p-3 border border-green-900/30 hover:border-cyan-400 hover:bg-cyan-900/10 transition-all group"
                                            >
                                                <div>
                                                    <div className="font-bold text-lg text-gray-300 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                                                        {STOCK_NAMES[ticker] || ticker}
                                                    </div>
                                                    <div className="text-xs text-green-800 font-mono group-hover:text-green-500">[{ticker}]</div>
                                                </div>
                                                <div className="text-right">
                                                    {price !== null ? (
                                                        <>
                                                            <div className={`font-bold text-lg ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                                                                {change > 0 ? '+' : ''}{change}%
                                                            </div>
                                                            <div className="text-xs text-gray-500">¥{price.toLocaleString()}</div>
                                                        </>
                                                    ) : (
                                                        <div className="text-gray-600 text-xs">NO DATA</div>
                                                    )}
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Small/Mid Cap Section */}
                            <div>
                                <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-pink-900/50 pb-2">
                                    <span className="w-2 h-2 bg-pink-400"></span>
                                    SMALL/MID CAP
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data[selectedSector].tickers.slice(5, 10).map((stock) => {
                                        const isObject = typeof stock === 'object' && stock !== null;
                                        const ticker = isObject ? stock.ticker : stock;
                                        const change = isObject ? stock.change : null;
                                        const price = isObject ? stock.price : null;

                                        return (
                                            <a
                                                key={ticker}
                                                href={`https://finance.yahoo.co.jp/quote/${ticker}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex justify-between items-center p-3 border border-green-900/30 hover:border-pink-400 hover:bg-pink-900/10 transition-all group"
                                            >
                                                <div>
                                                    <div className="font-bold text-lg text-gray-300 group-hover:text-pink-300 transition-colors flex items-center gap-2">
                                                        {STOCK_NAMES[ticker] || ticker}
                                                    </div>
                                                    <div className="text-xs text-green-800 font-mono group-hover:text-green-500">[{ticker}]</div>
                                                </div>
                                                <div className="text-right">
                                                    {price !== null ? (
                                                        <>
                                                            <div className={`font-bold text-lg ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                                                                {change > 0 ? '+' : ''}{change}%
                                                            </div>
                                                            <div className="text-xs text-gray-500">¥{price.toLocaleString()}</div>
                                                        </>
                                                    ) : (
                                                        <div className="text-gray-600 text-xs">NO DATA</div>
                                                    )}
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
