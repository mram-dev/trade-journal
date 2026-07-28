//+------------------------------------------------------------------+
//|                                       TradeJournalSync.mq5       |
//|                    Trade Journal Auto-Sync Expert Advisor        |
//|                    https://trade-journal.mramdev.workers.dev      |
//+------------------------------------------------------------------+
#property copyright "Trade Journal Sync"
#property version   "1.00"
#property strict

// ===== INPUTS =====
input string   InpApiUrl    = "https://trade-journal.mramdev.workers.dev"; // API URL
input string   InpPassword  = "trader2026";                                 // Admin password
input int      InpAccountId = 4;                                            // Your account ID
input int      InpSyncSec   = 30;                                           // Sync every N seconds

//+------------------------------------------------------------------+
//| Expert initialization                                             |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Trade Journal Sync started. Account ID: ", InpAccountId);
   EventSetTimer(InpSyncSec);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   SyncTrades();
}

//+------------------------------------------------------------------+
//| Send data to API                                                   |
//+------------------------------------------------------------------+
bool SendToAPI(string &payload, string &response)
{
   char   postData[];
   char   result[];
   string headers = "Content-Type: application/json\r\nX-Journal-Password: " + InpPassword + "\r\n";
   StringToCharArray(payload, postData, 0, StringLen(payload));
   
   string resHeaders;
   int timeout = 5000;
   int code = WebRequest("POST", InpApiUrl + "/api/sync", headers, timeout, postData, result, resHeaders);
   
   if(code == 200)
   {
      response = CharArrayToString(result);
      return true;
   }
   Print("WebRequest error: ", code);
   return false;
}

//+------------------------------------------------------------------+
//| Sync open positions + closed history                              |
//+------------------------------------------------------------------+
void SyncTrades()
{
   // 1) Open positions
   string positionsJson = "[";
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      string symbol    = PositionGetString(POSITION_SYMBOL);
      double volume    = PositionGetDouble(POSITION_VOLUME);
      double priceOpen = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl        = PositionGetDouble(POSITION_SL);
      double tp        = PositionGetDouble(POSITION_TP);
      long   type      = PositionGetInteger(POSITION_TYPE);
      string direction = (type == POSITION_TYPE_BUY) ? "long" : "short";
      
      if(positionsJson != "[") positionsJson += ",";
      positionsJson += "{\"ticket\":" + IntegerToString(ticket) +
                       ",\"symbol\":\"" + symbol + "\"" +
                       ",\"direction\":\"" + direction + "\"" +
                       ",\"entry_price\":" + DoubleToString(priceOpen, _Digits) +
                       ",\"lot_size\":" + DoubleToString(volume, 2) +
                       ",\"stop_loss\":" + DoubleToString(sl, _Digits) +
                       ",\"take_profit\":" + DoubleToString(tp, _Digits) + "}";
   }
   positionsJson += "]";
   
   // 2) Account info
   double balance  = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity   = AccountInfoDouble(ACCOUNT_EQUITY);
   string accJson  = "{\"balance\":" + DoubleToString(balance, 2) +
                     ",\"equity\":"  + DoubleToString(equity, 2) + "}";
   
   // 3) Full payload
   string payload = "{\"account_id\":" + IntegerToString(InpAccountId) +
                    ",\"account_info\":" + accJson +
                    ",\"positions\":" + positionsJson +
                    ",\"closed\":[]}";
   
   string response;
   if(SendToAPI(payload, response))
   {
      Print("Sync OK: ", response);
   }
}

//+------------------------------------------------------------------+
//| OnTrade: when a trade closes, force immediate sync                |
//+------------------------------------------------------------------+
void OnTrade()
{
   SyncTrades();
}
