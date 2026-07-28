//+------------------------------------------------------------------+
//|                                            TradeJournalSync.mq5  |
//|                              Trade Journal - MT5 Auto Sync EA    |
//|                                             https://mramdev.ir   |
//+------------------------------------------------------------------+
#property copyright "Trade Journal"
#property link      "https://trade-journal.mramdev.workers.dev"
#property version   "1.00"
#property strict

//--- Input parameters
input string   API_URL      = "https://trade-journal.mramdev.workers.dev/api/sync";  // API URL
input string   API_PASSWORD = "trader2026";  // Journal Password
input int      ACCOUNT_ID   = 0;              // Journal Account ID (0=auto)
input int      SYNC_SECONDS = 30;             // Sync interval (seconds)
input bool     SYNC_HISTORY = true;           // Sync closed trades history
input int      HISTORY_DAYS = 7;              // How many days of history to sync

//--- Global variables
datetime g_lastSyncTime = 0;
datetime g_lastHistoryCheck = 0;
string   g_authToken = "";
int      g_syncCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   // Set timer
   EventSetTimer(SYNC_SECONDS);
   
   Print("=== Trade Journal Sync EA Started ===");
   Print("API URL: ", API_URL);
   Print("Sync interval: ", SYNC_SECONDS, " seconds");
   Print("Account: ", AccountInfoString(ACCOUNT_NAME), " (#", AccountInfoInteger(ACCOUNT_LOGIN), ")");
   
   // First sync immediately
   DoSync();
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("=== Trade Journal Sync EA Stopped ===");
   Print("Total syncs: ", g_syncCount);
}

//+------------------------------------------------------------------+
//| Timer function - periodic sync                                     |
//+------------------------------------------------------------------+
void OnTimer()
{
   DoSync();
}

//+------------------------------------------------------------------+
//| Trade function - sync on trade events                              |
//+------------------------------------------------------------------+
void OnTrade()
{
   // Immediate sync when a trade event happens
   Print("Trade event detected - syncing...");
   DoSync();
}

//+------------------------------------------------------------------+
//| Main sync function                                                 |
//+------------------------------------------------------------------+
void DoSync()
{
   // Build JSON payload
   string json = BuildSyncPayload();
   if(json == "") return;
   
   // Send to API
   string response = "";
   int result = SendToAPI(json, response);
   
   if(result == 200)
   {
      g_syncCount++;
      g_lastSyncTime = TimeCurrent();
      Print("Sync #", g_syncCount, " successful: ", response);
   }
   else
   {
      Print("Sync failed (HTTP ", result, "): ", response);
   }
}

//+------------------------------------------------------------------+
//| Build JSON payload with open positions and closed deals            |
//+------------------------------------------------------------------+
string BuildSyncPayload()
{
   string json = "{";
   
   // Password for auth
   json += "\"password\":\"" + EscapeJson(API_PASSWORD) + "\",";
   
   // Account ID
   if(ACCOUNT_ID > 0)
      json += "\"account_id\":" + IntegerToString(ACCOUNT_ID) + ",";
   else
      json += "\"account_id\":null,";
   
   // Account info
   json += "\"account_info\":{";
   json += "\"balance\":" + DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2) + ",";
   json += "\"equity\":" + DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2) + ",";
   json += "\"margin\":" + DoubleToString(AccountInfoDouble(ACCOUNT_MARGIN), 2) + ",";
   json += "\"free_margin\":" + DoubleToString(AccountInfoDouble(ACCOUNT_MARGIN_FREE), 2) + ",";
   json += "\"leverage\":" + IntegerToString(AccountInfoInteger(ACCOUNT_LEVERAGE)) + ",";
   json += "\"currency\":\"" + AccountInfoString(ACCOUNT_CURRENCY) + "\",";
   json += "\"name\":\"" + EscapeJson(AccountInfoString(ACCOUNT_NAME)) + "\",";
   json += "\"server\":\"" + EscapeJson(AccountInfoString(ACCOUNT_SERVER)) + "\",";
   json += "\"login\":" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   json += "},";
   
   // === OPEN POSITIONS ===
   json += "\"positions\":[";
   
   int totalPositions = PositionsTotal();
   int posCount = 0;
   
   for(int i = 0; i < totalPositions; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      // Select position
      if(!PositionSelectByTicket(ticket)) continue;
      
      // Only sync positions for current account
      long posAccount = PositionGetInteger(POSITION_IDENTIFIER);
      
      string symbol = PositionGetString(POSITION_SYMBOL);
      long   type   = PositionGetInteger(POSITION_TYPE);
      double volume = PositionGetDouble(POSITION_VOLUME);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl = PositionGetDouble(POSITION_SL);
      double tp = PositionGetDouble(POSITION_TP);
      double profit = PositionGetDouble(POSITION_PROFIT);
      double swap = PositionGetDouble(POSITION_SWAP);
      double commission = 0; // Commission is in deals, not positions
      datetime openTime = (datetime)PositionGetInteger(POSITION_TIME);
      string comment = PositionGetString(POSITION_COMMENT);
      
      if(posCount > 0) json += ",";
      json += "{";
      json += "\"ticket\":" + IntegerToString(ticket) + ",";
      json += "\"symbol\":\"" + symbol + "\",";
      json += "\"type\":\"" + (type == POSITION_TYPE_BUY ? "buy" : "sell") + "\",";
      json += "\"volume\":" + DoubleToString(volume, 2) + ",";
      json += "\"open_price\":" + DoubleToString(openPrice, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)) + ",";
      json += "\"open_time\":" + IntegerToString(openTime) + ",";
      json += "\"sl\":" + DoubleToString(sl, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)) + ",";
      json += "\"tp\":" + DoubleToString(tp, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)) + ",";
      json += "\"profit\":" + DoubleToString(profit, 2) + ",";
      json += "\"swap\":" + DoubleToString(swap, 2) + ",";
      json += "\"commission\":" + DoubleToString(commission, 2) + ",";
      json += "\"comment\":\"" + EscapeJson(comment) + "\"";
      json += "}";
      posCount++;
   }
   
   json += "],";
   
   // === CLOSED DEALS (History) ===
   json += "\"closed\":[";
   
   int dealCount = 0;
   
   if(SYNC_HISTORY)
   {
      datetime fromTime = TimeCurrent() - (HISTORY_DAYS * 86400);
      if(g_lastHistoryCheck > 0)
         fromTime = g_lastHistoryCheck - 300; // 5 min overlap for safety
      
      // Select history
      if(HistorySelect(fromTime, TimeCurrent()))
      {
         int totalDeals = HistoryDealsTotal();
         
         for(int i = 0; i < totalDeals; i++)
         {
            ulong dealTicket = HistoryDealGetTicket(i);
            if(dealTicket == 0) continue;
            
            // Only process deal_in (entry) deals that have a position
            long dealEntry = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
            if(dealEntry != DEAL_ENTRY_IN) continue;
            
            long dealReason = HistoryDealGetInteger(dealTicket, DEAL_REASON);
            // Skip internal deals
            if(dealReason == DEAL_REASON_EXPERT || dealReason == DEAL_REASON_MOBILE) continue;
            
            ulong posId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
            
            // Get the exit deal for this position
            ulong exitTicket = FindExitDeal(posId, fromTime);
            
            if(exitTicket == 0) continue; // Position still open or no exit found
            
            // Get entry deal info
            string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
            long dealType = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
            double volume = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
            double openPrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
            datetime openTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
            string comment = HistoryDealGetString(dealTicket, DEAL_COMMENT);
            
            // Get exit deal info
            double closePrice = HistoryDealGetDouble(exitTicket, DEAL_PRICE);
            datetime closeTime = (datetime)HistoryDealGetInteger(exitTicket, DEAL_TIME);
            double commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION) + HistoryDealGetDouble(exitTicket, DEAL_COMMISSION);
            double swap = HistoryDealGetDouble(dealTicket, DEAL_SWAP) + HistoryDealGetDouble(exitTicket, DEAL_SWAP);
            
            if(dealCount > 0) json += ",";
            json += "{";
            json += "\"ticket\":" + IntegerToString(posId) + ",";
            json += "\"symbol\":\"" + symbol + "\",";
            json += "\"type\":\"" + (dealType == DEAL_TYPE_BUY ? "buy" : "sell") + "\",";
            json += "\"volume\":" + DoubleToString(volume, 2) + ",";
            json += "\"open_price\":" + DoubleToString(openPrice, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)) + ",";
            json += "\"close_price\":" + DoubleToString(closePrice, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)) + ",";
            json += "\"open_time\":" + IntegerToString(openTime) + ",";
            json += "\"close_time\":" + IntegerToString(closeTime) + ",";
            json += "\"sl\":0,";
            json += "\"tp\":0,";
            json += "\"commission\":" + DoubleToString(commission, 2) + ",";
            json += "\"swap\":" + DoubleToString(swap, 2) + ",";
            json += "\"comment\":\"" + EscapeJson(comment) + "\"";
            json += "}";
            dealCount++;
         }
      }
      
      g_lastHistoryCheck = TimeCurrent();
   }
   
   json += "]";
   json += "}";
   
   Print("Payload: ", posCount, " open positions, ", dealCount, " closed deals");
   
   return json;
}

//+------------------------------------------------------------------+
//| Find the exit deal for a position                                  |
//+------------------------------------------------------------------+
ulong FindExitDeal(ulong positionId, datetime fromTime)
{
   if(!HistorySelect(fromTime, TimeCurrent())) return 0;
   
   int total = HistoryDealsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket == 0) continue;
      
      ulong posId = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      long entry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      
      if(posId == positionId && entry == DEAL_ENTRY_OUT)
         return ticket;
   }
   return 0;
}

//+------------------------------------------------------------------+
//| Escape special JSON characters                                     |
//+------------------------------------------------------------------+
string EscapeJson(string text)
{
   StringReplace(text, "\\", "\\\\");
   StringReplace(text, "\"", "\\\"");
   StringReplace(text, "\n", "\\n");
   StringReplace(text, "\r", "\\r");
   StringReplace(text, "\t", "\\t");
   return text;
}

//+------------------------------------------------------------------+
//| Send JSON to API via WebRequest                                    |
//+------------------------------------------------------------------+
int SendToAPI(string json, string &response)
{
   string headers = "Content-Type: application/json\r\n";
   
   char postData[];
   char resultData[];
   string resultHeaders;
   
   // Convert string to char array
   StringToCharArray(json, postData, 0, StringLen(json));
   
   // Send POST request
   ResetLastError();
   int httpCode = WebRequest(
      "POST",
      API_URL,
      headers,
      5000,        // timeout ms
      postData,
      resultData,
      resultHeaders
   );
   
   if(httpCode == -1)
   {
      int err = GetLastError();
      if(err == 4060) // WebRequest not allowed
      {
         Print("ERROR: Add this URL to allowed WebRequest URLs:");
         Print("Tools > Options > Expert Advisors > Allow WebRequest for listed URL");
         Print("URL: ", API_URL);
         response = "WebRequest not allowed. Add URL to allowed list.";
      }
      else
      {
         response = "WebRequest error: " + IntegerToString(err);
      }
      return -1;
   }
   
   // Convert response
   response = CharArrayToString(resultData);
   
   return httpCode;
}
//+------------------------------------------------------------------+
