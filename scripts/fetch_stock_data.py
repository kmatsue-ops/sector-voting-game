import yfinance as yf
import json
import os
from datetime import datetime, timedelta
import pandas as pd

# Define sectors and their 10 stocks (Large + Small/Mid Cap)
SECTORS = {
    "AI_Robot": [
        "9984.T", "6861.T", "6954.T", "6273.T", "6645.T", # Large
        "3993.T", "4180.T", "247A.T", "4382.T", "4011.T"  # Small/Mid
    ],
    "Quantum": [
        "6702.T", "6701.T", "9432.T", "6501.T", "6503.T", # Large
        "3687.T", "6597.T", "6521.T", "7713.T", "2693.T"  # Small/Mid
    ],
    "Semi": [
        "8035.T", "6857.T", "4063.T", "6146.T", "6920.T", # Large
        "6323.T", "6315.T", "4369.T", "6871.T", "6266.T"  # Small/Mid
    ],
    "Bio": [
        "4519.T", "4568.T", "4502.T", "4578.T", "4503.T", # Large
        "4587.T", "2160.T", "4552.T", "4592.T", "4599.T"  # Small/Mid
    ],
    "Fusion": [
        "7013.T", "5802.T", "5803.T", "5801.T", "1963.T", # Large
        "5310.T", "7711.T", "3446.T", "6378.T", "6864.T"  # Small/Mid
    ],
    "Space": [
        "7011.T", "7012.T", "9412.T", "7751.T", "9433.T", # Large
        "9348.T", "5595.T", "186A.T", "290A.T", "402A.T"  # Small/Mid
    ]
}

def fetch_sector_performance():
    results = {}
    
    print(f"Fetching data at {datetime.now()}...")

    # Fixed start date for data collection
    START_DATE = "2024-11-26"
    
    # Initialize common date index (using a major index like 9984.T as reference)
    ref_ticker = "9984.T"
    ref_data = yf.Ticker(ref_ticker).history(start=START_DATE)
    common_dates = ref_data.index
    
    # Structure to hold sum of normalized prices for averaging
    sector_sums = {sector: pd.Series(0.0, index=common_dates) for sector in SECTORS}
    sector_counts = {sector: pd.Series(0, index=common_dates) for sector in SECTORS}

    for sector, tickers in SECTORS.items():
        sector_changes = []
        valid_tickers = []
        print(f"Processing {sector}...")
        
        for ticker in tickers:
            try:
                # Fetch data from fixed start date
                stock = yf.Ticker(ticker)
                hist = stock.history(start=START_DATE)
                
                if len(hist) < 2:
                    print(f"  Warning: Insufficient data for {ticker}")
                    continue
                
                # Reindex to common dates to handle missing days/listings
                hist = hist['Close'].reindex(common_dates, method='ffill')
                
                # Normalize to percentage change from start (0%)
                # Find first valid price
                first_valid_idx = hist.first_valid_index()
                if first_valid_idx is None:
                    continue
                    
                start_price = hist.loc[first_valid_idx]
                normalized_hist = ((hist - start_price) / start_price) * 100
                
                # Add to sector accumulator
                sector_sums[sector] = sector_sums[sector].add(normalized_hist, fill_value=0)
                sector_counts[sector] = sector_counts[sector].add(hist.notna().astype(int), fill_value=0)

                # Get latest close and previous close for daily change
                latest_close = hist.iloc[-1]
                prev_close = hist.iloc[-2]
                
                if pd.isna(latest_close) or pd.isna(prev_close) or prev_close == 0:
                    continue
                    
                # Calculate daily percent change
                change = ((latest_close - prev_close) / prev_close) * 100
                sector_changes.append(change)
                valid_tickers.append({
                    "ticker": ticker,
                    "change": round(change, 2),
                    "price": round(latest_close, 1)
                })
                print(f"  {ticker}: {change:+.2f}% (¥{latest_close:,.0f})")
                
            except Exception as e:
                print(f"  Error fetching {ticker}: {e}")
        
        # Calculate average for the sector
        if sector_changes:
            avg_change = sum(sector_changes) / len(sector_changes)
            results[sector] = {
                "change_percent": round(avg_change, 2),
                "tickers": valid_tickers
            }
        else:
            results[sector] = {
                "change_percent": 0,
                "tickers": []
            }

    # Process history for JSON output
    history_data = []
    for date in common_dates:
        date_str = date.strftime('%Y-%m-%d')
        entry = {"date": date_str}
        for sector in SECTORS:
            count = sector_counts[sector].loc[date]
            if count > 0:
                avg_val = sector_sums[sector].loc[date] / count
                entry[sector] = round(avg_val, 2)
            else:
                entry[sector] = 0 # Or null
        history_data.append(entry)

    return {
        "sectors": results, 
        "history": history_data,
        "last_updated": datetime.now().isoformat()
    }

if __name__ == "__main__":
    data = fetch_sector_performance()
    
    # Ensure public directory exists
    os.makedirs("public", exist_ok=True)
    
    with open("public/stock_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Data saved to public/stock_data.json")
