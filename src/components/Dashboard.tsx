// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import StockQuoteCard from './StockQuoteCard'; // Assuming you have this component already

// Default stocks to display if no personalized stocks are found
const DEFAULT_STOCKS = ['AAPL', 'MSFT', 'GOOG'];

const Dashboard = () => {
  const [stocks, setStocks] = useState<string[]>(DEFAULT_STOCKS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set user data
        const userId = currentUser.uid;

        try {
          const userStocksRef = collection(db, `users/${userId}/stocks`);
          const snapshot = await getDocs(userStocksRef);

          if (!snapshot.empty) {
            const userStocks = snapshot.docs.map((doc) => doc.id);
            setStocks(userStocks); // Load user-specific stocks
          } else {
            setStocks(DEFAULT_STOCKS); // Fallback to default stocks if no stocks are found
          }
        } catch (error) {
          console.error('Error fetching user stocks:', error);
          setStocks(DEFAULT_STOCKS); // Default stocks on error
        }
      } else {
        setUser(null);
        setStocks(DEFAULT_STOCKS); // Default stocks when not logged in
      }

      setLoading(false); // Finish loading
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  const removeStock = (symbol: string) => {
    setStocks((prevStocks) => prevStocks.filter((stock) => stock !== symbol));
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message while fetching data
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">
        {user ? `Welcome, ${user.displayName || 'User'}!` : 'Stock Dashboard'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((symbol) => (
          <StockQuoteCard
            key={symbol}
            symbol={symbol}
            quote={{ c: 150, pc: 145, h: 155, l: 140 }} // Example data
            onRemove={() => removeStock(symbol)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
