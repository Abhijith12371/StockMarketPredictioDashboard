import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, X, DollarSign, Clock, Activity } from 'lucide-react';
import { StockChart } from './StockChart';
// import { PriceAlerts } from './PriceAlerts';
import { TechnicalIndicators } from './TechnicalIndicators';
import { VolumeAnalysis } from './VolumeAnalysis';
import { StockVisualization } from './StockVisualization';
import { db } from '../services/firebaseConfig';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Props {
  symbol: string;
  quote: any; // Stock data
  onRemove: () => void;
}

export function StockQuoteCard({ symbol, quote, onRemove }: Props) {
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    const saveStockDataForUser = async () => {
      const auth = getAuth(); // Get the current logged-in user
      const user = auth.currentUser;

      if (!user) {
        console.warn('No user is logged in. Stock data not saved.');
        return;
      }

      if (!quote || !symbol) return;

      try {
        // Reference to the user's stocks collection
        const stockRef = doc(db, `users/${user.uid}/stocks`, symbol);

        await setDoc(stockRef, {
          symbol: symbol,
          currentPrice: quote.c,
          priceChange: quote.c - quote.pc,
          percentageChange: ((quote.c - quote.pc) / quote.pc) * 100,
          high: quote.h,
          low: quote.l,
          previousClose: quote.pc,
          timestamp: new Date(),
        }, { merge: true });

        console.log(`Stock data for ${symbol} saved for user: ${user.uid}`);
      } catch (error) {
        console.error('Error saving stock data for user:', error);
      }
    };

    saveStockDataForUser();
  }, [symbol, quote]);

  // Handle undefined quote data
  if (!quote) {
    return <div>Loading...</div>;
  }

  const priceChange = quote.c - quote.pc;
  const percentageChange = (priceChange / quote.pc) * 100;
  const isPositive = priceChange >= 0;

  // Handle stock removal (from both UI and database)
  const handleRemoveStock = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.warn('No user is logged in. Stock removal failed.');
      return;
    }

    try {
      // Reference to the user's stocks collection
      const stockRef = doc(db, `users/${user.uid}/stocks`, symbol);

      await deleteDoc(stockRef); // Delete stock from Firestore

      console.log(`Stock ${symbol} removed from Firestore for user: ${user.uid}`);
      onRemove(); // Call onRemove to update the local state
    } catch (error) {
      console.error('Error removing stock from Firestore:', error);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 relative group transform transition-all duration-300 hover:scale-102 hover:shadow-lg"
      onMouseEnter={() => setShowVisualization(true)}
      onMouseLeave={() => setShowVisualization(false)}
    >
      <StockVisualization quote={quote} isVisible={showVisualization} />

      <button
        onClick={handleRemoveStock} // Updated to handle the removal
        className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-300"
        title="Remove from watchlist"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {symbol}
            {isPositive ? (
              <ArrowUpCircle className="w-6 h-6 text-green-500" />
            ) : (
              <ArrowDownCircle className="w-6 h-6 text-red-500" />
            )}
          </h2>
          <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Current</p>
              <p className="text-xl font-semibold">${quote.c?.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Change</p>
              <p className={`text-xl font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange > 0 ? '+' : ''}{priceChange?.toFixed(2)} ({percentageChange?.toFixed(2)}%)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Range</p>
              <p className="text-xl font-semibold">${quote.l?.toFixed(2)} - ${quote.h?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <StockChart symbol={symbol} quote={quote} />
        <TechnicalIndicators quote={quote} />
        {/* <PriceAlerts symbol={symbol} quote={quote} /> */}
        <VolumeAnalysis quote={quote} />
      </div>
    </div>
  );
}
