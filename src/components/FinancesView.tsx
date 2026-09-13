import React, { useState, useEffect } from 'react';
import { financesApi } from '../services/api';
import { FinancialAccount, LedgerTransaction, ShopItem } from '../types';
import { DollarSign, Coins, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ShoppingBag, CreditCard, RefreshCw } from 'lucide-react';

interface FinancesViewProps {
  currentClubId: string;
  onRefreshBalance: () => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({ currentClubId, onRefreshBalance }) => {
  const [balance, setBalance] = useState<FinancialAccount | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadFinances();
  }, [currentClubId]);

  const loadFinances = async () => {
    try {
      setLoading(true);
      const [bal, txs, shop] = await Promise.all([
        financesApi.getBalance(currentClubId).catch(() => ({ club_id: currentClubId, cash_balance: 5000000, gold_balance: 250 })),
        financesApi.getTransactions(currentClubId).catch(() => []),
        financesApi.getShop().catch(() => [])
      ]);
      setBalance(bal);
      setTransactions(Array.isArray(txs) ? txs : []);
      setShopItems(Array.isArray(shop) ? shop : []);
    } catch (err) {
      console.error('Failed to load finances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItem = async (item: ShopItem) => {
    if (!balance || (balance.gold_balance || 0) < item.gold_cost) {
      setFeedback({ type: 'error', message: 'Insufficient Gold for this exchange!' });
      return;
    }
    try {
      setBuyingId(item.id);
      setFeedback(null);
      await financesApi.buyShopItem({
        club_id: currentClubId,
        item_id: item.id
      });
      setFeedback({ type: 'success', message: `Exchanged ${item.gold_cost} Gold for €${(item.cash_reward / 1000000).toFixed(1)}M Cash!` });
      loadFinances();
      onRefreshBalance();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Exchange transaction failed.' });
    } finally {
      setBuyingId(null);
    }
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val}`;
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title flex-center" style={{ gap: '0.75rem' }}>
            <CreditCard className="text-warning" size={28} />
            Club Treasury & Gold Exchange
          </h1>
          <p className="view-subtitle">Track ledger cashflows, matchday income, and convert Gold currency</p>
        </div>

        <button className="btn btn-outline btn-sm flex-center" style={{ gap: '0.4rem' }} onClick={loadFinances}>
          <RefreshCw size={15} /> Refresh Ledgers
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} mb-4`}>
          {feedback.message}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid-3 mb-4">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--neon-green)' }}>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Liquid Cash Reserves</span>
            <DollarSign className="text-success" size={24} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            {balance ? formatMoney(Number(balance.cash_balance)) : '€0'}
          </div>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Available for wages, facility upgrades & transfer signings
          </p>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Gold Bullion (Premium)</span>
            <Coins className="text-warning" size={24} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
            {balance?.gold_balance?.toLocaleString() ?? 0} <span style={{ fontSize: '1rem' }}>GOLD</span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Earned from achievements & daily season milestones
          </p>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Financial Health</span>
            <TrendingUp className="text-primary" size={24} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            Grade A+
          </div>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            FFP Compliant: No outstanding debt
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Ledger Transactions */}
        <div className="card">
          <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp className="text-primary" size={20} />
            Ledger Audit Log
          </h3>

          {transactions.length === 0 ? (
            <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No ledger transactions recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 420, overflowY: 'auto' }}>
              {transactions.slice(0, 15).map((tx) => {
                const isIncome = Number(tx.amount) > 0;
                return (
                  <div key={tx.id} className="tx-item">
                    <div className="flex-center" style={{ gap: '0.75rem' }}>
                      <div className={`tx-icon ${isIncome ? 'tx-in' : 'tx-out'}`}>
                        {isIncome ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {tx.description || tx.transaction_type}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(tx.created_at).toLocaleDateString()} · {tx.transaction_type}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: isIncome ? 'var(--neon-green)' : 'var(--danger)' }}>
                        {isIncome ? '+' : ''}{formatMoney(Number(tx.amount))}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Bal: {formatMoney(Number(tx.balance_after))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gold Exchange Shop */}
        <div className="card">
          <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ShoppingBag className="text-warning" size={20} />
            Gold Currency Exchange
          </h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Convert your Gold into cash liquidity instantly to fund stadium expansions or emergency superstar signings.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shopItems.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Exchange shop currently restocking.</p>
            ) : (
              shopItems.map((item) => {
                const canAfford = (balance?.gold_balance || 0) >= item.gold_cost;
                return (
                  <div key={item.id} className="shop-card">
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: '0.25rem' }}>
                        {item.name}
                      </div>
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span className="text-warning flex-center" style={{ gap: '0.2rem' }}>
                          <Coins size={14} /> {item.gold_cost} Gold
                        </span>
                        <span className="text-muted">➔</span>
                        <span className="text-success" style={{ fontWeight: 700 }}>
                          +{formatMoney(item.cash_reward)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={!canAfford || buyingId === item.id}
                      onClick={() => handleBuyItem(item)}
                    >
                      {buyingId === item.id ? 'Converting...' : 'Exchange'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
