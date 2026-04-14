/**
 * ═══════════════════════════════════════════════════════════════
 *  MP-IMS — Google Apps Script Backend
 *  MANOJ PARIHAR MEDICAL — Inventory Management System
 *  File: Code.gs
 *  Deploy as: Web App → Execute as Me → Anyone (or Anyone with Google account)
 * ═══════════════════════════════════════════════════════════════
 */

// ─── SHEET NAMES ───────────────────────────────────────────────
const SHEETS = {
  ITEMS:         'Items',
  PARTIES:       'Parties',
  VENDORS:       'Vendors',
  STOCK_IN:      'StockIn',
  STOCK_OUT:     'StockOut',
  ORDERS:        'Orders',
  TRANSIT:       'TransitOrders',
  USERS:         'Users',
  AUDIT:         'AuditLog'
};

// ─── CORS HEADERS ──────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── MAIN ROUTER ───────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action || '';
  try {
    switch(action) {
      case 'ping':           return jsonResponse({status:'ok', timestamp: new Date().toISOString()});
      case 'getItems':       return jsonResponse({status:'ok', data: getSheetData(SHEETS.ITEMS)});
      case 'getParties':     return jsonResponse({status:'ok', data: getSheetData(SHEETS.PARTIES)});
      case 'getVendors':     return jsonResponse({status:'ok', data: getSheetData(SHEETS.VENDORS)});
      case 'getStockIn':     return jsonResponse({status:'ok', data: getSheetData(SHEETS.STOCK_IN)});
      case 'getStockOut':    return jsonResponse({status:'ok', data: getSheetData(SHEETS.STOCK_OUT)});
      case 'getOrders':      return jsonResponse({status:'ok', data: getSheetData(SHEETS.ORDERS)});
      case 'getTransit':     return jsonResponse({status:'ok', data: getSheetData(SHEETS.TRANSIT)});
      case 'getUsers':       return jsonResponse({status:'ok', data: getSheetData(SHEETS.USERS)});
      case 'getDashboardStats': return jsonResponse({status:'ok', data: getDashboardStats()});
      default:               return jsonResponse({status:'error', message: 'Unknown action: ' + action});
    }
  } catch(err) {
    return jsonResponse({status:'error', message: err.toString()});
  }
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch(err) {
    return jsonResponse({status:'error', message:'Invalid JSON payload'});
  }

  const action = payload.action || '';

  try {
    switch(action) {
      // Items
      case 'addItem':       return jsonResponse(addRow(SHEETS.ITEMS, payload.data));
      case 'updateItem':    return jsonResponse(updateRow(SHEETS.ITEMS, payload.id, payload.data));
      case 'deleteItem':    return jsonResponse(deleteRow(SHEETS.ITEMS, payload.id));

      // Parties
      case 'addParty':      return jsonResponse(addRow(SHEETS.PARTIES, payload.data));
      case 'updateParty':   return jsonResponse(updateRow(SHEETS.PARTIES, payload.id, payload.data));
      case 'deleteParty':   return jsonResponse(deleteRow(SHEETS.PARTIES, payload.id));

      // Vendors
      case 'addVendor':     return jsonResponse(addRow(SHEETS.VENDORS, payload.data));
      case 'updateVendor':  return jsonResponse(updateRow(SHEETS.VENDORS, payload.id, payload.data));
      case 'deleteVendor':  return jsonResponse(deleteRow(SHEETS.VENDORS, payload.id));

      // Stock
      case 'addStockIn':    return jsonResponse(addStockIn(payload.data));
      case 'addStockOut':   return jsonResponse(addStockOut(payload.data));
      case 'deleteStockIn': return jsonResponse(deleteRow(SHEETS.STOCK_IN, payload.id));
      case 'deleteStockOut':return jsonResponse(deleteRow(SHEETS.STOCK_OUT, payload.id));

      // Orders
      case 'addOrder':      return jsonResponse(addRow(SHEETS.ORDERS, payload.data));
      case 'updateOrder':   return jsonResponse(updateRow(SHEETS.ORDERS, payload.id, payload.data));
      case 'deleteOrder':   return jsonResponse(deleteRow(SHEETS.ORDERS, payload.id));

      // Users
      case 'addUser':       return jsonResponse(addRow(SHEETS.USERS, payload.data));
      case 'updateUser':    return jsonResponse(updateRow(SHEETS.USERS, payload.id, payload.data));
      case 'deleteUser':    return jsonResponse(deleteRow(SHEETS.USERS, payload.id));

      // Auth
      case 'login':         return jsonResponse(loginUser(payload.username, payload.password));

      // Audit
      case 'addAuditLog':   return jsonResponse(addRow(SHEETS.AUDIT, payload.data));

      default:              return jsonResponse({status:'error', message:'Unknown action: ' + action});
    }
  } catch(err) {
    return jsonResponse({status:'error', message: err.toString()});
  }
}

// ═══════════════════════════════════════════════
//   SHEET UTILITIES
// ═══════════════════════════════════════════════

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheetHeaders(sheet, name);
  }
  return sheet;
}

function initSheetHeaders(sheet, name) {
  const headers = {
    [SHEETS.ITEMS]:    ['id','code','name','generic','category','unit','hsn','gst','mrp','purchaseRate','stock','reorder','rack','desc','createdAt'],
    [SHEETS.PARTIES]:  ['id','code','name','type','gst','address','city','state','phone','email','credit','outstanding','createdAt'],
    [SHEETS.VENDORS]:  ['id','code','name','contact','gst','address','phone','email','categories','payment','rating','createdAt'],
    [SHEETS.STOCK_IN]: ['id','date','item','vendor','qty','rate','total','invoice','batch','createdAt'],
    [SHEETS.STOCK_OUT]:['id','date','item','party','qty','rate','discount','total','invoice','createdAt'],
    [SHEETS.ORDERS]:   ['id','no','vendor','item','qty','expected','status','createdAt'],
    [SHEETS.TRANSIT]:  ['id','orderId','vendor','item','shippedQty','transitStart','expectedArrival','courier','status','createdAt'],
    [SHEETS.USERS]:    ['id','name','username','password','role','status','email','lastLogin','createdAt'],
    [SHEETS.AUDIT]:    ['id','action','user','time']
  };
  if (headers[name]) {
    sheet.appendRow(headers[name]);
    sheet.getRange(1,1,1,headers[name].length).setFontWeight('bold').setBackground('#1e3a5f').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function addRow(sheetName, data) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const id = Utilities.getUuid();
  const now = new Date().toISOString();
  data.id = id;
  data.createdAt = now;
  const row = headers.map(h => data[h] !== undefined ? data[h] : '');
  sheet.appendRow(row);
  return {status:'ok', id, message:'Row added successfully'};
}

function updateRow(sheetName, id, data) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf('id');
  if (idIdx === -1) return {status:'error', message:'No id column found'};

  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idIdx]) === String(id)) {
      headers.forEach((h, colIdx) => {
        if (data[h] !== undefined) {
          sheet.getRange(i+1, colIdx+1).setValue(data[h]);
        }
      });
      return {status:'ok', message:'Row updated'};
    }
  }
  return {status:'error', message:'Row not found with id: ' + id};
}

function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf('id');
  if (idIdx === -1) return {status:'error', message:'No id column'};

  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idIdx]) === String(id)) {
      sheet.deleteRow(i+1);
      return {status:'ok', message:'Row deleted'};
    }
  }
  return {status:'error', message:'Row not found'};
}

// ═══════════════════════════════════════════════
//   BUSINESS LOGIC
// ═══════════════════════════════════════════════

function addStockIn(data) {
  // Add to StockIn sheet
  const result = addRow(SHEETS.STOCK_IN, data);
  // Update stock in Items sheet
  updateItemStock(data.item, +data.qty, 'add');
  // Log audit
  addRow(SHEETS.AUDIT, {id:Utilities.getUuid(), action:'Stock In: '+data.item+' x'+data.qty, user:data.createdBy||'system', time: new Date().toISOString()});
  return result;
}

function addStockOut(data) {
  // Check stock availability
  const items = getSheetData(SHEETS.ITEMS);
  const item = items.find(i => i.name === data.item);
  if (item && +item.stock < +data.qty) {
    return {status:'error', message: 'Insufficient stock. Available: '+item.stock};
  }
  // Add to StockOut sheet
  const result = addRow(SHEETS.STOCK_OUT, data);
  // Reduce stock
  updateItemStock(data.item, +data.qty, 'subtract');
  // Log audit
  addRow(SHEETS.AUDIT, {id:Utilities.getUuid(), action:'Stock Out: '+data.item+' x'+data.qty, user:data.createdBy||'system', time: new Date().toISOString()});
  return result;
}

function updateItemStock(itemName, qty, operation) {
  const sheet = getSheet(SHEETS.ITEMS);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const nameIdx = headers.indexOf('name');
  const stockIdx = headers.indexOf('stock');
  if (nameIdx === -1 || stockIdx === -1) return;

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][nameIdx] === itemName) {
      const currentStock = +allData[i][stockIdx] || 0;
      const newStock = operation === 'add' ? currentStock + qty : Math.max(0, currentStock - qty);
      sheet.getRange(i+1, stockIdx+1).setValue(newStock);
      break;
    }
  }
}

function loginUser(username, password) {
  const users = getSheetData(SHEETS.USERS);
  const user = users.find(u => u.username === username && u.password === password && u.status === 'Active');
  if (user) {
    // Update last login
    updateRow(SHEETS.USERS, user.id, {lastLogin: new Date().toISOString()});
    return {status:'ok', user: {id:user.id, name:user.name, username:user.username, role:user.role, email:user.email}};
  }
  return {status:'error', message:'Invalid credentials'};
}

function getDashboardStats() {
  const items = getSheetData(SHEETS.ITEMS);
  const stockIn = getSheetData(SHEETS.STOCK_IN);
  const stockOut = getSheetData(SHEETS.STOCK_OUT);
  const orders = getSheetData(SHEETS.ORDERS);
  const vendors = getSheetData(SHEETS.VENDORS);

  const totalItems = items.length;
  const totalValue = items.reduce((s, i) => s + (+i.stock||0) * (+i.purchaseRate||0), 0);
  const lowStockCount = items.filter(i => +i.stock > 0 && +i.stock <= +i.reorder).length;
  const outStockCount = items.filter(i => +i.stock === 0).length;
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;

  // Monthly trend (last 6 months)
  const months = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    const label = d.toLocaleString('default', {month:'short'});
    const mKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const inAmt = stockIn.filter(s => String(s.date||'').startsWith(mKey)).reduce((a,s)=>a+(+s.total||0),0);
    const outAmt = stockOut.filter(s => String(s.date||'').startsWith(mKey)).reduce((a,s)=>a+(+s.total||0),0);
    months.push({label, in: inAmt, out: outAmt});
  }

  // Category distribution
  const catDist = {};
  items.forEach(i => { catDist[i.category] = (catDist[i.category]||0) + (+i.stock||0); });

  return {
    totalItems, totalValue, lowStockCount, outStockCount, pendingOrders,
    activeVendors: vendors.length, monthlyTrend: months, categoryDistribution: catDist
  };
}

// ═══════════════════════════════════════════════
//   SETUP: Initialize all sheets
// ═══════════════════════════════════════════════
function setupSheets() {
  Object.values(SHEETS).forEach(name => {
    getSheet(name);
    Logger.log('Initialized sheet: ' + name);
  });
  // Add default admin user if Users sheet is empty
  const users = getSheetData(SHEETS.USERS);
  if (users.length === 0) {
    addRow(SHEETS.USERS, {
      name: 'Admin User', username: 'admin', password: 'admin123',
      role: 'Admin', status: 'Active', email: 'admin@mpmedical.com',
      lastLogin: ''
    });
    Logger.log('Default admin user created: admin / admin123');
  }
  SpreadsheetApp.getUi().alert('✅ MP-IMS Setup Complete!\n\nAll sheets initialized.\nDefault admin: admin / admin123\n\nNow deploy this script as a Web App.');
}

// ═══════════════════════════════════════════════
//   MENU
// ═══════════════════════════════════════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏥 MP-IMS')
    .addItem('Setup All Sheets', 'setupSheets')
    .addItem('View Dashboard Stats', 'showStats')
    .addSeparator()
    .addItem('Export All Data as JSON', 'exportAllJSON')
    .addToUi();
}

function showStats() {
  const stats = getDashboardStats();
  const msg = `📊 Dashboard Stats\n\n` +
    `Total Items: ${stats.totalItems}\n` +
    `Total Stock Value: ₹${stats.totalValue.toLocaleString('en-IN')}\n` +
    `Low Stock Alerts: ${stats.lowStockCount}\n` +
    `Out of Stock: ${stats.outStockCount}\n` +
    `Pending Orders: ${stats.pendingOrders}\n` +
    `Active Vendors: ${stats.activeVendors}`;
  SpreadsheetApp.getUi().alert(msg);
}

function exportAllJSON() {
  const data = {};
  Object.entries(SHEETS).forEach(([key, name]) => {
    data[key.toLowerCase()] = getSheetData(name);
  });
  const json = JSON.stringify(data, null, 2);
  const file = DriveApp.createFile('MP-IMS-Export-' + new Date().toISOString().split('T')[0] + '.json', json, 'application/json');
  SpreadsheetApp.getUi().alert('✅ Exported!\n\nFile saved to Google Drive:\n' + file.getName());
}
