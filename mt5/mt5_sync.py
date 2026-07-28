#!/usr/bin/env python3
"""
Trade Journal - MT5 Auto Sync Script
Connects to running MetaTrader 5 terminal and syncs trades + account info.

Requirements:
    pip install MetaTrader5 requests

Usage:
    python mt5_sync.py                    # One-time sync
    python mt5_sync.py --loop 30          # Loop every 30 seconds
    python mt5_sync.py --history 30       # Sync last 30 days of history
"""

import os
import sys
import json
import time
import argparse
from datetime import datetime, timedelta

try:
    import MetaTrader5 as mt5
except ImportError:
    print("ERROR: MetaTrader5 package not installed.")
    print("Run: pip install MetaTrader5")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests package not installed.")
    print("Run: pip install requests")
    sys.exit(1)


# === CONFIG ===
API_URL = os.environ.get("TJ_API_URL", "https://trade-journal.mramdev.workers.dev/api/sync")
API_PASSWORD=os.environ.get("TJ_API_PASSWORD", "trader2026")
ACCOUNT_ID = int(os.environ.get("TJ_ACCOUNT_ID", "0"))  # 0 = auto-detect by server name


def connect_mt5():
    """Connect to running MT5 terminal."""
    if not mt5.initialize():
        print(f"ERROR: MT5 initialize failed: {mt5.last_error()}")
        print("Make sure MetaTrader 5 is running.")
        return False

    info = mt5.account_info()
    if info is None:
        print("ERROR: Cannot get account info. Is MT5 logged in?")
        return False

    print(f"Connected to MT5:")
    print(f"  Account: {info.login} ({info.name})")
    print(f"  Server:  {info.server}")
    print(f"  Balance: {info.balance} {info.currency}")
    print(f"  Leverage: 1:{info.leverage}")
    return True


def get_account_info():
    """Get current account info from MT5."""
    info = mt5.account_info()
    if info is None:
        return None
    return {
        "balance": info.balance,
        "equity": info.equity,
        "margin": info.margin,
        "free_margin": info.margin_free,
        "leverage": info.leverage,
        "currency": info.currency,
        "name": info.name,
        "server": info.server,
        "login": info.login,
    }


def get_open_positions():
    """Get all open positions from MT5."""
    positions = mt5.positions_get()
    if positions is None:
        return []

    result = []
    for pos in positions:
        result.append({
            "ticket": pos.ticket,
            "symbol": pos.symbol,
            "type": "buy" if pos.type == mt5.ORDER_TYPE_BUY else "sell",
            "volume": pos.volume,
            "open_price": pos.price_open,
            "open_time": int(pos.time),
            "sl": pos.sl,
            "tp": pos.tp,
            "profit": pos.profit,
            "swap": pos.swap,
            "commission": 0,  # Commission is in deals
            "comment": pos.comment or "",
        })
    return result


def get_closed_deals(days=7):
    """Get recently closed deals from MT5 history."""
    from_date = datetime.now() - timedelta(days=days)
    to_date = datetime.now()

    deals = mt5.history_deals_get(from_date, to_date)
    if deals is None:
        return []

    # Group by position_id to find entry+exit pairs
    positions = {}  # position_id -> {entry_deal, exit_deal}
    for deal in deals:
        # Skip balance/credit operations
        if deal.type > 1:  # Only buy/sell
            continue
        # Skip internal deals
        if deal.entry == 0:  # DEAL_ENTRY_IN
            pos_id = deal.position_id
            if pos_id not in positions:
                positions[pos_id] = {"entry": None, "exit": None}
            positions[pos_id]["entry"] = deal
        elif deal.entry == 1:  # DEAL_ENTRY_OUT
            pos_id = deal.position_id
            if pos_id not in positions:
                positions[pos_id] = {"entry": None, "exit": None}
            positions[pos_id]["exit"] = deal

    # Build closed trades list
    result = []
    for pos_id, pair in positions.items():
        entry = pair.get("entry")
        exit_deal = pair.get("exit")

        # Only include fully closed positions
        if entry is None or exit_deal is None:
            continue

        # Skip if this position is still open (double-check)
        if mt5.positions_get(ticket=pos_id) is not None:
            continue

        result.append({
            "ticket": pos_id,
            "symbol": entry.symbol,
            "type": "buy" if entry.type == mt5.ORDER_TYPE_BUY else "sell",
            "volume": entry.volume,
            "open_price": entry.price,
            "close_price": exit_deal.price,
            "open_time": int(entry.time),
            "close_time": int(exit_deal.time),
            "sl": entry.sl,
            "tp": entry.tp,
            "commission": entry.commission + exit_deal.commission,
            "swap": entry.swap + exit_deal.swap,
            "comment": entry.comment or "",
        })

    return result


def send_to_api(positions, closed, account_info):
    """Send data to Trade Journal API."""
    payload = {
        "password": API_PASSWORD,
        "account_id": ACCOUNT_ID if ACCOUNT_ID > 0 else None,
        "account_info": account_info,
        "positions": positions,
        "closed": closed,
    }

    try:
        resp = requests.post(API_URL, json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            return True, data
        elif resp.status_code == 401:
            return False, "Authentication failed. Check TJ_API_PASSWORD."
        else:
            return False, f"HTTP {resp.status_code}: {resp.text}"
    except requests.exceptions.ConnectionError:
        return False, "Connection failed. Check internet/TJ_API_URL."
    except Exception as e:
        return False, str(e)


def do_sync(history_days=7):
    """Perform one sync cycle."""
    now = datetime.now().strftime("%H:%M:%S")

    # Get data from MT5
    account_info = get_account_info()
    positions = get_open_positions()
    closed = get_closed_deals(days=history_days)

    print(f"[{now}] Syncing: {len(positions)} open, {len(closed)} closed deals...")

    # Send to API
    ok, result = send_to_api(positions, closed, account_info)

    if ok:
        created = result.get("created", 0)
        updated = result.get("updated", 0)
        closed_count = result.get("closed", 0)
        errors = result.get("errors", [])
        print(f"  OK: +{created} created, {updated} updated, {closed_count} closed")
        if errors:
            for e in errors:
                print(f"  WARNING: {e}")
    else:
        print(f"  FAILED: {result}")

    return ok


def main():
    parser = argparse.ArgumentParser(description="Trade Journal - MT5 Sync")
    parser.add_argument("--loop", type=int, default=0,
                        help="Loop interval in seconds (0 = one-time)")
    parser.add_argument("--history", type=int, default=7,
                        help="Days of history to sync (default: 7)")
    parser.add_argument("--url", type=str, default=None,
                        help="API URL (default: from TJ_API_URL env)")
    parser.add_argument("--password", type=str, default=None,
                        help="API password (default: from TJ_API_PASSWORD env)")
    parser.add_argument("--account", type=int, default=None,
                        help="Journal account ID (default: from TJ_ACCOUNT_ID env)")
    args = parser.parse_args()

    # Override config from args
    global API_URL, API_PASSWORD, ACCOUNT_ID
    if args.url:
        API_URL = args.url
    if args.password:
        API_PASSWORD=args.password
    if args.account:
        ACCOUNT_ID = args.account

    # Connect to MT5
    if not connect_mt5():
        sys.exit(1)

    print(f"API URL: {API_URL}")
    print(f"History: {args.history} days")
    print()

    if args.loop > 0:
        print(f"Running in loop mode (every {args.loop}s). Press Ctrl+C to stop.")
        print()
        try:
            while True:
                do_sync(history_days=args.history)
                time.sleep(args.loop)
        except KeyboardInterrupt:
            print("\nStopped.")
    else:
        do_sync(history_days=args.history)

    mt5.shutdown()


if __name__ == "__main__":
    main()
